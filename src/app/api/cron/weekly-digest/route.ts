import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWeeklyDigestEmail } from '@/lib/email-helpers'
import { getLevelInfo } from '@/lib/level-system'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')

  if (CRON_SECRET) {
    const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get active users
    const users = await db.user.findMany({
      where: {
        isDeleted: false,
        isBanned: false,
        emailVerified: { not: null },
        lastActiveAt: {
          gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // Active in last 2 weeks
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        streak: true,
        longestStreak: true,
        xp: true,
        level: true,
      },
      take: 500,
    })

    let sentCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        // Get week's lessons
        const weekProgress = await db.lessonProgress.findMany({
          where: {
            userId: user.id,
            completedAt: {
              gte: startOfWeek,
              lt: endOfWeek,
            },
          },
        })

        // Calculate XP
        const xpEarned = weekProgress.length * 10

        // Get achievements this week
        const weekAchievements = await db.userAchievement.findMany({
          where: {
            userId: user.id,
          },
          include: {
            achievement: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
          take: 50,
        }).then(achievements => achievements.filter(a => {
          const earnedAt = new Date(a.earnedAt)
          return earnedAt >= startOfWeek && earnedAt < endOfWeek
        }))

        // Get gems this week
        const weekGemTx = await db.gemTransaction.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: startOfWeek,
              lt: endOfWeek,
            },
          },
        })
        const gemsEarned = weekGemTx
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0)

        // Calculate level progress
        const currentLevelInfo = getLevelInfo(user.xp)
        const nextLevelXp = currentLevelInfo.nextLevelXp ?? (user.xp + 1000)
        const progressPercent = currentLevelInfo.nextLevelXp && currentLevelInfo.nextLevelXp > currentLevelInfo.currentLevelXp
          ? Math.round(((user.xp - currentLevelInfo.currentLevelXp) / (currentLevelInfo.nextLevelXp - currentLevelInfo.currentLevelXp)) * 100)
          : 0

        // Only send if user has activity this week
        if (weekProgress.length > 0) {
          await sendWeeklyDigestEmail(user.email, user.name, {
            lessonsCompleted: weekProgress.length,
            xpEarned,
            gemsEarned,
            achievementsEarned: weekAchievements.length,
            currentStreak: user.longestStreak,
            levelProgress: progressPercent,
            nextMilestone: `Level ${currentLevelInfo.level + 1}`,
          })
          sentCount++
        }
      } catch (err) {
        console.error(`[Weekly Digest] Failed for user ${user.id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly digest completed',
      stats: {
        usersProcessed: users.length,
        emailsSent: sentCount,
        errors: errorCount,
        weekRange: `${startOfWeek.toISOString()} - ${endOfWeek.toISOString()}`,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Weekly Digest Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send weekly digest' },
      { status: 500 }
    )
  }
}
