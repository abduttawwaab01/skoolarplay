import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const DAILY_REWARDS = [
  { day: 1, gems: 5, xp: 0, hearts: 0, mysteryBox: false, streakFreeze: false },
  { day: 2, gems: 0, xp: 10, hearts: 0, mysteryBox: false, streakFreeze: false },
  { day: 3, gems: 10, xp: 0, hearts: 0, mysteryBox: false, streakFreeze: false },
  { day: 4, gems: 0, xp: 0, hearts: 1, mysteryBox: false, streakFreeze: false },
  { day: 5, gems: 15, xp: 25, hearts: 0, mysteryBox: false, streakFreeze: false },
  { day: 6, gems: 0, xp: 0, hearts: 0, mysteryBox: true, streakFreeze: false },
  { day: 7, gems: 50, xp: 0, hearts: 0, mysteryBox: false, streakFreeze: true },
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const dayNumber = body.dayNumber

    if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
      return NextResponse.json({ error: 'Invalid day number' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const rewardConfig = DAILY_REWARDS[dayNumber - 1]

    // Wrap entire claim in a transaction to prevent TOCTOU race on duplicate claim checks
    const result = await db.$transaction(async (tx) => {
      // Check if already claimed (inside transaction)
      const existing = await tx.loginReward.findUnique({
        where: { userId_dayNumber: { userId: session.user.id, dayNumber } },
      })

      if (existing) {
        throw new Error('ALREADY_CLAIMED')
      }

      // Check if previous days are claimed (except day 1)
      if (dayNumber > 1) {
        const prevReward = await tx.loginReward.findUnique({
          where: { userId_dayNumber: { userId: session.user.id, dayNumber: dayNumber - 1 } },
        })
        if (!prevReward) {
          throw new Error('CLAIM_PREVIOUS_FIRST')
        }
      }

      // Apply rewards
      const freshUser = await tx.user.findUnique({ where: { id: session.user.id } })
      if (!freshUser) throw new Error('USER_NOT_FOUND')

      let updateData: any = {}
      if (rewardConfig.gems > 0) updateData.gems = { increment: rewardConfig.gems }
      if (rewardConfig.xp > 0) updateData.xp = { increment: rewardConfig.xp }
      if (rewardConfig.hearts > 0) updateData.hearts = Math.min(freshUser.hearts + rewardConfig.hearts, freshUser.maxHearts)

      await tx.user.update({
        where: { id: session.user.id },
        data: updateData,
      })

      // Create login reward record
      const loginReward = await tx.loginReward.create({
        data: {
          userId: session.user.id,
          dayNumber,
          gems: rewardConfig.gems,
          xp: rewardConfig.xp,
        },
      })

      // Handle mystery box
      if (rewardConfig.mysteryBox) {
        await tx.mysteryBox.create({
          data: {
            userId: session.user.id,
            rewardType: 'PENDING',
            rewardAmount: 0,
            rewardName: 'Unopened Mystery Box',
          },
        })
      }

      const updatedUser = await tx.user.findUnique({ where: { id: session.user.id } })

      return { loginReward, updatedUser }
    })

    return NextResponse.json({
      success: true,
      reward: {
        dayNumber,
        gems: rewardConfig.gems,
        xp: rewardConfig.xp,
        hearts: rewardConfig.hearts,
        mysteryBox: rewardConfig.mysteryBox,
        streakFreeze: rewardConfig.streakFreeze,
      },
      user: {
        gems: result.updatedUser?.gems || 0,
        xp: result.updatedUser?.xp || 0,
        hearts: result.updatedUser?.hearts || 0,
      },
    })
  } catch (error: any) {
    if (error.message === 'ALREADY_CLAIMED') {
      return NextResponse.json({ error: 'Reward already claimed for this day!' }, { status: 400 })
    }
    if (error.message === 'CLAIM_PREVIOUS_FIRST') {
      return NextResponse.json({ error: 'Claim previous day\'s reward first!' }, { status: 400 })
    }
    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Claim login reward error:', error)
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
  }
}
