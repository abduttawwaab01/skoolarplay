import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { isFeatureUnlocked } from '@/lib/premium'
import { getLevelInfo } from '@/lib/level-system'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check premium feature access
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true, unlockedFeatures: true }
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse unlockedFeatures from JSON string
    let unlockedFeatures: string[] = []
    try {
      unlockedFeatures = JSON.parse(user.unlockedFeatures || '[]')
    } catch {
      unlockedFeatures = []
    }

    // Convert Date to string for isFeatureUnlocked
    const premiumExpiresAtStr = user.premiumExpiresAt ? user.premiumExpiresAt.toISOString() : null
    const hasAccess = isFeatureUnlocked(
      user.isPremium,
      premiumExpiresAtStr,
      unlockedFeatures,
      'BOSS_BATTLES'
    )
    if (!hasAccess) {
      return NextResponse.json({ error: 'Premium feature required' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { answers } = body as {
      answers: Array<{ questionId: string; answer: string }>
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    const boss = await db.bossBattle.findUnique({ where: { id } })
    if (!boss) return NextResponse.json({ error: 'Boss battle not found' }, { status: 404 })

    // Fetch all questions referenced in the submitted answers for server-side verification
    const questionIds = answers.map((a) => a.questionId)
    const questions = await db.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correctAnswer: true, type: true, points: true },
    })

    const correctAnswerMap = new Map<string, { answer: string; type: string; points: number }>()
    for (const q of questions) {
      correctAnswerMap.set(q.id, { answer: q.correctAnswer, type: q.type, points: q.points })
    }

    // Calculate actual damage based on verified correct answers
    let actualDamage = 0
    let actualScore = 0

     let correctCount = 0
     let incorrectCount = 0

     for (const submitted of answers) {
       const questionData = correctAnswerMap.get(submitted.questionId)
       if (!questionData) continue

       const correctAnswer = JSON.parse(questionData.answer)
       let isCorrect = false

       if (questionData.type === 'MCQ' || questionData.type === 'TRUE_FALSE') {
         isCorrect = submitted.answer === correctAnswer || (Array.isArray(correctAnswer) && correctAnswer.includes(submitted.answer))
       } else if (questionData.type === 'FILL_BLANK') {
         const correctStr = typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer)
         isCorrect = submitted.answer?.trim().toLowerCase() === correctStr.trim().toLowerCase()
       } else {
         isCorrect = JSON.stringify(submitted.answer) === JSON.stringify(correctAnswer)
       }

       if (isCorrect) {
         correctCount++
         const points = questionData.points || 10
         actualDamage += points
         actualScore += points
       } else {
         incorrectCount++
       }
     }

    // Cap damage and score to boss HP
    actualDamage = Math.min(actualDamage, boss.hp)
    actualScore = Math.min(actualScore, boss.hp)

    // Only consider completed if actual damage is enough to defeat the boss
    const actuallyCompleted = actualDamage >= boss.hp

    // Wrap entire operation in a transaction
    const result = await db.$transaction(async (tx) => {
      // Check existing completion
      const existing = await tx.bossBattleCompletion.findUnique({
        where: { userId_bossBattleId: { userId, bossBattleId: id } },
      })

      let xpEarned = 0
      let gemsEarned = 0

      // Only award rewards if newly completed (prevent re-reward exploit)
      if (actuallyCompleted && !existing?.completed) {
        xpEarned = boss.xpReward
        gemsEarned = boss.gemReward

        // Get current user XP before increment for level calculation
        const currentUser = await tx.user.findUnique({
          where: { id: userId },
          select: { xp: true, level: true }
        })
        if (!currentUser) {
          throw new Error('User not found during transaction')
        }

        const currentXp = currentUser.xp
        const newXp = currentXp + xpEarned
        const levelInfo = getLevelInfo(newXp)

        await tx.user.update({
          where: { id: userId },
          data: {
            xp: newXp,
            level: levelInfo.level,
            gems: { increment: gemsEarned },
          },
        })
      }

      if (existing) {
        await tx.bossBattleCompletion.update({
          where: { id: existing.id },
          data: {
            damageDealt: Math.max(existing.damageDealt, actualDamage),
            score: Math.max(existing.score, actualScore),
            completed: existing.completed || actuallyCompleted || false,
            completedAt: actuallyCompleted && !existing.completed ? new Date() : existing.completedAt,
          },
        })
      } else {
        await tx.bossBattleCompletion.create({
          data: {
            userId,
            bossBattleId: id,
            damageDealt: actualDamage,
            completed: actuallyCompleted || false,
            score: actualScore,
            completedAt: actuallyCompleted ? new Date() : null,
          },
        })
       }

       // Deduct hearts for incorrect answers (server-side enforcement)
       const currentHeartsRes = await tx.user.findUnique({
         where: { id: userId },
         select: { hearts: true },
       })
       if (currentHeartsRes) {
         const currentHearts = currentHeartsRes.hearts ?? 0
         const newHearts = Math.max(0, currentHearts - incorrectCount)
         await tx.user.update({
           where: { id: userId },
           data: { hearts: newHearts },
         })
       }

       const updatedUser = await tx.user.findUnique({ where: { id: userId } })

      return { xpEarned, gemsEarned, updatedUser }
    })

     return NextResponse.json({
       success: true,
       completed: actuallyCompleted,
       damageDealt: actualDamage,
       score: actualScore,
       xpEarned: result.xpEarned,
       gemsEarned: result.gemsEarned,
       heartsLost: incorrectCount,
       user: {
         gems: result.updatedUser?.gems || 0,
         xp: result.updatedUser?.xp || 0,
         hearts: result.updatedUser?.hearts || 0,
       },
     })
  } catch (error) {
    console.error('Complete boss battle error:', error)
    return NextResponse.json({ error: 'Failed to complete boss battle' }, { status: 500 })
  }
}
