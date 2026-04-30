import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const BOX_REWARDS = [
  { type: 'GEMS', amounts: [10, 20, 30, 50, 100], weight: 35 },
  { type: 'XP', amounts: [25, 50, 75, 100, 200], weight: 30 },
  { type: 'HEARTS', amounts: [1, 2, 3], weight: 15 },
  { type: 'STREAK_FREEZE', amounts: [1], weight: 12 },
  { type: 'DOUBLE_XP', amounts: [1], weight: 8 },
]

const REWARD_ICONS: Record<string, string> = {
  GEMS: '💎',
  XP: '⚡',
  HEARTS: '❤️',
  STREAK_FREEZE: '❄️',
  DOUBLE_XP: '✨',
}

function pickReward() {
  const total = BOX_REWARDS.reduce((s, r) => s + r.weight, 0)
  let rand = Math.random() * total
  for (const reward of BOX_REWARDS) {
    rand -= reward.weight
    if (rand <= 0) {
      const amount = reward.amounts[Math.floor(Math.random() * reward.amounts.length)]
      const isRare = reward.type === 'STREAK_FREEZE' || reward.type === 'DOUBLE_XP' || (reward.type === 'GEMS' && amount >= 50) || (reward.type === 'XP' && amount >= 100)
      return {
        type: reward.type,
        amount,
        name: `${REWARD_ICONS[reward.type] || '🎁'} ${amount} ${reward.type}`,
        isRare,
      }
    }
  }
  return { type: 'GEMS', amount: 10, name: '💎 10 GEMS', isRare: false }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find pending mystery box
    const box = await db.mysteryBox.findFirst({
      where: {
        userId: session.user.id,
        rewardType: 'PENDING',
      },
    })

    if (!box) {
      return NextResponse.json({ error: 'No mystery boxes available!', code: 'NO_BOXES' }, { status: 400 })
    }

    // Pick reward
    const reward = pickReward()

    // Wrap entire open operation in a transaction to prevent TOCTOU race on box + reward
    const result = await db.$transaction(async (tx) => {
      // Re-verify box is still pending inside transaction
      const freshBox = await tx.mysteryBox.findFirst({
        where: {
          id: box.id,
          userId: session.user.id,
          rewardType: 'PENDING',
        },
      })

      if (!freshBox) {
        throw new Error('NO_BOXES')
      }

      // Apply reward
      const user = await tx.user.findUnique({ where: { id: session.user.id } })
      if (!user) throw new Error('USER_NOT_FOUND')

      let updateData: any = {}

      switch (reward.type) {
        case 'GEMS':
          updateData.gems = { increment: reward.amount }
          break
        case 'XP':
          updateData.xp = { increment: reward.amount }
          break
        case 'HEARTS':
          updateData.hearts = Math.min(user.hearts + reward.amount, user.maxHearts)
          break
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: updateData,
      })

      // Update box
      await tx.mysteryBox.update({
        where: { id: freshBox.id },
        data: {
          rewardType: reward.type,
          rewardAmount: reward.amount,
          rewardName: reward.name,
        },
      })

      const updatedUser = await tx.user.findUnique({ where: { id: session.user.id } })

      return { updatedUser }
    })

    return NextResponse.json({
      success: true,
      reward: {
        type: reward.type,
        amount: reward.amount,
        name: reward.name,
        isRare: reward.isRare,
      },
      user: {
        gems: result.updatedUser?.gems || 0,
        xp: result.updatedUser?.xp || 0,
        hearts: result.updatedUser?.hearts || 0,
      },
    })
  } catch (error: any) {
    if (error.message === 'NO_BOXES') {
      return NextResponse.json({ error: 'No mystery boxes available!', code: 'NO_BOXES' }, { status: 400 })
    }
    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Open mystery box error:', error)
    return NextResponse.json({ error: 'Failed to open box' }, { status: 500 })
  }
}
