import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

     // Import premium check
     const { isFeatureUnlocked } = await import('@/lib/premium')
     // Convert Date to string or null for isFeatureUnlocked
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

     const boss = await db.bossBattle.findUnique({ 
       where: { id, isActive: true } 
     })
     if (!boss) return NextResponse.json({ error: 'Boss battle not found or inactive' }, { status: 404 })

    // Get random questions for the boss battle
     // Get questions filtered by module if specified, else by course
     const questionWhere = boss.moduleId
       ? { lesson: { moduleId: boss.moduleId } }
       : { lesson: { module: { courseId: boss.courseId } } }

     const questions = await db.question.findMany({
       where: questionWhere,
       take: Math.min(10, boss.hp / 10),
       orderBy: { order: 'asc' },
     })

     // Check if we have enough questions to make battle winnable
     const totalPointsAvailable = questions.reduce((sum, q) => sum + (q.points || 10), 0)
     const neededQuestions = Math.ceil(boss.hp / (questions[0]?.points || 10))

     // If not enough questions from module/course, supplement from any source
     if (questions.length < neededQuestions) {
       const additionalCount = neededQuestions - questions.length
       const anyQuestions = await db.question.findMany({
         take: additionalCount + 5, // Get extra to ensure enough
         orderBy: { createdAt: 'desc' },
       })
       // Combine and deduplicate
       const combined = [...questions]
       for (const q of anyQuestions) {
         if (!combined.find(c => c.id === q.id)) {
           combined.push(q)
         }
       }
       const finalQuestions = combined.slice(0, neededQuestions)
       return NextResponse.json({
         success: true,
         boss: {
           id: boss.id,
           title: boss.title,
           description: boss.description,
           difficulty: boss.difficulty,
           hp: boss.hp,
           xpReward: boss.xpReward,
           gemReward: boss.gemReward,
           timeLimit: boss.timeLimit,
         },
         questions: finalQuestions.map((q) => ({
           id: q.id,
           question: q.question,
           type: q.type,
           options: q.options,
           correctAnswer: q.correctAnswer,
           points: q.points,
         })),
       })
     }

     return NextResponse.json({
       success: true,
       boss: {
         id: boss.id,
         title: boss.title,
         description: boss.description,
         difficulty: boss.difficulty,
         hp: boss.hp,
         xpReward: boss.xpReward,
         gemReward: boss.gemReward,
         timeLimit: boss.timeLimit,
       },
       questions: questions.map((q) => ({
         id: q.id,
         question: q.question,
         type: q.type,
         options: q.options,
         correctAnswer: q.correctAnswer,
         points: q.points,
       })),
     })
  } catch (error) {
    console.error('Start boss battle error:', error)
    return NextResponse.json({ error: 'Failed to start boss battle' }, { status: 500 })
  }
}
