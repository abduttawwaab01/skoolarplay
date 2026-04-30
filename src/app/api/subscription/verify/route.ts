import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { PAYSTACK_API_URL } from '@/lib/constants'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    if (!PAYSTACK_SECRET_KEY) {
      const subscription = await db.subscription.findFirst({
        where: { userId: session.user.id, paystackRef: reference },
      })

      if (subscription) {
        return NextResponse.json({
          verified: true,
          status: subscription.status,
          expiresAt: subscription.expiresAt,
        })
      }

      return NextResponse.json({ verified: false })
    }

    const response = await fetch(
      `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.status && data.data.status === 'success') {
      let subscription = await db.subscription.findFirst({
        where: { userId: session.user.id, paystackRef: reference },
      })

      if (!subscription) {
        const metadata = data.data.metadata || {}
        const { planId, months, tierKey } = metadata
        
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + (parseInt(months) || 1))

        subscription = await db.subscription.create({
          data: {
            userId: session.user.id,
            tierKey: tierKey || 'PRO',
            plan: planId || 'monthly',
            amount: data.data.amount / 100,
            status: 'ACTIVE',
            paystackRef: reference,
            expiresAt,
            createdBy: session.user.id,
          },
        })

        await db.user.update({
          where: { id: session.user.id },
          data: {
            isPremium: true,
            premiumExpiresAt: expiresAt,
            planTier: tierKey || 'PRO',
          },
        })
      }

      return NextResponse.json({
        verified: true,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
      })
    }

    return NextResponse.json({ verified: false })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
