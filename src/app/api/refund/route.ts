import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { logAudit } from '@/lib/audit-log'

// POST: Submit a refund request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, reason } = body as { paymentId: string; reason?: string }

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        course: {
          select: { title: true, teacherId: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Verify ownership
    if (payment.userId !== userId) {
      return NextResponse.json({ error: 'You do not own this payment' }, { status: 403 })
    }

    // Check if already refunded
    if (payment.refunded || payment.status === 'REFUNDED') {
      return NextResponse.json({ error: 'This payment has already been refunded' }, { status: 400 })
    }

    // Check if payment is completed
    if (payment.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Only completed payments can be refunded' }, { status: 400 })
    }

    // Check refund policy days
    const settings = await db.adminSettings.findFirst({
      select: { refundPolicyDays: true },
    })
    const refundPolicyDays = settings?.refundPolicyDays || 7

    const paymentDate = new Date(payment.createdAt)
    const now = new Date()
    const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSincePayment > refundPolicyDays) {
      return NextResponse.json({
        error: `Refund period has expired. Refunds must be requested within ${refundPolicyDays} days of purchase.`,
      }, { status: 400 })
    }

    // Check if teacher refund is enabled for course purchases
    if (payment.course?.teacherId) {
      const teacherSettings = await db.adminSettings.findFirst({
        select: { teacherRefundEnabled: true },
      })
      if (!teacherSettings?.teacherRefundEnabled) {
        return NextResponse.json({
          error: 'Teacher course refunds are currently disabled.',
        }, { status: 400 })
      }
    }

    // Process refund
    const updatedPayment = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refunded: true,
        metadata: JSON.stringify({
          ...(payment.metadata ? JSON.parse(payment.metadata) : {}),
          refundReason: reason || 'User requested refund',
          refundProcessedAt: new Date().toISOString(),
          daysSincePayment,
        }),
      },
    })

    // Remove premium if this was a premium payment
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    })

    if (user?.isPremium) {
      // Check if this payment was for premium by checking metadata or course
      const paymentMeta = payment.metadata ? JSON.parse(payment.metadata) : {}
      if (paymentMeta.type === 'premium' || paymentMeta.plan) {
        await db.user.update({
          where: { id: userId },
          data: {
            isPremium: false,
            premiumExpiresAt: null,
          },
        })
      }
    }

    // Create notification about refund
    await db.notification.create({
      data: {
        userId,
        title: 'Refund Processed',
        message: `Your refund of ₦${payment.amount.toLocaleString()} for "${payment.course?.title || 'Purchase'}" has been processed. The funds will be returned to your original payment method within 3-5 business days.`,
        type: 'INFO',
      },
    })

    // Audit log
    await logAudit({
      actorId: userId,
      actorName: session?.user?.name || 'User',
      action: 'REFUND',
      entity: 'Payment',
      entityId: paymentId,
      details: {
        amount: payment.amount,
        currency: payment.currency,
        reason,
        courseTitle: payment.course?.title,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: updatedPayment.id,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        status: updatedPayment.status,
      },
    })
  } catch (error) {
    console.error('Refund API error:', error)
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 })
  }
}

// GET: List refund history for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    // If admin, verify admin access
    if (isAdmin) {
      const session = await getServerSession(authOptions)
      const user = session?.user as any
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const where: Record<string, unknown> = {
        refunded: true,
      }

      if (status && status !== 'ALL') {
        where.status = status
      }

      const [refunds, total] = await Promise.all([
        db.payment.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            course: {
              select: { id: true, title: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        db.payment.count({ where }),
      ])

      return NextResponse.json({
        refunds,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // Regular user: return their own refund history
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const refunds = await db.payment.findMany({
      where: {
        userId,
        refunded: true,
      },
      include: {
        course: {
          select: { title: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ refunds })
  } catch (error) {
    console.error('Refund list API error:', error)
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 })
  }
}
