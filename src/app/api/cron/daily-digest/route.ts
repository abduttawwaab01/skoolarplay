import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendDailyDigestEmail } from '@/lib/email-helpers'

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
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    // Get users who were active today and have email notifications enabled
    const users = await db.user.findMany({
      where: {
        isDeleted: false,
        isBanned: false,
        emailVerified: { not: null },
        lastActiveAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Active in last 7 days
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        streak: true,
      },
      take: 500, // Process in batches
    })

    let sentCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        // Get today's stats
        const todayProgress = await db.lessonProgress.findMany({
          where: {
            userId: user.id,
            completedAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        })

        // Calculate XP from today
        const todayXp = todayProgress.length * 10 // Estimate

        // Check daily challenge
        const dailyChallenge = await db.dailyChallengeCompletion.findFirst({
          where: {
            userId: user.id,
            completedAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        })

        // Get gems earned today
        const todayGemTx = await db.gemTransaction.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
        })
        const gemsEarned = todayGemTx
          .filter(tx => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0)

        // Only send if user has some activity or has low hearts
        if (todayProgress.length > 0 || user.streak > 0) {
          await sendDailyDigestEmail(user.email, user.name, {
            lessonsCompleted: todayProgress.length,
            xpEarned: todayXp,
            currentStreak: user.streak,
            dailyChallengeCompleted: !!dailyChallenge,
            gemsEarned,
          })
          sentCount++
        }
      } catch (err) {
        console.error(`[Daily Digest] Failed for user ${user.id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Daily digest completed',
      stats: {
        usersProcessed: users.length,
        emailsSent: sentCount,
        errors: errorCount,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Daily Digest Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send daily digest' },
      { status: 500 }
    )
  }
}
