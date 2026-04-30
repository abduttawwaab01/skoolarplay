import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendQuestCompleteEmail } from '@/lib/email-helpers'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { questId } = body

    if (!questId) {
      return NextResponse.json({ error: 'Quest ID required' }, { status: 400 })
    }

    const quest = await db.quest.findUnique({ where: { id: questId } })
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

    // Wrap entire claim in a transaction to prevent TOCTOU race on completion check + reward
    const result = await db.$transaction(async (tx) => {
      let completion = await tx.questCompletion.findUnique({
        where: { userId_questId: { userId: session.user.id, questId } },
      })

      if (!completion || !completion.completed) {
        throw new Error('QUEST_NOT_COMPLETED')
      }

      if (completion.completedAt) {
        throw new Error('REWARD_ALREADY_CLAIMED')
      }

      // Award rewards
      const user = await tx.user.findUnique({ where: { id: session.user.id } })
      if (!user) throw new Error('USER_NOT_FOUND')

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          gems: { increment: quest.gemReward },
          xp: { increment: quest.xpReward },
        },
      })

      // Mark as claimed
      completion = await tx.questCompletion.update({
        where: { id: completion.id },
        data: { completedAt: new Date() },
      })

      const updatedUser = await tx.user.findUnique({ where: { id: session.user.id } })

      return { completion, updatedUser }
    })

    const response = NextResponse.json({
      success: true,
      questId,
      rewards: {
        gems: quest.gemReward,
        xp: quest.xpReward,
      },
      user: {
        gems: result.updatedUser?.gems || 0,
        xp: result.updatedUser?.xp || 0,
      },
    })

    // Send quest completion email (fire and forget)
    if (result.updatedUser?.email) {
      sendQuestCompleteEmail(
        session.user.id,
        result.updatedUser.email,
        result.updatedUser.name,
        {
          title: quest.title,
          xpReward: quest.xpReward,
          gemReward: quest.gemReward,
        }
      ).catch(err => console.error('[Quest Email] Failed to send:', err))
    }

    return response
  } catch (error: any) {
    if (error.message === 'QUEST_NOT_COMPLETED') {
      return NextResponse.json({ error: 'Quest not yet completed!' }, { status: 400 })
    }
    if (error.message === 'REWARD_ALREADY_CLAIMED') {
      return NextResponse.json({ error: 'Reward already claimed!' }, { status: 400 })
    }
    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Claim quest error:', error)
    return NextResponse.json({ error: 'Failed to claim quest reward' }, { status: 500 })
  }
}
