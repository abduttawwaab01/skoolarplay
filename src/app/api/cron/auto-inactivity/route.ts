import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInactivityReminderEmail } from '@/lib/email-helpers'

const CRON_SECRET = process.env.CRON_SECRET
const DEFAULT_INACTIVITY_HOURS = [24, 72, 168] // 1 day, 3 days, 7 days

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
    
    // Get inactivity settings from admin
    const settings = await db.adminSettings.findFirst()
    const inactivityHours = settings?.inactivityReminders 
      ? JSON.parse(settings.inactivityReminders)
      : DEFAULT_INACTIVITY_HOURS

    // Get users who should receive inactivity reminders
    const users = await db.user.findMany({
      where: {
        isDeleted: false,
        isBanned: false,
        emailVerified: { not: null },
        isPremium: false, // Only non-premium users get reminders
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastActiveAt: true,
        streak: true,
        hearts: true,
        maxHearts: true,
      },
      take: 500,
    })

    let sentCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        const hoursSinceActive = (now.getTime() - new Date(user.lastActiveAt).getTime()) / (1000 * 60 * 60)
        
        // Check if user should receive a reminder
        const shouldRemind = inactivityHours.some(hours => {
          const diff = Math.abs(hoursSinceActive - hours)
          return diff < 2 // Within 2 hours of the threshold
        })

        if (!shouldRemind) {
          skippedCount++
          continue
        }

        // Check if we already sent a reminder recently
        const recentNotification = await db.notification.findFirst({
          where: {
            userId: user.id,
            type: 'INACTIVITY_REMINDER',
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        })

        if (recentNotification) {
          skippedCount++
          continue
        }

        // Send reminder
        await sendInactivityReminderEmail(
          user.email,
          user.name,
          Math.floor(hoursSinceActive),
          new Date(user.lastActiveAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        )

        // Create in-app notification
        await db.notification.create({
          data: {
            userId: user.id,
            title: '👋 We Miss You!',
            message: `It's been ${Math.floor(hoursSinceActive)} hours since your last lesson. Keep your streak going!`,
            type: 'INACTIVITY_REMINDER',
          },
        })

        sentCount++
      } catch (err) {
        console.error(`[Inactivity Reminder] Failed for user ${user.id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inactivity reminders completed',
      stats: {
        usersProcessed: users.length,
        remindersSent: sentCount,
        skipped: skippedCount,
        errors: errorCount,
        inactivityThresholds: inactivityHours,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Inactivity Reminder Cron] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send inactivity reminders' },
      { status: 500 }
    )
  }
}
