import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { calculateXpBoost } from '@/lib/xp-boost'
import { checkLevelUp, getLevelInfo } from '@/lib/level-system'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { sendLevelUpEmail, sendStreakMilestoneEmail } from '@/lib/email-helpers'
import { compareAnswers } from '@/lib/answer-checker'

function detectCourseType(courseName: string, keywords: {
  waec: string[], jamb: string[], neco: string[], vocational: string[], professional: string[]
}): string {
  const nameLower = courseName.toLowerCase()
  
  for (const keyword of keywords.waec) {
    if (nameLower.includes(keyword.toLowerCase())) return 'WAEC'
  }
  for (const keyword of keywords.jamb) {
    if (nameLower.includes(keyword.toLowerCase())) return 'JAMB'
  }
  for (const keyword of keywords.neco) {
    if (nameLower.includes(keyword.toLowerCase())) return 'NECO'
  }
  for (const keyword of keywords.vocational) {
    if (nameLower.includes(keyword.toLowerCase())) return 'VOCATIONAL'
  }
  for (const keyword of keywords.professional) {
    if (nameLower.includes(keyword.toLowerCase())) return 'PROFESSIONAL'
  }
  
  return 'GENERAL'
}

async function awardAchievement(
  userId: string,
  achievement: {
    id: string
    title: string
    icon: string | null
    xpReward: number
    gemReward: number
  }
): Promise<{ awarded: boolean; xpReward: number; gemReward: number }> {
  try {
    return await db.$transaction(async (tx) => {
      const existing = await tx.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      })
      
      if (existing) {
        return { awarded: false, xpReward: 0, gemReward: 0 }
      }
      
      await tx.userAchievement.create({
        data: { userId, achievementId: achievement.id },
      })
      
      let xpAwarded = 0
      let gemsAwarded = 0
      
      if (achievement.xpReward > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: achievement.xpReward } },
        })
        xpAwarded = achievement.xpReward
      }
      
      if (achievement.gemReward > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { gems: { increment: achievement.gemReward } },
        })
        
        await tx.gemTransaction.create({
          data: {
            userId,
            amount: achievement.gemReward,
            type: 'ACHIEVEMENT',
            source: 'achievement',
            description: `Earned achievement: ${achievement.title}`,
            relatedId: achievement.id,
          },
        })
        gemsAwarded = achievement.gemReward
      }
      
      return { awarded: true, xpReward: xpAwarded, gemReward: gemsAwarded }
    })
  } catch (error) {
    console.error('Error awarding achievement:', error)
    return { awarded: false, xpReward: 0, gemReward: 0 }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimit = await rateLimiter.checkLimit(
      `lesson:${userId}`,
      RATE_LIMITS.LESSON_COMPLETE_PER_MINUTE
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many lesson completions. Please wait.', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 60) } }
      )
    }

    const body = await request.json()
    const { answers, timeSpent } = body as {
      answers: Array<{ questionId: string; answer: string }>
      timeSpent?: number
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    const isReview = id.startsWith('review_')
    let lesson: any

    if (isReview) {
      const moduleId = id.replace('review_', '')
      const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        select: { id: true, courseId: true }
      })
      if (!moduleData) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }
      lesson = {
        id,
        xpReward: 20,
        gemReward: 3,
        moduleId: moduleData.id,
        order: 999,
      }
    } else {
      lesson = await db.lesson.findUnique({
        where: { id, isActive: true },
        select: { id: true, xpReward: true, gemReward: true, moduleId: true, order: true },
      })
    }

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // ===== ENROLLMENT CHECK =====
    // Verify user is enrolled in the course before allowing completion
    const moduleData = await db.module.findUnique({
      where: { id: lesson.moduleId },
      select: { courseId: true },
    })

    if (moduleData) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: moduleData.courseId,
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          { error: 'You must enroll in this course before taking lessons. Please enroll first.' },
          { status: 403 }
        )
      }
    }

    // ===== LESSON ORDER ENFORCEMENT =====
    // Check admin settings for lesson order enforcement
    const adminSettings = await db.adminSettings.findFirst()
    const enforceLessonOrder = adminSettings?.enforceLessonOrder !== false
    const allowLessonSkip = adminSettings?.allowLessonSkip === true

    if (enforceLessonOrder && lesson.moduleId && !isReview) {
      // Check if user is premium and skip is allowed
      const userPremium = await db.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      })
      const isPremium = userPremium?.isPremium || false

      // Premium users can skip only if admin allows it
      if (!isPremium || !allowLessonSkip) {
        // Get the module this lesson belongs to
        const moduleData = await db.module.findUnique({
          where: { id: lesson.moduleId },
          select: { courseId: true, order: true },
        })

        if (moduleData) {
          // Get all modules in order for this course
          const allModules = await db.module.findMany({
            where: { courseId: moduleData.courseId },
            orderBy: { order: 'asc' },
            select: { id: true, order: true },
          })

          // Find the current module index
          const currentModuleIdx = allModules.findIndex(m => m.id === lesson.moduleId)

          // OPTIMIZATION: Batch fetch all previous lessons and their progress in 2 queries
          const allPrevModuleIds = allModules.slice(0, currentModuleIdx).map(m => m.id)
          
          let allPrevLessonIds: string[] = []
          if (allPrevModuleIds.length > 0) {
            const prevLessons = await db.lesson.findMany({
              where: { moduleId: { in: allPrevModuleIds }, isActive: true },
              select: { id: true },
            })
            allPrevLessonIds = prevLessons.map(l => l.id)
          }

          // Also get previous lessons in same module before current lesson
          const sameModuleLessons = await db.lesson.findMany({
            where: { moduleId: lesson.moduleId, isActive: true },
            orderBy: { order: 'asc' },
            select: { id: true },
          })
          const currentLessonIdx = sameModuleLessons.findIndex(l => l.id === lesson.id)
          const sameModulePrevIds = sameModuleLessons.slice(0, currentLessonIdx).map(l => l.id)
          
          // Combine all previous lesson IDs
          const requiredCompletedLessonIds = [...allPrevLessonIds, ...sameModulePrevIds]

          // Batch fetch all progress in ONE query
          let canProceed = true
          if (requiredCompletedLessonIds.length > 0) {
            const progressRecords = await db.lessonProgress.findMany({
              where: { 
                userId,
                lessonId: { in: requiredCompletedLessonIds },
                completed: true,
              },
              select: { lessonId: true },
            })
            const completedIds = new Set(progressRecords.map(p => p.lessonId))
            canProceed = requiredCompletedLessonIds.every(id => completedIds.has(id))
          }

          if (!canProceed) {
            return NextResponse.json({
              error: 'Lesson locked: You must complete and pass all previous lessons before attempting this one.',
              code: 'LESSON_LOCKED',
            }, { status: 403 })
          }
        }
      }
    }

    // Fetch the lesson's questions with correct answers for server-side verification
    let lessonQuestions
    if (isReview) {
      const questionIds = answers.map(a => a.questionId)
      lessonQuestions = await db.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, correctAnswer: true, type: true, question: true, options: true, explanation: true, points: true },
      })
    } else {
      lessonQuestions = await db.question.findMany({
        where: { lessonId: id, isActive: true },
        select: { id: true, correctAnswer: true, type: true, question: true, options: true, explanation: true, points: true },
      })
    }

    if (lessonQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this session' }, { status: 400 })
    }

    // Build a map of question ID -> correct answer + details for quick lookup
    const questionDataMap = new Map<string, { answer: string; type: string; question: string; options: string | null; explanation: string | null; points: number }>()
    for (const q of lessonQuestions) {
      questionDataMap.set(q.id, { answer: q.correctAnswer, type: q.type, question: q.question, options: q.options, explanation: q.explanation, points: q.points })
    }

    // Verify each submitted answer against the correct answer
    let correctCount = 0
    const verifiedAnswers: Array<{ questionId: string; answer: string; isCorrect: boolean }> = []

    for (const submitted of answers) {
      const questionData = questionDataMap.get(submitted.questionId)
      if (!questionData) {
        continue
      }

      const isCorrect = compareAnswers(
        questionData.type,
        submitted.answer,
        questionData.answer
      )

      if (isCorrect) correctCount++
      verifiedAnswers.push({
        questionId: submitted.questionId,
        answer: submitted.answer,
        isCorrect,
      })
    }

     // Calculate score server-side
     const totalQuestions = lessonQuestions.length
     const percentage = Math.round((correctCount / totalQuestions) * 100)
     // Hearts lost: count of incorrect answers (each wrong answer loses a heart)
     const incorrectCount = totalQuestions - correctCount

    // ===== CUTOFF SCORE ENFORCEMENT =====
    // Get course cutoff score
    let cutoffScore = 70 // Default cutoff
    let courseId: string | null = null
    let courseDifficulty = 'BEGINNER'
    let courseIsPremium = false
    let userIsPremium = false

    if (lesson.moduleId) {
      const moduleData = await db.module.findUnique({
        where: { id: lesson.moduleId },
        select: { courseId: true },
      })
      if (moduleData) {
        courseId = moduleData.courseId
        const courseData = await db.course.findUnique({
          where: { id: courseId },
          select: { cutoffScore: true, difficulty: true, isPremium: true },
        })
        if (courseData) {
          cutoffScore = courseData.cutoffScore || 70
          courseDifficulty = courseData.difficulty || 'BEGINNER'
          courseIsPremium = courseData.isPremium || false
        }
      }
    }

    // Check user premium status
    const userPremium = await db.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    })
    userIsPremium = userPremium?.isPremium || false

    // Determine pass using cutoff score
    const isPassed = percentage >= cutoffScore
    const passedWithCutoff = isPassed
    const cutoffEnforced = cutoffScore > 60

    // Check existing progress to determine if rewards should be awarded
    // For reviews, we always allow earning rewards if they pass, but maybe limited
    let existingProgress: any = null
    if (!isReview) {
      existingProgress = await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: id } },
        select: { completed: true, bestScore: true, completedAt: true, timeSpent: true },
      })
    }

    const previousBestScore = existingProgress?.bestScore ?? 0
    const isFirstCompletion = !existingProgress?.completed
    const scoreImproved = percentage > previousBestScore

    // Only award rewards on first completion or if the new score improves bestScore
    const shouldAwardRewards = isPassed && (isFirstCompletion || scoreImproved)
    const finalXp = shouldAwardRewards ? lesson.xpReward : 0
    const finalGems = shouldAwardRewards ? lesson.gemReward : 0

     // Get current user data (include streak, premium, and xpMultiplier for XP boost)
     const currentUser = await db.user.findUnique({
       where: { id: userId },
       select: { xp: true, level: true, streak: true, isPremium: true, hearts: true, xpMultiplier: true },
     })

    const previousXp = currentUser?.xp || 0
    const previousLevel = currentUser?.level || 1

    // ===== XP BOOST SYSTEM =====
    const xpBoostResult = calculateXpBoost(finalXp, {
      streak: currentUser?.streak || 0,
      isPremium: currentUser?.isPremium || false,
      xpMultiplier: currentUser?.xpMultiplier || 1.0,
    })
    const boostedXp = xpBoostResult.totalXp

    // ===== LEVEL-UP SYSTEM =====
    const projectedTotalXp = previousXp + boostedXp
    const newLevelInfo = getLevelInfo(projectedTotalXp)
    const newLevel = newLevelInfo.level
    const leveledUp = newLevel > previousLevel

    // ===== CUTOFF FAILURE: Return early without saving completion =====
    if (!isPassed) {
      // Still save the attempt and best score, but don't mark as completed
      await db.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: id } },
        create: {
          userId,
          lessonId: id,
          completed: false,
          score: percentage,
          attempts: 1,
          bestScore: percentage,
          timeSpent: timeSpent || 0,
        },
        update: {
          score: percentage,
          attempts: { increment: 1 },
          bestScore: Math.max(previousBestScore, percentage),
          timeSpent: timeSpent || existingProgress?.timeSpent || 0,
        },
      })

      // Build lesson report even for failed attempts
      const failReport = {
        timeSpent: timeSpent || 0,
        totalQuestions,
        correctCount,
        percentage,
        isPassed: false,
        cutoffScore,
        questions: lessonQuestions.map((q, index) => {
          const submitted = verifiedAnswers.find(a => a.questionId === q.id)
          let correctAnswerParsed: any
          try { correctAnswerParsed = JSON.parse(q.correctAnswer) } catch { correctAnswerParsed = q.correctAnswer }
          const userAnswer = submitted?.answer || null
          const isCorrect = submitted?.isCorrect || false
          let options: any = null
          if (q.options) { try { options = JSON.parse(q.options) } catch { options = null } }
          return {
            questionId: q.id,
            questionNumber: index + 1,
            question: q.question,
            type: q.type,
            options,
            correctAnswer: correctAnswerParsed,
            userAnswer: userAnswer,
            isCorrect,
            explanation: q.explanation,
            points: q.points,
          }
        }),
        strengths: lessonQuestions
          .map((q, i) => ({ index: i, isCorrect: verifiedAnswers.find(a => a.questionId === q.id)?.isCorrect || false, type: q.type }))
          .filter(q => q.isCorrect)
          .map(q => ({ questionType: q.type, questionNumber: q.index + 1 })),
        weaknesses: lessonQuestions
          .map((q, i) => ({ index: i, isCorrect: verifiedAnswers.find(a => a.questionId === q.id)?.isCorrect || false, type: q.type, explanation: q.explanation }))
          .filter(q => !q.isCorrect)
          .map(q => ({ questionType: q.type, questionNumber: q.index + 1, explanation: q.explanation })),
        recommendation: percentage >= cutoffScore - 10
          ? `Almost there! You need ${cutoffScore}% to pass. Focus on the weak areas below and try again.`
          : `Keep practicing! You need ${cutoffScore}% to pass this lesson. Review the lesson content thoroughly.`,
      }

      return NextResponse.json({
        success: true,
        passed: false,
        score: percentage,
        cutoffScore,
        message: `Score ${percentage}% is below the cutoff of ${cutoffScore}%. Retake required.`,
        xpEarned: 0,
        gemsEarned: 0,
        xpBoost: null,
        leveledUp: false,
        newLevel: previousLevel,
        levelUpRewards: null,
        achievementsEarned: [],
        certificateEarned: null,
        lessonReport: failReport,
      })
    }

    // Upsert lesson progress (only for real lessons, not reviews)
    let progress = await db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: id } },
    })
    if (!isReview) {
      if (progress) {
        progress = await db.lessonProgress.update({
          where: { userId_lessonId: { userId, lessonId: id } },
          data: {
            completed: true,
            score: percentage,
            attempts: { increment: 1 },
            bestScore: Math.max(progress.bestScore || 0, percentage),
            completedAt: !progress.completedAt ? new Date() : progress.completedAt,
            timeSpent: timeSpent || progress.timeSpent || 0,
          },
        })
      } else {
        progress = await db.lessonProgress.create({
          data: {
            userId,
            lessonId: id,
            completed: true,
            score: percentage,
            attempts: 1,
            bestScore: percentage,
            completedAt: new Date(),
            timeSpent: timeSpent || 0,
          },
        })
      }
    }

    // Update user XP, gems, and level only if rewards are earned
    let levelUpResult: { leveledUp: boolean; oldLevel: number; newLevel: number; rewards: { gems: number; xp: number; bonusMessage: string } } | null = null

    if (shouldAwardRewards) {
      // Update streak on successful lesson completion
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      yesterday.setHours(0, 0, 0, 0)

      await db.user.update({
        where: { id: userId },
        data: {
          xp: { increment: boostedXp },
          gems: { increment: finalGems },
          level: newLevel,
          lastActiveAt: new Date(),
          streak: {
            increment: 1,
          },
        },
      })

      // Check for streak milestone and send email
      const updatedUser = await db.user.findUnique({
        where: { id: userId },
        select: { streak: true, email: true, name: true },
      })
      
      if (updatedUser?.email) {
        const streakMilestones = [3, 7, 14, 30, 60, 100, 180, 365]
        if (streakMilestones.includes(updatedUser.streak)) {
          sendStreakMilestoneEmail(userId, updatedUser.email, updatedUser.name, updatedUser.streak)
            .catch(err => console.error('[Streak Milestone Email] Failed to send:', err))
        }
      }

      // Check for level up using the new progressive level system
      if (leveledUp) {
        levelUpResult = checkLevelUp(previousXp, projectedTotalXp)

        if (levelUpResult) {
          // Award level-up gems bonus
          if (levelUpResult.rewards.gems > 0) {
            await db.user.update({
              where: { id: userId },
              data: { gems: { increment: levelUpResult.rewards.gems } },
            })
          }

          // Create level-up notification
          await db.notification.create({
            data: {
              userId,
              title: `🎉 Level Up! You're now Level ${levelUpResult.newLevel}!`,
              message: `${levelUpResult.rewards.bonusMessage} You earned ${levelUpResult.rewards.gems} bonus gems!`,
              type: 'INFO',
            },
          })

          // Send level-up email
          const userData = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          })
          if (userData?.email) {
            sendLevelUpEmail(userId, userData.email, userData.name, levelUpResult.newLevel, levelUpResult.rewards.gems)
              .catch(err => console.error('[LevelUp Email] Failed to send:', err))
          }
        }
      }
    }

