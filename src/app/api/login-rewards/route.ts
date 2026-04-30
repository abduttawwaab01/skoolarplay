import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const DAILY_REWARDS = [
  { day: 1, gems: 5, xp: 0, label: '5 Gems', icon: '💎' },
  { day: 2, gems: 0, xp: 10, label: '10 XP', icon: '⚡' },
  { day: 3, gems: 10, xp: 0, label: '10 Gems', icon: '💎' },
  { day: 4, gems: 0, xp: 0, label: '1 Heart', icon: '❤️', hearts: 1 },
  { day: 5, gems: 15, xp: 25, label: '15 Gems + 25 XP', icon: '🎁' },
  { day: 6, gems: 0, xp: 0, label: 'Mystery Box', icon: '🎁', mysteryBox: true },
  { day: 7, gems: 50, xp: 0, label: '50 Gems + Streak Freeze', icon: '👑', streakFreeze: true },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Get claimed rewards
    const claimedRewards = await db.loginReward.findMany({
      where: { userId: session.user.id },
      orderBy: { dayNumber: 'asc' },
    })

    const claimedDays = new Set(claimedRewards.map((r) => r.dayNumber))

    // Calculate current streak day
    let currentDay = 0
    for (let i = 1; i <= 7; i++) {
      if (claimedDays.has(i)) {
        currentDay = i
      } else {
        break
      }
    }

    // Check if today's reward has been claimed
    const todayStr = new Date().toISOString().split('T')[0]
    const todayClaimed = claimedRewards.some(
      (r) => r.claimedAt.toISOString().split('T')[0] === todayStr
    )

    return NextResponse.json({
      currentDay,
      nextDay: currentDay >= 7 ? 7 : currentDay + 1,
      todayClaimed,
      claimedDays: Array.from(claimedDays),
      rewards: DAILY_REWARDS,
      streak: user.streak,
    })
  } catch (error) {
    console.error('Login rewards error:', error)
    return NextResponse.json({ error: 'Failed to get login rewards' }, { status: 500 })
  }
}
