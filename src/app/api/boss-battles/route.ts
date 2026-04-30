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

    const bossBattles = await db.bossBattle.findMany({
      where: { isActive: true },
      include: {
        completions: {
          where: { userId: session.user.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const enriched = bossBattles.map((boss) => {
      const userCompletion = boss.completions[0]
      return {
        id: boss.id,
        title: boss.title,
        description: boss.description,
        difficulty: boss.difficulty,
        hp: boss.hp,
        xpReward: boss.xpReward,
        gemReward: boss.gemReward,
        timeLimit: boss.timeLimit,
        completed: userCompletion?.completed || false,
        bestScore: userCompletion?.score || 0,
        bestDamage: userCompletion?.damageDealt || 0,
      }
    })

    return NextResponse.json({ bossBattles: enriched })
  } catch (error) {
    console.error('Boss battles error:', error)
    return NextResponse.json({ error: 'Failed to get boss battles' }, { status: 500 })
  }
}
