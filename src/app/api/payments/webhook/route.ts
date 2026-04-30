import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

interface PaystackWebhookEvent {
  event: string
  data: {
    id?: number
    reference?: string
    amount?: number
    currency?: string
    status?: string
    metadata?: {
      courseId?: string
      userId?: string
      type?: string
      planId?: string
      months?: number
      tierKey?: string
    }
    customer?: {
      email?: string
    }
    plan?: string
  }
}

async function verifyPaystackSignature(payload: string, signature: string | null): Promise<boolean> {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
  if (!PAYSTACK_SECRET_KEY || !signature) return false

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')

  return hash === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-paystack-signature')
    
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const isValid = await verifyPaystackSignature(rawBody, signature)
    if (!isValid) {
      console.error('Invalid Paystack signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event: PaystackWebhookEvent = JSON.parse(rawBody)

    switch (event.event) {
      case 'charge.success': {
        const { reference, metadata, amount, customer } = event.data
        
        if (!reference || !metadata?.courseId || !metadata?.userId) {
          console.error('Missing required fields in webhook:', event.data)
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const course = await db.course.findUnique({
          where: { id: metadata.courseId },
        })

        if (!course) {
          console.error('Course not found:', metadata.courseId)
          return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        const updatedEnrollment = await db.$transaction(async (tx) => {
          // Check or create enrollment
          let enrollment = await tx.enrollment.findFirst({
            where: { paymentRef: reference },
          })

          if (enrollment) {
            enrollment = await tx.enrollment.update({
              where: { id: enrollment.id },
              data: { paymentStatus: 'PAID', paidAt: new Date() },
            })
          }

          // Process teacher earnings
          if (course.teacherId) {
            const teacherProfile = await tx.teacherProfile.findUnique({
              where: { userId: course.teacherId },
            })

            if (teacherProfile) {
              const teacherEarnings = amount
                ? (amount / 100) * (1 - teacherProfile.commissionRate)
                : 0

              await tx.teacherProfile.update({
                where: { id: teacherProfile.id },
                data: {
                  totalEarnings: { increment: teacherEarnings },
                  availableBalance: { increment: teacherEarnings },
                },
              })
            }
          }

          // Create payment record
          const paymentData = {
            userId: metadata.userId!,
            courseId: metadata.courseId!,
            amount: amount ? amount / 100 : 0,
            currency: 'NGN',
            status: 'COMPLETED',
            provider: 'PAYSTACK',
            reference,
            metadata: JSON.stringify({
              type: 'COURSE_PURCHASE',
              email: customer?.email,
            }),
          }
          await tx.payment.create({
            data: paymentData as any,
          })

          // Create notification
          const notificationData = {
            userId: metadata.userId!,
            title: 'Payment Successful!',
            message: `Your payment for "${course.title}" has been confirmed. You now have full access!`,
            type: 'INFO',
            link: `course?courseId=${metadata.courseId}`,
          }
          await tx.notification.create({
            data: notificationData as any,
          })

          return enrollment
        })

        console.log(`Payment verified via webhook: ${reference}, enrollment: ${updatedEnrollment?.id}`)
        break
      }

      case 'subscription.create': {
        const { reference, metadata, status } = event.data
        
        if (metadata?.userId && reference) {
          const isActive = status === 'active'
          const months = metadata.months || 1
          
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + months)

          await db.$transaction(async (tx) => {
            await tx.subscription.updateMany({
              where: { paystackRef: reference, status: 'ACTIVE' },
              data: { expiresAt },
            })

            await tx.user.update({
              where: { id: metadata.userId },
              data: {
                isPremium: isActive,
                premiumExpiresAt: isActive ? expiresAt : null,
                planTier: metadata.tierKey || 'PRO',
              },
            })

            if (metadata.userId) {
              await tx.notification.create({
                data: {
                  userId: metadata.userId,
                  title: 'Premium Activated!',
                  message: 'Your SkoolarPlay+ subscription is now active. Enjoy all premium features!',
                  type: 'INFO',
                },
              })
            }
          })

          console.log(`Subscription created: user=${metadata.userId}, ref=${reference}, months=${months}`)
        }
        break
      }

      case 'subscription.disable': {
        const { metadata, status } = event.data
        
        if (metadata?.userId) {
          const isActive = status === 'active'
          
          if (!isActive) {
            await db.user.update({
              where: { id: metadata.userId },
              data: {
                isPremium: false,
                premiumExpiresAt: null,
                planTier: 'FREE',
              },
            })

            await db.notification.create({
              data: {
                userId: metadata.userId,
                title: 'Premium Expired',
                message: 'Your SkoolarPlay+ subscription has expired. Some features may be restricted.',
                type: 'INFO',
              },
            })

            console.log(`Subscription disabled: user=${metadata.userId}`)
          }
        }
        break
      }

      case 'refund.created': {
        const { reference } = event.data
        
        if (reference) {
          const payment = await db.payment.findFirst({
            where: { reference },
            include: { user: true },
          })

          if (payment) {
            await db.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: payment.id },
                data: { refunded: true },
              })

              await tx.enrollment.updateMany({
                where: {
                  userId: payment.userId,
                  courseId: payment.courseId,
                  paymentStatus: 'PAID',
                },
                data: { paymentStatus: 'REFUNDED' },
              })

              if (payment.userId && payment.courseId) {
                await tx.notification.create({
                  data: {
                    userId: payment.userId,
                    title: 'Refund Processed',
                    message: `Your refund for the course purchase has been processed. The amount will be credited to your account within 5-10 business days.`,
                    type: 'WARNING',
                  },
                })
              }
            })

            console.log(`Refund processed: ${reference}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
