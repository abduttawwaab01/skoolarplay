import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getActiveBoosts, getTimeMultiplier } from '@/lib/xp-boost'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { streak: true, isPremium: true, weeklyXp: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get active boosts
    const boosts = getActiveBoosts({
      streak: user.streak,
      isPremium: user.isPremium,
    })

    // Get current time multiplier
    const currentTimeBoost = getTimeMultiplier()

    return NextResponse.json({
      streak: user.streak,
      isPremium: user.isPremium,
      weeklyXp: user.weeklyXp,
      activeBoosts: boosts.filter(b => b.active),
      upcomingBoosts: boosts.filter(b => !b.active),
      currentTimeBonus: currentTimeBoost
        ? { multiplier: currentTimeBoost.multiplier, label: currentTimeBoost.label }
        : null,
    })
  } catch (error) {
    console.error('XP boost API error:', error)
    return NextResponse.json({ error: 'Failed to fetch boost info' }, { status: 500 })
  }
}
