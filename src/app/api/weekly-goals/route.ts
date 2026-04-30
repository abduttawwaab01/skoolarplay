import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        weeklyXp: true,
        league: true,
        totalLessonsCompleted: true,
        totalCoursesCompleted: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get admin settings for daily XP goal
    const settings = await db.adminSettings.findFirst({
      select: { dailyXpGoal: true },
    })
    const dailyXpGoal = settings?.dailyXpGoal || 50
    const weeklyXpGoal = dailyXpGoal * 7

    // Calculate week start (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() + mondayOffset)
    weekStart.setHours(0, 0, 0, 0)

    // Count lessons completed this week
    const lessonsCompletedThisWeek = await db.lessonProgress.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: weekStart },
      },
    })

    // Sum time spent this week (in minutes)
    const timeSpentAgg = await db.lessonProgress.aggregate({
      where: {
        userId,
        completedAt: { gte: weekStart },
      },
      _sum: { timeSpent: true },
    })
    const timeSpentMinutes = Math.round((timeSpentAgg._sum.timeSpent || 0) / 60)

    // Count courses completed this week (enrollments with 100% progress updated this week)
    const coursesProgressThisWeek = await db.lessonProgress.groupBy({
      by: ['lessonId'],
      where: {
        userId,
        completed: true,
        completedAt: { gte: weekStart },
      },
    })

    // Calculate progress percentage
    const xpProgress = Math.min(100, Math.round((user.weeklyXp / weeklyXpGoal) * 100))

    // Calculate days to next league
    const leagueOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'SAPPHIRE', 'RUBY', 'OBSIDIAN']
    const currentLeagueIndex = leagueOrder.indexOf(user.league)
    const daysToNextLeague = currentLeagueIndex < leagueOrder.length - 1 ? 7 : null

    // Motivational message
    let motivationalMessage = ''
    if (xpProgress >= 100) {
      motivationalMessage = "You've crushed your weekly goal! You're on fire! 🔥"
    } else if (xpProgress >= 75) {
      motivationalMessage = "Almost there! Just a little more to hit your weekly target! 💪"
    } else if (xpProgress >= 50) {
      motivationalMessage = "Great progress this week! Keep the momentum going! 🚀"
    } else if (xpProgress >= 25) {
      motivationalMessage = "Good start! You're building strong learning habits! 📚"
    } else if (user.streak > 0) {
      motivationalMessage = `Nice ${user.streak}-day streak! Every lesson counts towards your goal! ✨`
    } else {
      motivationalMessage = "Start your learning journey today! Even small steps matter! 🌱"
    }

    return NextResponse.json({
      weeklyXp: user.weeklyXp,
      weeklyXpGoal,
      xpProgress,
      lessonsCompletedThisWeek,
      timeSpentMinutes,
      streak: user.streak,
      league: user.league,
      daysToNextLeague,
      totalLessonsCompleted: user.totalLessonsCompleted,
      totalCoursesCompleted: user.totalCoursesCompleted,
      motivationalMessage,
      weekStart: weekStart.toISOString(),
      daysRemainingInWeek: 7 - ((dayOfWeek + 6) % 7), // Days until next Monday
    })
  } catch (error) {
    console.error('Weekly goals API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weekly goals' }, { status: 500 })
  }
}
