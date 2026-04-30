import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CRON_SECRET = process.env.CRON_SECRET
const DEFAULT_REFILL_COOLDOWN_HOURS = 4

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')

  if (!CRON_SECRET) {
    console.error('[Heart Refill Cron] CRON_SECRET environment variable is not set')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const now = new Date()
    const settings = await db.adminSettings.findFirst()

    if (!settings) {
      console.error('[Heart Refill Cron] Admin settings not found')
      return NextResponse.json({ error: 'Admin settings not found' }, { status: 500 })
    }

    const refillIntervalHours = settings.heartRefillHours || DEFAULT_REFILL_COOLDOWN_HOURS
    const refillIntervalMs = refillIntervalHours * 60 * 60 * 1000
    const defaultMaxHearts = settings.maxHearts || 5
    const cutoffTime = new Date(now.getTime() - refillIntervalMs)

    const usersToRefill = await db.user.findMany({
      where: {
        AND: [
          { isPremium: false },
          {
            OR: [
              { hearts: { lt: defaultMaxHearts } },
              { hearts: { lt: 5 } },
            ],
          },
          {
            lastHeartLossAt: { lt: cutoffTime },
          },
        ],
      },
      select: {
        id: true,
        hearts: true,
        maxHearts: true,
        isPremium: true,
      },
    })

    let refillCount = 0
    let heartsRefilled = 0

    await db.$transaction(async (tx) => {
      for (const user of usersToRefill) {
        if (user.isPremium) continue

        const effectiveMaxHearts = user.maxHearts || defaultMaxHearts
        const newHearts = effectiveMaxHearts
        const heartsToAdd = newHearts - user.hearts

        if (heartsToAdd > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              hearts: newHearts,
              lastHeartRefillAt: now,
            },
          })
          refillCount++
          heartsRefilled += heartsToAdd
        }
      }
    })

    await db.auditLog.create({
      data: {
        actorId: 'system',
        actorName: 'System',
        action: 'HEART_REFILL_CRON',
        entity: 'User',
        entityId: 'cron-heart-refill',
        details: JSON.stringify({
          usersRefilled: refillCount,
          heartsRefilled,
          intervalHours: refillIntervalHours,
          timestamp: now.toISOString(),
        }),
      } as any,
    })

    return NextResponse.json({
      success: true,
      message: 'Heart refill cron completed',
      stats: {
        usersRefilled: refillCount,
        heartsRefilled,
        intervalHours: refillIntervalHours,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('[Heart Refill Cron] Error:', error)
    return NextResponse.json({ 
      error: 'Failed to run heart refill cron', 
    }, { status: 500 })
  }
}
