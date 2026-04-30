import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const DEFAULT_REFILL_COOLDOWN_HOURS = 4

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    const settings = await db.adminSettings.findFirst()
    const refillIntervalHours = settings?.heartRefillHours || DEFAULT_REFILL_COOLDOWN_HOURS
    const refillIntervalMs = refillIntervalHours * 60 * 60 * 1000
    const defaultMaxHearts = settings?.maxHearts || 5

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          hearts: true,
          maxHearts: true,
          lastHeartRefillAt: true,
          lastHeartLossAt: true,
          isPremium: true,
        },
      })

      if (!user) {
        return { error: 'User not found', status: 404 }
      }

      const effectiveMaxHearts = user.isPremium ? 999 : (user.maxHearts || defaultMaxHearts)

      if (user.hearts >= effectiveMaxHearts) {
        return {
          success: false,
          error: 'Hearts are already full',
          hearts: user.hearts,
          maxHearts: effectiveMaxHearts,
          status: 400
        }
      }

      const lastLoss = user.lastHeartLossAt ? new Date(user.lastHeartLossAt) : new Date(0)
      const timeSinceLastLoss = now.getTime() - lastLoss.getTime()

      if (timeSinceLastLoss < refillIntervalMs) {
        const remainingMs = refillIntervalMs - timeSinceLastLoss
        const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000))
        const remainingMinutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / 60000)
        
        let waitMessage = ''
        if (remainingHours > 0) {
          waitMessage = `Please wait ${remainingHours} hour${remainingHours > 1 ? 's' : ''} and ${remainingMinutes} more minute${remainingMinutes !== 1 ? 's' : ''}`
        } else {
          waitMessage = `Please wait ${remainingMinutes} more minute${remainingMinutes !== 1 ? 's' : ''}`
        }

        return {
          success: false,
          error: waitMessage,
          hearts: user.hearts,
          maxHearts: effectiveMaxHearts,
          nextRefillAt: new Date(lastLoss.getTime() + refillIntervalMs).toISOString(),
          remainingMs,
          status: 429
        }
      }

      const newHearts = effectiveMaxHearts

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          hearts: newHearts,
          lastHeartRefillAt: now,
        },
        select: {
          hearts: true,
          maxHearts: true,
        },
      })

      return {
        success: true,
        hearts: updatedUser.hearts,
        maxHearts: effectiveMaxHearts,
        heartsRefilled: newHearts - user.hearts,
        nextRefillAt: new Date(now.getTime() + refillIntervalMs).toISOString(),
        refillIntervalHours,
      }
    })

    if ('status' in result && result.status) {
      return NextResponse.json(result, { status: result.status })
    }

    return NextResponse.json({
      success: result.success,
      message: result.success ? `All ${result.heartsRefilled} hearts refilled!` : undefined,
      ...result,
    })
  } catch (error) {
    console.error('Heart refill error:', error)
    return NextResponse.json({
      error: 'Failed to refill hearts',
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    const settings = await db.adminSettings.findFirst()
    const refillIntervalHours = settings?.heartRefillHours || DEFAULT_REFILL_COOLDOWN_HOURS
    const refillIntervalMs = refillIntervalHours * 60 * 60 * 1000
    const defaultMaxHearts = settings?.maxHearts || 5

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        hearts: true,
        maxHearts: true,
        lastHeartRefillAt: true,
        lastHeartLossAt: true,
        isPremium: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const effectiveMaxHearts = user.isPremium ? 999 : (user.maxHearts || defaultMaxHearts)
    const lastLoss = user.lastHeartLossAt ? new Date(user.lastHeartLossAt) : new Date(0)
    const timeSinceLastLoss = now.getTime() - lastLoss.getTime()
    const canRefill = timeSinceLastLoss >= refillIntervalMs && user.hearts < effectiveMaxHearts
    const nextRefillAt = new Date(lastLoss.getTime() + refillIntervalMs)
    const remainingMs = Math.max(0, refillIntervalMs - timeSinceLastLoss)
    
    const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000))
    const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / 60000)
    const remainingSeconds = Math.floor((remainingMs % (60 * 1000)) / 1000)

    return NextResponse.json({
      hearts: user.hearts,
      maxHearts: effectiveMaxHearts,
      canRefill,
      isFull: user.hearts >= effectiveMaxHearts,
      nextRefillAt: canRefill ? null : nextRefillAt.toISOString(),
      remainingMs,
      remainingHours,
      remainingMinutes,
      remainingSeconds,
      refillIntervalHours,
    })
  } catch (error) {
    console.error('Heart refill status error:', error)
    return NextResponse.json({ error: 'Failed to get heart status' }, { status: 500 })
  }
}
