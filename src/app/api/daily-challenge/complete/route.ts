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
    const { challengeId, score } = body

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
    }

    // Check if already completed
    const existing = await db.dailyChallengeCompletion.findUnique({
      where: {
        userId_challengeId: { userId, challengeId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Challenge already completed' }, { status: 400 })
    }

    // Get challenge details
    const challenge = await db.dailyChallenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Create completion and award rewards
    const result = await db.$transaction(async (tx) => {
      const completion = await tx.dailyChallengeCompletion.create({
        data: {
          userId,
          challengeId,
          score: score ?? null,
        },
      })

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: challenge.xpReward },
          gems: { increment: challenge.gemReward },
        },
        select: {
          xp: true,
          gems: true,
          level: true,
          streak: true,
        },
      })

      return { completion, updatedUser, challenge }
    })

    // Update leaderboard
    await db.leaderboardEntry.upsert({
      where: {
        id: `${userId}-${new Date().toISOString().split('T')[0]}-DAILY`,
      },
      create: {
        userId,
        period: 'DAILY',
        xp: challenge.xpReward,
        date: new Date().toISOString().split('T')[0],
        rank: 0,
      },
      update: {
        xp: { increment: challenge.xpReward },
      },
    })

    return NextResponse.json({
      success: true,
      xpEarned: challenge.xpReward,
      gemsEarned: challenge.gemReward,
      totalXp: result.updatedUser.xp,
      totalGems: result.updatedUser.gems,
    })
  } catch (error: any) {
    console.error('Daily challenge complete API error:', error)
    return NextResponse.json({ error: 'Failed to complete challenge' }, { status: 500 })
  }
}
