import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { xpEarned = 0 } = body

    // Cap XP per call to prevent injection (max 50 XP per call)
    const MAX_XP_PER_CALL = 50
    const cappedXpEarned = Math.min(xpEarned, MAX_XP_PER_CALL)

    if (cappedXpEarned <= 0) {
      return NextResponse.json({ error: 'XP earned must be positive' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Update leaderboard entries for all periods
    await db.$transaction(async (tx) => {
      // Daily entry
      const dailyEntry = await tx.leaderboardEntry.findFirst({
        where: { userId, period: 'DAILY', date: today },
      })

      if (dailyEntry) {
        await tx.leaderboardEntry.update({
          where: { id: dailyEntry.id },
          data: { xp: { increment: cappedXpEarned } },
        })
      } else {
        await tx.leaderboardEntry.create({
          data: {
            userId,
            period: 'DAILY',
            xp: cappedXpEarned,
            date: today,
            rank: 0,
          },
        })
      }

      // Weekly entry
      const weeklyEntry = await tx.leaderboardEntry.findFirst({
        where: { userId, period: 'WEEKLY', date: today },
      })

      if (weeklyEntry) {
        await tx.leaderboardEntry.update({
          where: { id: weeklyEntry.id },
          data: { xp: { increment: cappedXpEarned } },
        })
      } else {
        await tx.leaderboardEntry.create({
          data: {
            userId,
            period: 'WEEKLY',
            xp: cappedXpEarned,
            date: today,
            rank: 0,
          },
        })
      }
    })

    return NextResponse.json({ success: true, xpEarned: cappedXpEarned })
  } catch (error: any) {
    console.error('Leaderboard update API error:', error)
    return NextResponse.json({ error: 'Failed to update leaderboard' }, { status: 500 })
  }
}
