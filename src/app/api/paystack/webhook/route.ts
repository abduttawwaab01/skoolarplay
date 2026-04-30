import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/lib/db'
import crypto from 'crypto'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET

function verifyPaystackSignature(payload: string, signature: string): boolean {
  if (!PAYSTACK_WEBHOOK_SECRET) {
    console.error('PAYSTACK_WEBHOOK_SECRET is not set')
    return false
  }
  
  const hash = crypto
    .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  
  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headersList = await headers()
    const signature = headersList.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (PAYSTACK_WEBHOOK_SECRET && !verifyPaystackSignature(payload, signature)) {
      console.error('Invalid Paystack signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(payload)
    const eventType = event.event

    console.log(`Paystack webhook received: ${eventType}`)

    switch (eventType) {
      case 'charge.success': {
        const data = event.data
        const metadata = data.metadata || {}

        if (metadata.type === 'subscription') {
          const { userId, planId, months, tierKey } = metadata
          const reference = data.reference

          if (!userId || !planId || !months) {
            console.error('Missing required metadata for subscription:', metadata)
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
          }

          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + parseInt(months, 10))

          await db.$transaction(async (tx) => {
            const existingSubscription = await tx.subscription.findFirst({
              where: {
                userId,
                status: 'PENDING',
                paystackRef: reference,
              },
            })

            if (existingSubscription) {
              await tx.subscription.update({
                where: { id: existingSubscription.id },
                data: {
                  status: 'ACTIVE',
                  paystackRef: reference,
                  expiresAt,
                },
              })
            } else {
              await tx.subscription.create({
                data: {
                  userId,
                  tierKey: tierKey || 'PRO',
                  plan: planId,
                  amount: data.amount / 100,
                  status: 'ACTIVE',
                  paystackRef: reference,
                  expiresAt,
                  createdBy: userId,
                },
              })
            }

            await tx.user.update({
              where: { id: userId },
              data: {
                isPremium: true,
                premiumExpiresAt: expiresAt,
                planTier: tierKey || 'PRO',
              },
            })

            console.log(`Subscription activated for user ${userId} with plan ${planId}`)
          })
        }
        break
      }

      case 'subscription.disable': {
        const data = event.data
        const subscriptionCode = data.subscription_code

        await db.subscription.updateMany({
          where: {
            userId: data.customer?.id?.toString(),
            status: 'ACTIVE',
          },
          data: {
            status: 'CANCELLED',
          },
        })

        await db.user.updateMany({
          where: {
            id: data.customer?.id?.toString(),
            isPremium: true,
          },
          data: {
            isPremium: false,
            planTier: 'FREE',
          },
        })

        console.log(`Subscription cancelled: ${subscriptionCode}`)
        break
      }

      case 'subscription.not_renewal': {
        const data = event.data
        console.log(`Subscription will not renew: ${data.subscription_code}`)
        break
      }

      default:
        console.log(`Unhandled Paystack event: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
