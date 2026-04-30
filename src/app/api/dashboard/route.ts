import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { getLevelInfo } from '@/lib/level-system'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with stats
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        gems: true,
        xp: true,
        streak: true,
        longestStreak: true,
        hearts: true,
        maxHearts: true,
        level: true,
        avatar: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate correct level from XP using level-system
    const levelInfo = getLevelInfo(user.xp)

    // Get enrolled courses with progress - optimized query
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: { select: { name: true, icon: true } },
            modules: {
              include: {
                lessons: {
                  where: { isActive: true },
                  select: { id: true },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Batch fetch all lesson progress for this user in ONE query
    const courseIds = enrollments.map(e => e.courseId)
    const allLessonProgress = await db.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        lesson: {
          module: {
            courseId: { in: courseIds },
            course: { isActive: true },
          },
        },
      },
      select: {
        lessonId: true,
        completed: true,
      },
    })

    // Create a Set of completed lesson IDs for O(1) lookup
    const completedLessonIds = new Set(allLessonProgress.map(p => p.lessonId))

    // Get all lesson IDs organized by course for current lesson finding
    const courseLessonMap = new Map<string, string[]>()
    for (const enrollment of enrollments) {
      const lessonIds = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id))
      courseLessonMap.set(enrollment.courseId, lessonIds)
    }

    // Batch fetch all lesson progress details for finding current lesson
    const allLessonProgressFull = await db.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          module: {
            courseId: { in: courseIds },
          },
        },
      },
      select: {
        lessonId: true,
        completed: true,
      },
    })

    const lessonProgressMap = new Map(allLessonProgressFull.map(p => [p.lessonId, p.completed]))

    const formattedEnrollments = enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.reduce(
        (sum, m) => sum + m.lessons.length,
        0
      )
      
      // Count completed lessons using the Set (O(1) lookup per lesson)
      const completedProgress = enrollment.course.modules.reduce((sum, module) => {
        return sum + module.lessons.filter(l => completedLessonIds.has(l.id)).length
      }, 0)
      
      const progress = totalLessons > 0 ? Math.round((completedProgress / totalLessons) * 100) : 0

      // Find current lesson using the map (no additional queries)
      const lessonIds = courseLessonMap.get(enrollment.courseId) || []
      let currentLessonId: string | null = null
      for (const lessonId of lessonIds) {
        if (!lessonProgressMap.get(lessonId)) {
          currentLessonId = lessonId
          break
        }
      }

      return {
        id: enrollment.id,
        courseId: enrollment.course.id,
        title: enrollment.course.title,
        icon: enrollment.course.icon,
        color: enrollment.course.color,
        difficulty: enrollment.course.difficulty,
        category: enrollment.course.category,
        totalLessons,
        completedLessons: completedProgress,
        progress,
        currentLessonId,
        lastAccessed: enrollment.updatedAt,
      }
    })

    // Get daily challenge
    const today = new Date().toISOString().split('T')[0]
    const dailyChallenge = await db.dailyChallenge.findFirst({
      where: { date: today, isActive: true },
    })

    let challengeCompleted = false
    if (dailyChallenge) {
      const completion = await db.dailyChallengeCompletion.findUnique({
        where: {
          userId_challengeId: { userId, challengeId: dailyChallenge.id },
        },
      })
      challengeCompleted = !!completion
    }

    // Get recent achievements
    const achievements = await db.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: { title: true, description: true, icon: true },
        },
      },
      orderBy: { earnedAt: 'desc' },
      take: 5,
    })

    // Get leaderboard position
    const leaderboardEntry = await db.leaderboardEntry.findFirst({
      where: { userId, period: 'WEEKLY' },
      orderBy: { date: 'desc' },
    })

    // Get courses count for categories
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { courses: { where: { isActive: true } } },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Admin settings for daily goal
    const settings = await db.adminSettings.findFirst()
    const dailyXpGoal = settings?.dailyXpGoal || 50

    return NextResponse.json({
      user: {
        ...user,
        level: levelInfo.level, // Use correct level from XP
      },
      levelInfo, // Include full level info for progress display
      enrollments: formattedEnrollments,
      dailyChallenge: dailyChallenge
        ? {
            ...dailyChallenge,
            completed: challengeCompleted,
          }
        : null,
      recentAchievements: achievements.map((a) => ({
        id: a.id,
        ...a.achievement,
        earnedAt: a.earnedAt,
      })),
      leaderboardPosition: leaderboardEntry?.rank || null,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        description: c.description,
        courseCount: c._count.courses,
      })),
      dailyXpGoal,
    })
  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
