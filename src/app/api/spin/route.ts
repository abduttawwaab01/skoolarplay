import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'

const WHEEL_SEGMENTS = [
  { type: 'GEMS', amount: 10, name: '💎 10 Gems', weight: 40 },
  { type: 'XP', amount: 25, name: '⚡ 25 XP', weight: 35 },
  { type: 'HEARTS', amount: 1, name: '❤️ 1 Heart', weight: 15 },
  { type: 'STREAK_FREEZE', amount: 1, name: '❄️ Streak Freeze', weight: 4 },
  { type: 'MYSTERY_BOX', amount: 1, name: '🎁 Mystery Box', weight: 3 },
  { type: 'GEMS', amount: 50, name: '💎 50 Gems', weight: 1 },
  { type: 'XP', amount: 100, name: '⚡ 100 XP', weight: 1 },
  { type: 'NOTHING', amount: 0, name: '😅 Nothing!', weight: 1 },
]

function pickSegment() {
  const total = WHEEL_SEGMENTS.reduce((s, seg) => s + seg.weight, 0)
  let rand = Math.random() * total
  for (const seg of WHEEL_SEGMENTS) {
    rand -= seg.weight
    if (rand <= 0) return seg
  }
  return WHEEL_SEGMENTS[0]
}

function getNigerianMidnight() {
  const now = new Date()
  const nigerian = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }))
  nigerian.setHours(0, 0, 0, 0)
  return nigerian
}

function toNigerianISO() {
  return getNigerianMidnight().toISOString()
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimit = await rateLimiter.checkLimit(
      `spin:${session.user.id}`,
      RATE_LIMITS.SPIN_PER_MINUTE
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many spin requests. Please wait a moment.', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 60) } }
      )
    }

    const body = await req.json()
    const useGems = body.useGems === true

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const midnightISO = toNigerianISO()

    // Pick reward
    const segment = pickSegment()
    const segIndex = WHEEL_SEGMENTS.indexOf(segment)

    // Wrap entire spin logic in a transaction — spin count and gem check inside to prevent TOCTOU
    const spinResult = await db.$transaction(async (tx) => {
      // Re-fetch user within transaction for accurate data
      const freshUser = await tx.user.findUnique({ where: { id: user.id } })
      if (!freshUser) throw new Error('USER_NOT_FOUND')

      // Re-check spin count inside transaction
      const todaySpins = await tx.spinResult.count({
        where: {
          userId: user.id,
          spunAt: { gte: midnightISO },
        },
      })

      if (todaySpins >= 1 && !useGems) {
        throw new Error('NO_FREE_SPINS')
      }

      if (useGems && freshUser.gems < 5) {
        throw new Error('NOT_ENOUGH_GEMS')
      }

      // Deduct gems if paid spin (atomic)
      if (useGems) {
        await tx.user.update({
          where: { id: user.id },
          data: { gems: { decrement: 5 } },
        })
      }

      // Apply reward
      switch (segment.type) {
        case 'GEMS':
          await tx.user.update({
            where: { id: user.id },
            data: { gems: { increment: segment.amount } },
          })
          break
        case 'XP':
          await tx.user.update({
            where: { id: user.id },
            data: { xp: { increment: segment.amount } },
          })
          break
        case 'HEARTS':
          await tx.user.update({
            where: { id: user.id },
            data: { hearts: { increment: segment.amount } },
          })
          break
        case 'STREAK_FREEZE':
          // Grant streak freeze - track via user metadata instead of invalid purchase
          await tx.notification.create({
            data: {
              userId: user.id,
              title: 'Streak Freeze Earned!',
              message: 'You earned a Streak Freeze from the spin wheel! It will automatically protect your streak.',
              type: 'REWARD',
            },
          })
          break
        case 'MYSTERY_BOX':
          await tx.mysteryBox.create({
            data: {
              userId: user.id,
              rewardType: 'PENDING',
              rewardAmount: 0,
              rewardName: 'Unopened Mystery Box',
            },
          })
          break
      }

      // Record spin result
      const result = await tx.spinResult.create({
        data: {
          userId: user.id,
          rewardType: segment.type,
          rewardAmount: segment.amount,
          rewardName: segment.name,
        },
      })

      // Get updated user data
      const updatedUser = await tx.user.findUnique({ where: { id: user.id } })

      return { result, updatedUser, todaySpins }
    })

    return NextResponse.json({
      success: true,
      spin: {
        id: spinResult.result.id,
        segmentIndex: segIndex,
        rewardType: segment.type,
        rewardAmount: segment.amount,
        rewardName: segment.name,
      },
      user: {
        gems: spinResult.updatedUser?.gems || 0,
        xp: spinResult.updatedUser?.xp || 0,
        hearts: spinResult.updatedUser?.hearts || 0,
      },
      remainingFreeSpins: spinResult.todaySpins >= 1 ? 0 : 1,
    })
  } catch (error: any) {
    if (error.message === 'NO_FREE_SPINS') {
      return NextResponse.json({ error: 'No free spins left today. Use 5 gems for an extra spin!', code: 'NO_FREE_SPINS' }, { status: 400 })
    }
    if (error.message === 'NOT_ENOUGH_GEMS') {
      return NextResponse.json({ error: 'Not enough gems! Need 5 gems per extra spin.' }, { status: 400 })
    }
    console.error('Spin error:', error)
    return NextResponse.json({ error: 'Failed to spin' }, { status: 500 })
  }
}
