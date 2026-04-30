import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const userIsPremium = (session?.user as any)?.isPremium || false

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (id.startsWith('review_')) {
      const moduleId = id.replace('review_', '')
      const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        include: {
          lessons: {
            where: { isActive: true },
            include: {
              questions: {
                where: { isActive: true },
              }
            }
          },
          course: {
            select: { id: true, title: true, isPremium: true }
          }
        }
      })

      if (!moduleData) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 })
      }

      // Check premium access
      const moduleIsPremium = moduleData.isPremium || false
      const courseIsPremium = moduleData.course?.isPremium || false
      const isPremiumContent = moduleIsPremium || courseIsPremium

      if (isPremiumContent && !userIsPremium) {
        return NextResponse.json({
          error: 'Premium subscription required',
          requiresPremium: true,
          premiumLevel: moduleIsPremium ? 'module' : 'course',
        }, { status: 403 })
      }

      // Collect all questions from the module
      const allQuestions = moduleData.lessons.flatMap(l => l.questions)
      
      // Select "hard" questions: Sort by points descending and pick top ones
      const sortedQuestions = [...allQuestions].sort((a, b) => (b.points || 10) - (a.points || 10))
      
      // Take top 15 questions (or all if less than 15)
      let selectedQuestions = sortedQuestions.slice(0, 15)
      
      // Shuffle them for a better review experience
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5)

      return NextResponse.json({
        lesson: {
          id,
          title: `Review: ${moduleData.title}`,
          type: 'REVIEW',
          xpReward: 20,
          gemReward: 3,
          isPremium: isPremiumContent,
          questions: selectedQuestions.map((q) => ({
            id: q.id,
            type: q.type || 'MCQ',
            question: q.question || '',
            hint: q.hint,
            explanation: q.explanation,
            options: q.options,
            correctAnswer: q.correctAnswer,
            order: q.order || 0,
            points: q.points || 10,
          })),
          videoContent: [],
          previousAttempts: 0,
          bestScore: null,
          lessonNote: null,
          module: {
            id: moduleData.id,
            title: moduleData.title,
            isPremium: moduleData.isPremium,
            course: moduleData.course
          },
        },
      })
    }

    const lesson = await db.lesson.findUnique({
      where: { id, isActive: true },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
        videoContent: {
          orderBy: { order: 'asc' },
        },
        lessonNote: {
          select: {
            id: true,
            title: true,
            content: true,
            audioUrl: true,
            hasQuiz: true,
            quizTitle: true,
            quizQuestions: true,
            quizPassingScore: true,
            quizTimeLimit: true,
            quizRequireFullscreen: true,
            quizPreventTabSwitch: true,
            quizPreventCopyPaste: true,
            quizShuffleQuestions: true,
            quizShuffleOptions: true,
            quizXpReward: true,
            quizGemReward: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
            isPremium: true,
            course: {
              select: {
                id: true,
                title: true,
                isPremium: true,
              },
            },
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Check premium access - if lesson, module, or course is premium, user must be premium
    const lessonIsPremium = lesson.isPremium || false
    const moduleIsPremium = lesson.module?.isPremium || false
    const courseIsPremium = lesson.module?.course?.isPremium || false
    const isPremiumContent = lessonIsPremium || moduleIsPremium || courseIsPremium

    if (isPremiumContent && !userIsPremium) {
      return NextResponse.json({
        error: 'Premium subscription required',
        requiresPremium: true,
        premiumLevel: lessonIsPremium ? 'lesson' : moduleIsPremium ? 'module' : 'course',
      }, { status: 403 })
    }

    // Get user's previous progress
    let previousProgress: any = null
    try {
      previousProgress = await db.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: id } },
      })
    } catch {
      // No previous progress
    }

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        xpReward: lesson.xpReward,
        gemReward: lesson.gemReward,
        isPremium: isPremiumContent,
        questions: (Array.isArray(lesson.questions) ? lesson.questions : []).filter(q => q && q.id).map((q) => ({
          id: q.id,
          type: q.type || 'MCQ',
          question: q.question || '',
          hint: q.hint,
          explanation: q.explanation,
          options: q.options,
          correctAnswer: q.correctAnswer,
          order: q.order || 0,
          points: q.points || 10,
        })),
        videoContent: (Array.isArray(lesson.videoContent) ? lesson.videoContent : []).filter(v => v && v.id).map((v) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          duration: v.duration,
          order: v.order,
        })),
        previousAttempts: previousProgress?.attempts ?? 0,
        bestScore: previousProgress?.bestScore
          ? Math.round(previousProgress.bestScore)
          : null,
        lessonNote: lesson.lessonNote ? {
          id: lesson.lessonNote.id,
          title: lesson.lessonNote.title,
          content: lesson.lessonNote.content,
          audioUrl: lesson.lessonNote.audioUrl,
          hasQuiz: lesson.lessonNote.hasQuiz,
          quizTitle: lesson.lessonNote.quizTitle,
          quizQuestions: lesson.lessonNote.hasQuiz ? (() => {
            try {
              const raw = lesson.lessonNote?.quizQuestions
              if (!raw) return []
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
              return Array.isArray(parsed) ? parsed.map((q: any) => ({
                ...q,
                correctAnswer: q.correctAnswer,
              })) : []
            } catch {
              return []
            }
          })() : null,
          quizPassingScore: lesson.lessonNote.quizPassingScore,
          quizTimeLimit: lesson.lessonNote.quizTimeLimit,
          quizRequireFullscreen: lesson.lessonNote.quizRequireFullscreen,
          quizPreventTabSwitch: lesson.lessonNote.quizPreventTabSwitch,
          quizPreventCopyPaste: lesson.lessonNote.quizPreventCopyPaste,
          quizShuffleQuestions: lesson.lessonNote.quizShuffleQuestions,
          quizShuffleOptions: lesson.lessonNote.quizShuffleOptions,
          quizXpReward: lesson.lessonNote.quizXpReward,
          quizGemReward: lesson.lessonNote.quizGemReward,
        } : null,
        module: lesson.module,
      },
    })
  } catch (error: any) {
    console.error('Lesson API error:', error)
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 })
  }
}
