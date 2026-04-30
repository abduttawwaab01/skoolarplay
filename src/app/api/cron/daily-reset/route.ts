import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get all users who should have their streak reset
    const usersToReset = await db.user.findMany({
      where: {
        streak: { gt: 0 },
        lastActiveAt: {
          lt: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Not active yesterday
        },
      },
      select: {
        id: true,
        name: true,
        streak: true,
      },
    })

    // Reset streaks that weren't maintained
    let resetCount = 0
    for (const user of usersToReset) {
      await db.user.update({
        where: { id: user.id },
        data: { streak: 0 },
      })

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Streak Lost 😢',
          message: `Your ${user.streak}-day streak has been reset. Keep learning daily to build a new streak!`,
          type: 'WARNING',
        },
      })
      resetCount++
    }

    // Reset weekly XP for leaderboard
    await db.user.updateMany({
      where: {},
      data: { weeklyXp: 0 },
    })

    // Reset daily leaderboard entries
    await db.leaderboardEntry.updateMany({
      where: { period: 'DAILY' },
      data: { xp: 0 },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        actorId: 'system',
        actorName: 'System',
        action: 'STREAK_RESET',
        entity: 'User',
        entityId: 'cron-daily-reset',
        details: JSON.stringify({
          streaksReset: resetCount,
          users: usersToReset.map(u => ({ id: u.id, name: u.name, streak: u.streak })),
          timestamp: now.toISOString(),
        }),
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: 'Daily reset completed',
      stats: {
        streaksReset: resetCount,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Daily reset error:', error)
    return NextResponse.json({ error: 'Failed to run daily reset' }, { status: 500 })
  }
}
