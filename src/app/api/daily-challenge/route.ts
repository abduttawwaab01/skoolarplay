import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get today's challenge
    const challenge = await db.dailyChallenge.findFirst({
      where: { date: today, isActive: true },
    })

    if (!challenge) {
      return NextResponse.json({ challenge: null, completed: false, previousChallenges: [] })
    }

    // Check if user completed this challenge
    const completion = await db.dailyChallengeCompletion.findUnique({
      where: {
        userId_challengeId: { userId, challengeId: challenge.id },
      },
    })

    // Get previous challenges (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    const previousChallenges = await db.dailyChallenge.findMany({
      where: {
        date: { lt: today, gte: sevenDaysAgoStr },
        isActive: true,
      },
      orderBy: { date: 'desc' },
    })

    const previousWithStatus = await Promise.all(
      previousChallenges.map(async (ch) => {
        const comp = await db.dailyChallengeCompletion.findUnique({
          where: {
            userId_challengeId: { userId, challengeId: ch.id },
          },
          select: { score: true, completedAt: true },
        })
        return {
          ...ch,
          completed: !!comp,
          score: comp?.score || null,
          completedAt: comp?.completedAt || null,
        }
      })
    )

    return NextResponse.json({
      challenge: {
        ...challenge,
        completed: !!completion,
        score: completion?.score || null,
        completedAt: completion?.completedAt || null,
      },
      previousChallenges: previousWithStatus,
    })
  } catch (error: any) {
    console.error('Daily challenge API error:', error)
    return NextResponse.json({ error: 'Failed to fetch daily challenge' }, { status: 500 })
  }
}
