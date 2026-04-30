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

    const course = await db.course.findUnique({
      where: { id, isActive: true },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        teacher: {
          select: { id: true, name: true, avatar: true },
        },
        modules: {
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: {
                _count: {
                  select: { questions: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check premium access for course
    const userIsPremium = (session?.user as any)?.isPremium || false
    const courseIsPremium = course.isPremium || false
    
    // Check if any module or lesson is premium
    const hasPremiumModule = course.modules.some(m => m.isPremium)
    const hasPremiumLesson = course.modules.some(m => m.lessons.some(l => l.isPremium))
    const courseHasPremiumContent = courseIsPremium || hasPremiumModule || hasPremiumLesson

    // For non-premium users viewing premium courses, mark them accordingly
    // The course info is still shown (so users know what they're missing)
    // but lessons/modules are marked as locked

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Get review stats
    const reviewStats = await db.courseReview.aggregate({
      where: { courseId: id },
      _avg: { rating: true },
      _count: { id: true },
    })

    // Check enrollment
    let enrollment: any = null
    let completedLessonIds: string[] = []

    if (userId) {
      enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
      })

      const progress = await db.lessonProgress.findMany({
        where: {
          userId,
          lesson: { module: { courseId: id } },
          completed: true,
        },
        select: { lessonId: true },
      })
      completedLessonIds = progress.map((p) => p.lessonId)
    }

    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const completedCount = completedLessonIds.length
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    // Determine current module/lesson
    let currentModuleIndex = 0
    let currentLessonIndex = 0
    let found = false

    for (let mi = 0; mi < course.modules.length && !found; mi++) {
      for (let li = 0; li < course.modules[mi].lessons.length; li++) {
        const lessonId = course.modules[mi].lessons[li].id
        if (!completedLessonIds.includes(lessonId)) {
          currentModuleIndex = mi
          currentLessonIndex = li
          found = true
          break
        }
      }
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        icon: course.icon,
        color: course.color,
        difficulty: course.difficulty,
        price: course.price,
        isFree: course.isFree,
        isPremium: course.isPremium || false,
        status: course.status,
        category: course.category,
        teacher: course.teacher,
        enrollmentCount: course._count.enrollments,
        reviewCount: reviewStats._count.id,
        averageRating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0,
        totalModules: course.modules.length,
        totalLessons,
        completedLessons: completedCount,
        progress: progressPercent,
        isEnrolled: !!enrollment,
        currentModuleIndex,
        currentLessonIndex,
        userIsPremium,
        requiresPremium: courseHasPremiumContent && !userIsPremium,
        modules: course.modules.map((module, mi) => {
          // Non-premium users can't access premium modules
          const moduleIsLockedByPremium = module.isPremium && !userIsPremium
          
          const lessons = module.lessons.map((lesson, li) => {
            // Non-premium users can't access premium lessons
            const lessonIsLockedByPremium = lesson.isPremium && !userIsPremium
            // Also lock if parent module is premium
            const isLocked = moduleIsLockedByPremium || lessonIsLockedByPremium || (!found ? false : mi > currentModuleIndex || (mi === currentModuleIndex && li > currentLessonIndex))
            
            return {
              id: lesson.id,
              title: lesson.title,
              type: lesson.type,
              order: lesson.order,
              xpReward: lesson.xpReward,
              gemReward: lesson.gemReward,
              questionCount: lesson._count.questions,
              isCompleted: completedLessonIds.includes(lesson.id),
              isCurrent: mi === currentModuleIndex && li === currentLessonIndex,
              isLocked,
              isPremium: lesson.isPremium || false,
            }
          })

          // Add virtual "Review" lesson at the end of every module
          // It's unlocked when all lessons in the module are completed
          const allLessonsCompleted = module.lessons.every(l => completedLessonIds.includes(l.id))
          const reviewIsLocked = moduleIsLockedByPremium || !allLessonsCompleted

          lessons.push({
            id: `review_${module.id}`,
            title: 'Module Review',
            type: 'REVIEW',
            order: module.lessons.length,
            xpReward: 20, // Slightly higher for comprehensive review
            gemReward: 3,
            questionCount: -1, // Dynamic
            isCompleted: false, 
            isCurrent: false,
            isLocked: reviewIsLocked,
            isPremium: module.isPremium || false,
          } as any)

          return {
            id: module.id,
            title: module.title,
            order: module.order,
            isPremium: module.isPremium || false,
            isLocked: moduleIsLockedByPremium,
            lessons,
          }
        }),
      },
    })
  } catch (error: any) {
    console.error('Course detail API error:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const course = await db.course.findUnique({
      where: { id },
      select: { isFree: true, price: true, status: true, isPremium: true },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if user is premium (for premium courses)
    const userIsPremium = (session?.user as any)?.isPremium || false
    if (course.isPremium && !userIsPremium) {
      return NextResponse.json(
        { error: 'This is a premium course. Upgrade to SkoolarPlay+ to enroll.', requiresPremium: true },
        { status: 403 }
      )
    }

    // For paid courses, user must go through payment flow
    if (!course.isFree && course.price > 0) {
      return NextResponse.json(
        { error: 'This is a paid course. Please complete the payment process to enroll.' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: id } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Create free enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId,
        courseId: id,
        progress: 0,
        paymentStatus: 'FREE',
      },
    })

    return NextResponse.json({ enrollment, message: 'Successfully enrolled!' })
  } catch (error: any) {
    console.error('Enrollment API error:', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}
