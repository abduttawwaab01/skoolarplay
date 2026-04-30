import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function getNigerianMidnight() {
  const now = new Date()
  const nigerian = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }))
  nigerian.setHours(0, 0, 0, 0)
  return nigerian
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const midnightISO = getNigerianMidnight().toISOString()

    const todaySpins = await db.spinResult.count({
      where: {
        userId: session.user.id,
        spunAt: { gte: midnightISO },
      },
    })

    const mysteryBoxCount = await db.mysteryBox.count({
      where: {
        userId: session.user.id,
        rewardType: 'PENDING',
      },
    })

    return NextResponse.json({
      freeSpinsRemaining: Math.max(0, 1 - todaySpins),
      spinsToday: todaySpins,
      mysteryBoxesAvailable: mysteryBoxCount,
      costPerExtraSpin: 5,
    })
  } catch (error) {
    console.error('Spin status error:', error)
    return NextResponse.json({ error: 'Failed to get spin status' }, { status: 500 })
  }
}
