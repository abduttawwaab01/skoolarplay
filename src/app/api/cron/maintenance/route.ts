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

    // Expire old premium subscriptions
    const expiredPremiums = await db.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: {
          lt: now,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    let expiredCount = 0
    for (const user of expiredPremiums) {
      await db.user.update({
        where: { id: user.id },
        data: {
          isPremium: false,
          premiumExpiresAt: null,
        },
      })

      await db.notification.create({
        data: {
          userId: user.id,
          title: 'Premium Expired',
          message: 'Your SkoolarPlay+ subscription has expired. Reubscribe to continue enjoying premium features!',
          type: 'WARNING',
          link: 'shop',
        },
      })

      // Log the expiration
      await db.auditLog.create({
        data: {
          actorId: user.id,
          actorName: user.name,
          action: 'PREMIUM_EXPIRED',
          entity: 'User',
          entityId: user.id,
          details: JSON.stringify({
            userName: user.name,
            userEmail: user.email,
            expiredAt: now.toISOString(),
          }),
        } as any,
      })

      expiredCount++
    }

    // Clean up old notifications (older than 90 days)
    const notificationCleanupDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    const deletedNotifications = await db.notification.deleteMany({
      where: {
        createdAt: { lt: notificationCleanupDate },
        isRead: true,
      },
    })

    // Clean up old audit logs (older than 180 days) - keep important ones
    const auditCleanupDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    const deletedAuditLogs = await db.auditLog.deleteMany({
      where: {
        createdAt: { lt: auditCleanupDate },
        action: {
          notIn: ['USER_CREATED', 'COURSE_PUBLISHED', 'PAYMENT_RECEIVED', 'PREMIUM_PURCHASED'],
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Maintenance tasks completed',
      stats: {
        expiredPremiums: expiredCount,
        expiredPurchases: expiredCount,
        deletedNotifications: deletedNotifications.count,
        deletedAuditLogs: deletedAuditLogs.count,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Maintenance cron error:', error)
    return NextResponse.json({ error: 'Failed to run maintenance' }, { status: 500 })
  }
}
