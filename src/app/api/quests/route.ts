import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todayStr = new Date().toISOString().split('T')[0]

    // Get active quests (daily and weekly)
    const quests = await db.quest.findMany({
      where: {
        isActive: true,
        startDate: { lte: todayStr },
        endDate: { gte: todayStr },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Get user completions for these quests
    const completions = await db.questCompletion.findMany({
      where: {
        userId: session.user.id,
        questId: { in: quests.map((q) => q.id) },
      },
    })

    const completionMap = new Map(completions.map((c) => [c.questId, c]))

    const enrichedQuests = quests.map((quest) => {
      const completion = completionMap.get(quest.id)
      return {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        requirement: quest.requirement,
        targetCount: quest.targetCount,
        xpReward: quest.xpReward,
        gemReward: quest.gemReward,
        progress: completion?.progress || 0,
        completed: completion?.completed || false,
        completedAt: completion?.completedAt || null,
        canClaim: (completion?.completed || false) && !completion?.completedAt,
        endDate: quest.endDate,
      }
    })

    return NextResponse.json({
      quests: enrichedQuests,
    })
  } catch (error) {
    console.error('Quests error:', error)
    return NextResponse.json({ error: 'Failed to get quests' }, { status: 500 })
  }
}
