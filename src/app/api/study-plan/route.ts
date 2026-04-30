import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get enrolled courses with progress
    const enrollments = await db.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  where: { isActive: true },
                  orderBy: { order: 'asc' },
                  include: {
                    progress: {
                      where: { userId: user.id },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { progress: 'asc' },
    })

    // Find current lesson in each course
    const studyPlan = enrollments.map((enrollment) => {
      const course = enrollment.course
      let currentLesson: any = null
      let nextLessons: any[] = []

      for (const courseModule of course.modules) {
        for (const lesson of courseModule.lessons) {
          const lp = lesson.progress[0]
          if (!currentLesson && (!lp || !lp.completed)) {
            currentLesson = {
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              moduleId: courseModule.id,
              moduleName: courseModule.title,
              xpReward: lesson.xpReward,
              gemReward: lesson.gemReward,
              isCompleted: lp?.completed || false,
              attempts: lp?.attempts || 0,
              bestScore: lp?.bestScore,
            }
          }
          if (currentLesson && lesson.id !== currentLesson.id && nextLessons.length < 3) {
            nextLessons.push({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              xpReward: lesson.xpReward,
            })
          }
        }
        if (currentLesson) break
      }

      return {
        courseId: course.id,
        courseTitle: course.title,
        courseIcon: course.icon,
        courseColor: course.color,
        progress: enrollment.progress,
        totalModules: course.modules.length,
        completedLessons: course.modules.reduce(
          (sum, m) => sum + m.lessons.filter((l) => l.progress[0]?.completed).length,
          0
        ),
        totalLessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
        currentLesson,
        nextLessons,
      }
    })

    // Sort by progress (least progress first - focus on incomplete)
    studyPlan.sort((a, b) => a.progress - b.progress)

    // Get exam recommendations
    const examAttempts = await db.examAttempt.findMany({
      where: { userId: user.id },
      select: { examId: true },
      distinct: ['examId'],
    })

    const attemptedExamIds = examAttempts.map((a) => a.examId)

    const recommendedExams = await db.exam.findMany({
      where: {
        isActive: true,
        isPublished: true,
        id: { notIn: attemptedExamIds },
      },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        subject: true,
        duration: true,
        totalQuestions: true,
      },
    })

    return NextResponse.json({
      studyPlan,
      recommendedExams,
    })
  } catch (error) {
    console.error('Failed to fetch study plan:', error)
    return NextResponse.json({ error: 'Failed to fetch study plan' }, { status: 500 })
  }
}
