import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST: Check and consume streak freeze if streak would be lost
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const lastActive = new Date(user.lastActiveAt)

    // Calculate days since last activity
    const diffTime = now.getTime() - lastActive.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // If streak is 0, nothing to protect
    if (user.streak === 0) {
      return NextResponse.json({
        streakProtected: false,
        message: 'No active streak to protect',
        streak: 0,
        freezeUsed: false,
        remainingFreezes: 0,
      })
    }

    // If user was active today or yesterday, streak is still active
    if (diffDays <= 1) {
      return NextResponse.json({
        streakProtected: false,
        message: 'Your streak is still active!',
        streak: user.streak,
        freezeUsed: false,
        remainingFreezes: 0,
      })
    }

    // If more than 2 days, streak would have already been lost
    // (Streak freeze only works for 1-day gap)
    if (diffDays > 2) {
      // Reset streak if not already 0
      if (user.streak > 0) {
        await db.user.update({
          where: { id: userId },
          data: { streak: 0 },
        })
      }
      return NextResponse.json({
        streakProtected: false,
        message: 'Too many days missed. Streak has been lost.',
        streak: 0,
        freezeUsed: false,
        remainingFreezes: 0,
      })
    }

    // Exactly 2 days since last activity - check for streak freeze
    // Look for purchased streak freeze items
    const streakFreezePurchases = await db.purchase.findMany({
      where: {
        userId,
        shopItem: {
          type: 'STREAK_FREEZE',
          isActive: true,
        },
      },
      include: {
        shopItem: {
          select: { title: true, type: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    if (streakFreezePurchases.length === 0) {
      // No streak freeze available - reset streak
      await db.user.update({
        where: { id: userId },
        data: { streak: 0 },
      })

      // Notify user about lost streak
      await db.notification.create({
        data: {
          userId,
          title: '🔥 Streak Lost!',
          message: `You missed a day of learning and your ${user.streak}-day streak has been reset. Buy a Streak Freeze from the shop to protect your streak next time!`,
          type: 'WARNING',
          link: 'shop',
        },
      })

      return NextResponse.json({
        streakProtected: false,
        message: `Your ${user.streak}-day streak was lost. No streak freeze available.`,
        streak: 0,
        freezeUsed: false,
        remainingFreezes: 0,
      })
    }

    // Consume the oldest streak freeze
    const freezeToUse = streakFreezePurchases[0]

    // Delete the consumed purchase
    await db.purchase.delete({
      where: { id: freezeToUse.id },
    })

    // Update last active to yesterday (effectively making it look like they were active)
    // This keeps the streak alive
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    await db.user.update({
      where: { id: userId },
      data: {
        lastActiveAt: yesterday,
      },
    })

    const remainingFreezes = streakFreezePurchases.length - 1

    // Create notification about streak freeze usage
    await db.notification.create({
      data: {
        userId,
        title: '❄️ Streak Freeze Used!',
        message: `Your streak freeze was activated to protect your ${user.streak}-day streak! ${remainingFreezes > 0 ? `You have ${remainingFreezes} freeze${remainingFreezes > 1 ? 's' : ''} remaining.` : 'No streak freezes remaining. Buy more from the shop!'}`,
        type: 'INFO',
        link: remainingFreezes === 0 ? 'shop' : undefined,
      },
    })

    return NextResponse.json({
      streakProtected: true,
      message: `❄️ Streak freeze activated! Your ${user.streak}-day streak is protected!`,
      streak: user.streak,
      freezeUsed: true,
      remainingFreezes,
      consumedFreezeId: freezeToUse.id,
    })
  } catch (error) {
    console.error('Streak freeze API error:', error)
    return NextResponse.json({ error: 'Failed to check streak freeze' }, { status: 500 })
  }
}