// Track final hearts after deduction
      let finalHearts = currentUser?.hearts ?? 0
      const previousHearts = finalHearts

      // Deduct hearts for incorrect answers (server-side enforcement)
      if (incorrectCount > 0) {
        finalHearts = Math.max(0, finalHearts - incorrectCount)
        // Update lastHeartLossAt when hearts go down (for 4-hour cooldown)
        const heartLossData = finalHearts < previousHearts ? { hearts: finalHearts, lastHeartLossAt: new Date() } : { hearts: finalHearts }
        await db.user.update({
          where: { id: userId },
          data: heartLossData,
        })
      }

      // Check achievements
      const achievementsEarned: Array<{ id: string; title: string; icon: string | null; xpReward: number; gemReward: number }> = []
      let achievementXpTotal = 0
      let achievementGemsTotal = 0

    // First lesson completed
    if (isPassed) {
      // First Steps achievement - award on first lesson completion
      const firstSteps = await db.achievement.findFirst({
        where: { title: 'First Steps' },
      })
      if (firstSteps && isFirstCompletion) {
        const result = await awardAchievement(userId, {
          id: firstSteps.id,
          title: firstSteps.title,
          icon: firstSteps.icon,
          xpReward: firstSteps.xpReward,
          gemReward: firstSteps.gemReward,
        })
        if (result.awarded) {
          achievementsEarned.push({
            id: firstSteps.id,
            title: firstSteps.title,
            icon: firstSteps.icon,
            xpReward: result.xpReward,
            gemReward: result.gemReward,
          })
          achievementXpTotal += result.xpReward
          achievementGemsTotal += result.gemReward
        }
      }

      // Perfect Score achievement
      if (percentage === 100) {
        const perfectScore = await db.achievement.findFirst({
          where: { title: 'Perfect Score' },
        })
        if (perfectScore) {
          const result = await awardAchievement(userId, {
            id: perfectScore.id,
            title: perfectScore.title,
            icon: perfectScore.icon,
            xpReward: perfectScore.xpReward,
            gemReward: perfectScore.gemReward,
          })
          if (result.awarded) {
            achievementsEarned.push({
              id: perfectScore.id,
              title: perfectScore.title,
              icon: perfectScore.icon,
              xpReward: result.xpReward,
              gemReward: result.gemReward,
            })
            achievementXpTotal += result.xpReward
            achievementGemsTotal += result.gemReward
          }
        }
      }

      // Knowledge Seeker achievement (5 lessons)
      const totalCompleted = await db.lessonProgress.count({
        where: { userId, completed: true },
      })
      const knowledgeSeeker = await db.achievement.findFirst({
        where: { title: 'Knowledge Seeker' },
      })
      if (knowledgeSeeker && totalCompleted >= 5) {
        const result = await awardAchievement(userId, {
          id: knowledgeSeeker.id,
          title: knowledgeSeeker.title,
          icon: knowledgeSeeker.icon,
          xpReward: knowledgeSeeker.xpReward,
          gemReward: knowledgeSeeker.gemReward,
        })
        if (result.awarded) {
          achievementsEarned.push({
            id: knowledgeSeeker.id,
            title: knowledgeSeeker.title,
            icon: knowledgeSeeker.icon,
            xpReward: result.xpReward,
            gemReward: result.gemReward,
          })
          achievementXpTotal += result.xpReward
          achievementGemsTotal += result.gemReward
        }
      }
    }

    // ===== CERTIFICATE CREATION LOGIC =====
    // Check if course is now complete and create certificate
    let certificateEarned: { id: string; courseName: string; verificationCode: string; type: string } | null = null
    let completionExamRequired = false

    // Re-fetch admin settings for completion exam check
    const certSettings = await db.adminSettings.findFirst()
    const requireExam = certSettings?.requireCompletionExam !== false

    if (isPassed) {
      try {
        // Find the module this lesson belongs to
        const lessonModule = await db.lesson.findUnique({
          where: { id },
          select: { moduleId: true },
        })

        if (lessonModule) {
          // Find the course this module belongs to
          const moduleData = await db.module.findUnique({
            where: { id: lessonModule.moduleId },
            select: { courseId: true },
          })

          if (moduleData) {
            const courseId = moduleData.courseId

            // Get all lessons in this course through all modules
            const allModules = await db.module.findMany({
              where: { courseId },
              select: { id: true },
            })
            const moduleIds = allModules.map(m => m.id)

            const totalLessons = await db.lesson.count({
              where: { moduleId: { in: moduleIds }, isActive: true },
            })

            const completedLessons = await db.lessonProgress.count({
              where: {
                userId,
                lesson: { moduleId: { in: moduleIds }, isActive: true },
                completed: true,
              },
            })

            // Update enrollment progress
            const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

            await db.enrollment.updateMany({
              where: { userId, courseId },
              data: { progress: progressPercent },
            })

            // Check if course is fully complete (all lessons done)
            if (completedLessons === totalLessons && totalLessons > 0) {
              // Check if certificate already exists
              const existingCert = await db.certificate.findUnique({
                where: { userId_courseId: { userId, courseId } },
              })

              if (!existingCert) {
                // ===== COMPLETION EXAM CHECK =====
                // If completion exam is required, check if user has passed it
                if (requireExam) {
                  // Look for an exam associated with this course (type = 'COMPLETION' or 'CUSTOM')
                  const completionExam = await db.exam.findFirst({
                    where: {
                      isActive: true,
                      isPublished: true,
                      type: 'CUSTOM',
                    },
                    include: {
                      attempts: {
                        where: { userId, passed: true },
                        orderBy: { percentage: 'desc' },
                        take: 1,
                      },
                    },
                  })

                  // Check if user has passed ANY exam (as a general completion requirement)
                  const anyPassedExam = await db.examAttempt.findFirst({
                    where: {
                      userId,
                      passed: true,
                      percentage: { gte: certSettings?.completionExamPassMark || 60 },
                    },
                    orderBy: { percentage: 'desc' },
                  })

                  if (!anyPassedExam) {
                    // User needs to take the completion exam first
                    completionExamRequired = true
                    await db.notification.create({
                      data: {
                        userId,
                        title: 'All Lessons Completed!',
                        message: `Congratulations on completing all lessons! You must now pass the completion exam to earn your certificate. Head to the Exam Hub to take it.`,
                        type: 'INFO',
                        link: 'exam-hub',
                      },
                    })
                  } else {
                    // User passed exam - create certificate
                    const examPassMark = certSettings?.completionExamPassMark || 60
                    const examScore = anyPassedExam.percentage

                    const course = await db.course.findUnique({
                      where: { id: courseId },
                      select: { title: true, price: true, isFree: true, isPremium: true, difficulty: true },
                    })

                    const courseModules = await db.module.findMany({
                      where: { courseId },
                      select: { id: true, isPremium: true, order: true },
                      orderBy: { order: 'desc' },
                    })
                    const lastModuleIsPremium = courseModules.length > 0 && courseModules[0].isPremium

                    // ===== PREMIUM CERTIFICATE GATING =====
                    let certType = 'STANDARD'
                    let certificateLevel = 'basic'
                    const isPremiumCourse = course?.isPremium || lastModuleIsPremium
                    if (isPremiumCourse && userIsPremium) {
                      certType = 'PREMIUM'
                      certificateLevel = 'premium'
                    } else if (isPremiumCourse && !userIsPremium) {
                      certType = 'STANDARD'
                      certificateLevel = 'intermediate'
                    } else if (course?.difficulty === 'INTERMEDIATE' || course?.difficulty === 'ADVANCED') {
                      certType = 'STANDARD'
                      certificateLevel = 'intermediate'
                    }

                    // ===== COURSE TYPE AUTO-DETECTION =====
                    const keywords = {
                      waec: ['WAEC', 'West African Examination Council', 'GCE', 'WASSCE', 'SSCE'],
                      jamb: ['JAMB', 'UTME', 'Joint Admissions', 'Matriculation'],
                      neco: ['NECO', 'National Examination Council'],
                      vocational: ['Vocational', 'Trade', 'Technical', 'Apprenticeship'],
                      professional: ['Professional', 'Certification', 'Industry', 'Corporate'],
                    }
                    const courseType = detectCourseType(course?.title || '', keywords)

                    const timestamp = Date.now().toString(36).toUpperCase()
                    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
                    const verificationCode = `SP-${timestamp}-${random}`

                    const allProgress = await db.lessonProgress.findMany({
                      where: { userId, lesson: { moduleId: { in: moduleIds } } },
                      select: { bestScore: true },
                    })
                    const avgScore = allProgress.length > 0
                      ? Math.round(allProgress.reduce((sum, p) => sum + (p.bestScore || 0), 0) / allProgress.length) : null

                    const certificate = await db.certificate.create({
                      data: {
                        userId, courseId,
                        courseName: course?.title || 'Course',
                        verificationCode, type: certType, certificateLevel,
                        score: avgScore, totalLessons, completedLessons,
                        courseType,
                      },
                    })

                    certificateEarned = {
                      id: certificate.id,
                      courseName: certificate.courseName,
                      verificationCode: certificate.verificationCode,
                      type: certificate.type,
                    }

                    await db.notification.create({
                      data: {
                        userId,
                        title: 'Certificate Earned!',
                        message: `Congratulations! You've earned a ${certType.toLowerCase()} certificate for completing "${course?.title || 'Course'}" with a completion exam score of ${examScore}%.`,
                        type: 'INFO',
                        link: 'certificate',
                      },
                    })
                  }
                } else {
                  // No exam required - create certificate directly (original behavior)
                  const course = await db.course.findUnique({
                    where: { id: courseId },
                    select: { title: true, price: true, isFree: true, isPremium: true, difficulty: true },
                  })

                  const courseModules = await db.module.findMany({
                    where: { courseId },
                    select: { id: true, isPremium: true, order: true },
                    orderBy: { order: 'desc' },
                  })
                  const lastModuleIsPremium = courseModules.length > 0 && courseModules[0].isPremium

                  let certType = 'STANDARD'
                  let certificateLevel = 'basic'
                  const isPremiumCourse = course?.isPremium || lastModuleIsPremium
                  if (isPremiumCourse && userIsPremium) {
                    certType = 'PREMIUM'
                    certificateLevel = 'premium'
                  } else if (isPremiumCourse && !userIsPremium) {
                    certType = 'STANDARD'
                    certificateLevel = 'intermediate'
                  } else if (course?.difficulty === 'INTERMEDIATE' || course?.difficulty === 'ADVANCED') {
                    certType = 'STANDARD'
                    certificateLevel = 'intermediate'
                  }

                  // ===== COURSE TYPE AUTO-DETECTION =====
                  const keywords = {
                    waec: ['WAEC', 'West African Examination Council', 'GCE', 'WASSCE', 'SSCE'],
                    jamb: ['JAMB', 'UTME', 'Joint Admissions', 'Matriculation'],
                    neco: ['NECO', 'National Examination Council'],
                    vocational: ['Vocational', 'Trade', 'Technical', 'Apprenticeship'],
                    professional: ['Professional', 'Certification', 'Industry', 'Corporate'],
                  }
                  const courseType = detectCourseType(course?.title || '', keywords)

                  const timestamp = Date.now().toString(36).toUpperCase()
                  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
                  const verificationCode = `SP-${timestamp}-${random}`

                  const allProgress = await db.lessonProgress.findMany({
                    where: { userId, lesson: { moduleId: { in: moduleIds } } },
                    select: { bestScore: true },
                  })
                  const avgScore = allProgress.length > 0
                    ? Math.round(allProgress.reduce((sum, p) => sum + (p.bestScore || 0), 0) / allProgress.length) : null

                  const certificate = await db.certificate.create({
                    data: {
                      userId, courseId,
                      courseName: course?.title || 'Course',
                      verificationCode, type: certType, certificateLevel,
                      score: avgScore, totalLessons, completedLessons,
                      courseType,
                    },
                  })

                  certificateEarned = {
                    id: certificate.id,
                    courseName: certificate.courseName,
                    verificationCode: certificate.verificationCode,
                    type: certificate.type,
                  }

                  await db.notification.create({
                    data: {
                      userId,
                      title: 'Certificate Earned!',
                      message: `Congratulations! You've earned a ${certType.toLowerCase()} certificate for completing "${course?.title || 'Course'}"`,
                      type: 'INFO',
                      link: 'certificate',
                    },
                  })

                  // Trigger surveys for course completion
                  try {
                    const surveys = await db.survey.findMany({
                      where: {
                        triggerType: 'COURSE_COMPLETION',
                        isActive: true,
                      },
                    })

                    for (const survey of surveys) {
                      let triggerForUser = true
                      if (survey.triggerConfig) {
                        let config: any
                        try { config = JSON.parse(survey.triggerConfig) } catch { config = {} }
                        if (config.courseId && config.courseId !== courseId) {
                          triggerForUser = false
                        }
                      }
                      if (triggerForUser) {
                        const existingResponse = await db.surveyResponse.findUnique({
                          where: {
                            surveyId_userId: { surveyId: survey.id, userId },
                          },
                        })
                        if (!existingResponse) {
                          await db.notification.create({
                            data: {
                              userId,
                              title: 'Share Your Feedback',
                              message: `Help us improve! Please take a moment to share your experience about "${course?.title || 'this course'}".`,
                              type: 'INFO',
                              link: 'surveys',
                            },
                          })
                        }
                      }
                    }
                  } catch (surveyError) {
                    console.error('Survey trigger error:', surveyError)
                  }
                }
              }
            }
          }
        }
      } catch (certError) {
        console.error('Certificate creation error:', certError)
      }
    }

    // Build lesson report with detailed question breakdown
    const lessonReport = {
      timeSpent: timeSpent || 0,
      totalQuestions,
      correctCount,
      percentage,
      isPassed,
      questions: lessonQuestions.map((q, index) => {
        const submitted = verifiedAnswers.find(a => a.questionId === q.id)
        let correctAnswerParsed: any
        try { correctAnswerParsed = JSON.parse(q.correctAnswer) } catch { correctAnswerParsed = q.correctAnswer }
        const userAnswer = submitted?.answer || null
        const isCorrect = submitted?.isCorrect || false
        let options: any = null
        if (q.options) { try { options = JSON.parse(q.options) } catch { options = null } }
        return {
          questionId: q.id,
          questionNumber: index + 1,
          question: q.question,
          type: q.type,
          options,
          correctAnswer: correctAnswerParsed,
          userAnswer: userAnswer,
          isCorrect,
          explanation: q.explanation,
          points: q.points,
        }
      }),
      strengths: lessonQuestions
        .map((q, i) => ({ index: i, isCorrect: verifiedAnswers.find(a => a.questionId === q.id)?.isCorrect || false, type: q.type }))
        .filter(q => q.isCorrect)
        .map(q => ({ questionType: q.type, questionNumber: q.index + 1 })),
      weaknesses: lessonQuestions
        .map((q, i) => ({ index: i, isCorrect: verifiedAnswers.find(a => a.questionId === q.id)?.isCorrect || false, type: q.type, explanation: q.explanation }))
        .filter(q => !q.isCorrect)
        .map(q => ({ questionType: q.type, questionNumber: q.index + 1, explanation: q.explanation })),
      recommendation: percentage === 100
        ? 'Perfect score! You have mastered this lesson completely.'
        : percentage >= 80
          ? 'Excellent work! Review the questions you missed to achieve perfection.'
          : percentage >= 60
            ? 'Good effort! Focus on the weak areas identified below to improve your score.'
            : 'Keep practicing! Review the lesson content and try again. You can do this!',
    }

    return NextResponse.json({
      success: true,
      passed: true,
      score: percentage,
      cutoffScore,
      progress: progress ? {
        completed: progress.completed,
        score: progress.score,
        attempts: progress.attempts,
        bestScore: progress.bestScore,
      } : null,
       xpEarned: boostedXp + achievementXpTotal,
       baseXp: finalXp + achievementXpTotal,
       gemsEarned: finalGems + achievementGemsTotal,
       heartsLost: incorrectCount,
       newHearts: finalHearts,
       xpBoost: shouldAwardRewards ? {
        multiplier: xpBoostResult.multiplier,
        reasons: xpBoostResult.boostReason,
        boosted: xpBoostResult.multiplier > 1,
      } : null,
      leveledUp,
      newLevel,
      levelUpRewards: levelUpResult ? {
        oldLevel: levelUpResult.oldLevel,
        newLevel: levelUpResult.newLevel,
        bonusGems: levelUpResult.rewards.gems,
        bonusMessage: levelUpResult.rewards.bonusMessage,
      } : null,
      achievementsEarned,
      achievementRewards: {
        xp: achievementXpTotal,
        gems: achievementGemsTotal,
      },
      certificateEarned,
      completionExamRequired,
      lessonReport,
    })
  } catch (error: any) {
    console.error('Complete lesson API error:', error)
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 })
  }
}
