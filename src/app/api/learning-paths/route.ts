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

    const studyPaths = await db.studyPath.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        courses: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                modules: true,
              },
            },
            enrollments: {
              where: { userId: user.id },
            },
          },
        },
      },
    })

    const result = studyPaths.map((path) => {
      const totalLessons = path.courses.reduce(
        (sum, c) => sum + c._count.modules,
        0
      )
      const completedEnrollments = path.courses.filter(
        (c) => c.enrollments.length > 0 && c.enrollments[0].progress >= 100
      ).length
      const startedCourses = path.courses.filter((c) => c.enrollments.length > 0).length
      const progressPercent = path.courses.length > 0
        ? Math.round((completedEnrollments / path.courses.length) * 100)
        : 0

      const hasPremiumCourse = path.courses.some((c) => c.isPremium)
      const userIsPremium = user.isPremium || false

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        type: path.type,
        icon: path.icon,
        color: path.color,
        totalCourses: path.courses.length,
        totalLessons,
        completedCourses: completedEnrollments,
        startedCourses,
        progress: progressPercent,
        isEnrolled: startedCourses > 0,
        estimatedHours: Math.round(totalLessons * 0.5), // ~30 min per lesson
        difficulty: path.type === 'EXAM' ? 'Advanced' : path.type === 'SKILL' ? 'Intermediate' : 'Beginner',
        isPremium: hasPremiumCourse,
        requiresPremium: hasPremiumCourse && !userIsPremium,
      }
    })

    return NextResponse.json({ 
      learningPaths: result,
      userIsPremium: user.isPremium || false,
    })
  } catch (error) {
    console.error('Failed to fetch learning paths:', error)
    return NextResponse.json({ error: 'Failed to fetch learning paths' }, { status: 500 })
  }
}
