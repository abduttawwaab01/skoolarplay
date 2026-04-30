import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const STREAK_REPAIR_GEM_COST = 10 // 10 gems to repair 1 day of streak
const MAX_STREAK_REPAIR_DAYS = 7 // Max 7 days can be repaired

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { daysToRepair } = body

    const repairDays = Math.min(daysToRepair || 1, MAX_STREAK_REPAIR_DAYS)
    const gemCost = repairDays * STREAK_REPAIR_GEM_COST

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        gems: true,
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has enough gems
    if (user.gems < gemCost) {
      return NextResponse.json({
        error: `Not enough gems. You need ${gemCost} gems to repair ${repairDays} day(s) of streak.`,
        requiredGems: gemCost,
        availableGems: user.gems,
        gemCost: STREAK_REPAIR_GEM_COST,
      })
    }

    // Check if streak is already lost or at 0
    if (user.streak === 0) {
      return NextResponse.json({
        error: 'No streak to repair. Start learning to build a streak!',
        canRepair: false,
      })
    }

    // Calculate days since last activity
    const now = new Date()
    const lastActive = new Date(user.lastActiveAt)
    const diffTime = now.getTime() - lastActive.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Can only repair if streak was recently lost (within last 7 days)
    if (diffDays > MAX_STREAK_REPAIR_DAYS) {
      return NextResponse.json({
        error: 'Streak can only be repaired within 7 days of losing it.',
        canRepair: false,
        daysSinceLost: diffDays,
      })
    }

    // Deduct gems
    await db.user.update({
      where: { id: userId },
      data: { gems: { decrement: gemCost } },
    })

    // Record gem transaction
    await db.gemTransaction.create({
      data: {
        userId,
        amount: -gemCost,
        type: 'SPEND',
        source: 'streak_repair',
        description: `Streak repair: ${repairDays} day(s)`,
      },
    })

    // Update lastActiveAt to yesterday to restore streak
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    await db.user.update({
      where: { id: userId },
      data: { lastActiveAt: yesterday },
    })

    // Create notification
    await db.notification.create({
      data: {
        userId,
        title: '🔧 Streak Repaired!',
        message: `Your ${user.streak}-day streak has been restored for ${gemCost} gems! Keep learning to keep your streak safe!`,
        type: 'SUCCESS',
      },
    })

    return NextResponse.json({
      success: true,
      message: `Streak repaired! Your ${user.streak}-day streak is back!`,
      gemsSpent: gemCost,
      daysRepaired: repairDays,
      remainingGems: user.gems - gemCost,
      streakRestored: user.streak,
    })
  } catch (error) {
    console.error('Streak repair API error:', error)
    return NextResponse.json({ error: 'Failed to repair streak' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        gems: true,
        streak: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate days since last activity
    const now = new Date()
    const lastActive = new Date(user.lastActiveAt)
    const diffTime = now.getTime() - lastActive.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const canRepair = user.streak > 0 && diffDays <= MAX_STREAK_REPAIR_DAYS
    const maxRepairableDays = Math.min(MAX_STREAK_REPAIR_DAYS - diffDays, user.streak)
    const maxRepairableGems = maxRepairableDays * STREAK_REPAIR_GEM_COST

    return NextResponse.json({
      canRepair,
      gemCost: STREAK_REPAIR_GEM_COST,
      maxDaysRepairable: Math.max(0, maxRepairableDays),
      maxGemsRequired: Math.max(0, maxRepairableGems),
      availableGems: user.gems,
      currentStreak: user.streak,
      daysSinceLastActivity: diffDays,
    })
  } catch (error) {
    console.error('Streak repair status error:', error)
    return NextResponse.json({ error: 'Failed to get repair status' }, { status: 500 })
  }
}
