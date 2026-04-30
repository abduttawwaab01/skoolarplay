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

    // Get active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return NextResponse.json({ hasActiveSubscription: false })
    }

    // Get user's premium status
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, premiumExpiresAt: true },
    })

    return NextResponse.json({
      hasActiveSubscription: true,
      subscription: {
        plan: subscription.plan,
        amount: subscription.amount,
        status: subscription.status,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        paystackRef: subscription.paystackRef,
      },
      userPremium: {
        isPremium: user?.isPremium,
        expiresAt: user?.premiumExpiresAt,
      },
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}
