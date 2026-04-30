import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { PAYSTACK_API_URL } from '@/lib/constants'

const DEFAULT_PRICES = {
  monthly: { amount: 2000, months: 1, name: 'Monthly' },
  quarterly: { amount: 5000, months: 3, name: 'Quarterly' },
  annual: { amount: 15000, months: 12, name: 'Annual' },
}

const DEFAULT_TIER_KEY = 'PRO'

async function getPlanPrices() {
  try {
    const tiers = await db.subscriptionTier.findMany({
      where: { isActive: true, key: { not: 'FREE' } },
      orderBy: { sortOrder: 'asc' },
      take: 1,
    })
    
    if (tiers.length === 0) {
      return DEFAULT_PRICES
    }
    
    const tier = tiers[0]
    
    return {
      monthly: { 
        amount: Number(tier.monthlyPrice) || DEFAULT_PRICES.monthly.amount, 
        months: 1, 
        name: 'Monthly' 
      },
      quarterly: { 
        amount: Number(tier.quarterlyPrice) || DEFAULT_PRICES.quarterly.amount, 
        months: 3, 
        name: 'Quarterly' 
      },
      annual: { 
        amount: Number(tier.annualPrice) || DEFAULT_PRICES.annual.amount, 
        months: 12, 
        name: 'Annual' 
      },
    }
  } catch (error) {
    console.error('Error fetching plan prices:', error)
    return DEFAULT_PRICES
  }
}

export async function GET() {
  try {
    const plans = await getPlanPrices()
    
    return NextResponse.json({
      plans: [
        {
          id: 'monthly',
          name: plans.monthly.name,
          price: plans.monthly.amount,
          period: '/mo',
          months: 1,
        },
        {
          id: 'quarterly',
          name: plans.quarterly.name,
          price: plans.quarterly.amount,
          period: '/3mo',
          months: 3,
        },
        {
          id: 'annual',
          name: plans.annual.name,
          price: plans.annual.amount,
          period: '/yr',
          months: 12,
        },
      ],
    })
  } catch (error) {
    console.error('Get plans error:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, email } = body

    const plans = await getPlanPrices()
    const plan = plans[planId as keyof typeof plans]
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    const reference = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    if (!PAYSTACK_SECRET_KEY) {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + plan.months)

      await db.$transaction(async (tx) => {
        await tx.subscription.create({
          data: {
            userId: session.user.id,
            tierKey: DEFAULT_TIER_KEY,
            plan: planId,
            amount: plan.amount,
            status: 'ACTIVE',
            paystackRef: reference,
            expiresAt,
            createdBy: session.user.id,
          },
        })

        await tx.user.update({
          where: { id: session.user.id },
          data: {
            isPremium: true,
            premiumExpiresAt: expiresAt,
            planTier: DEFAULT_TIER_KEY,
          },
        })
      })

      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Subscription activated!',
      })
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription?verified=true&ref=${reference}`

    const paystackResponse = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || session.user.email,
        amount: Math.round(plan.amount * 100),
        reference,
        callback_url: callbackUrl,
        metadata: {
          userId: session.user.id,
          type: 'subscription',
          planId,
          months: plan.months,
          tierKey: DEFAULT_TIER_KEY,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      planId,
    })
  } catch (error) {
    console.error('Subscription initialize error:', error)
    return NextResponse.json({ error: 'Failed to initialize subscription' }, { status: 500 })
  }
}
