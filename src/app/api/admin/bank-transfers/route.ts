import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))

    const where: { status?: string } = {}
    if (status) {
      where.status = status
    }

    const [transfers, total] = await Promise.all([
      db.bankTransfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.bankTransfer.count({ where }),
    ])

    const stats = await db.bankTransfer.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true },
    })

    const statsMap = stats.reduce((acc, s) => {
      acc[s.status] = { count: s._count, totalAmount: s._sum?.amount || 0 }
      return acc
    }, {} as Record<string, { count: number; totalAmount: number }>)

    return NextResponse.json({
      transfers: transfers.map(t => ({
        id: t.id,
        paymentRef: t.paymentRef,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentType: t.paymentType,
        courseId: t.courseId,
        planType: t.planType,
        expiresAt: t.expiresAt,
        verifiedAt: t.verifiedAt,
        verifiedBy: t.verifiedBy,
        rejectionReason: t.rejectionReason,
        createdAt: t.createdAt,
        user: {
          id: t.user.id,
          name: t.user.name,
          email: t.user.email,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        pending: statsMap['PENDING'] || { count: 0, totalAmount: 0 },
        awaiting: statsMap['AWAITING_PAYMENT'] || { count: 0, totalAmount: 0 },
        verified: statsMap['VERIFIED'] || { count: 0, totalAmount: 0 },
        rejected: statsMap['REJECTED'] || { count: 0, totalAmount: 0 },
        expired: statsMap['EXPIRED'] || { count: 0, totalAmount: 0 },
      },
    })
  } catch (error) {
    console.error('Admin bank transfers error:', error)
    return NextResponse.json({ error: 'Failed to fetch bank transfers' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = session.user.id
    const body = await request.json()
    const { id, action, rejectionReason } = body as {
      id: string
      action: 'VERIFY' | 'REJECT'
      rejectionReason?: string
    }

    if (!id || !action) {
      return NextResponse.json({ error: 'ID and action are required' }, { status: 400 })
    }

    if (action === 'REJECT' && !rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    if (action === 'REJECT' && rejectionReason && rejectionReason.length > 500) {
      return NextResponse.json({ error: 'Rejection reason too long (max 500 characters)' }, { status: 400 })
    }

    const now = new Date()
    const newStatus = action === 'VERIFY' ? 'VERIFIED' : 'REJECTED'

    const result = await db.$transaction(async (tx) => {
      const transfer = await tx.bankTransfer.update({
        where: {
          id,
          status: { in: ['PENDING', 'AWAITING_PAYMENT'] }
        },
        data: {
          status: newStatus,
          verifiedAt: now,
          verifiedBy: adminId,
          rejectionReason: action === 'REJECT' ? rejectionReason : undefined,
        },
        include: { user: true },
      })

      if (!transfer) {
        throw new Error('TRANSFER_ALREADY_PROCESSED')
      }

      if (action === 'VERIFY') {
        if (transfer.paymentType === 'COURSE' && transfer.courseId) {
          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: transfer.userId,
                courseId: transfer.courseId,
              },
            },
            create: {
              userId: transfer.userId,
              courseId: transfer.courseId,
              paymentStatus: 'PAID',
            },
            update: {
              paymentStatus: 'PAID',
            },
          })

          await tx.payment.create({
            data: {
              userId: transfer.userId,
              courseId: transfer.courseId,
              amount: transfer.amount,
              currency: transfer.currency,
              status: 'COMPLETED',
              provider: 'BANK_TRANSFER',
              reference: transfer.paymentRef || `BT-${transfer.id}`,
            },
          })
        }

        if (transfer.paymentType === 'SUBSCRIPTION' && transfer.planType) {
          const validTiers = ['STARTER', 'PRO', 'SCHOLAR', 'SCHOLAR_PLUS']
          if (validTiers.includes(transfer.planType)) {
            await tx.user.update({
              where: { id: transfer.userId },
              data: {
                isPremium: true,
                premiumExpiresAt: null,
              },
            })

            await tx.subscription.create({
              data: {
                userId: transfer.userId,
                tierKey: transfer.planType,
                plan: 'lifetime',
                amount: transfer.amount,
                status: 'ACTIVE',
                paystackRef: transfer.paymentRef || 'BANK_TRANSFER',
                expiresAt: new Date('2099-12-31'),
                createdBy: adminId,
              },
            })
          }
        }

        if (transfer.paymentType === 'DONATION') {
          await tx.payment.create({
            data: {
              userId: transfer.userId,
              courseId: 'DONATION',
              amount: transfer.amount,
              currency: transfer.currency,
              status: 'COMPLETED',
              provider: 'BANK_TRANSFER',
              reference: transfer.paymentRef || `BT-${transfer.id}`,
            },
          })
        }

        await tx.notification.create({
          data: {
            userId: transfer.userId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Verified',
            message: `Your bank transfer of ${transfer.currency} ${transfer.amount.toLocaleString()} has been verified. ${
              transfer.paymentType === 'COURSE' ? 'You now have access to the course!' :
              transfer.paymentType === 'SUBSCRIPTION' ? `Your ${transfer.planType} subscription is now active!` :
              'Thank you for your donation!'
            }`,
          },
        })
      }

      if (action === 'REJECT') {
        await tx.notification.create({
          data: {
            userId: transfer.userId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Rejected',
            message: `Your bank transfer of ${transfer.currency} ${transfer.amount.toLocaleString()} has been rejected. Reason: ${rejectionReason}. Please contact support if you believe this is an error.`,
          },
        })
      }

      return { success: true }
    })

    return NextResponse.json({
      success: true,
      message: `Bank transfer ${action === 'VERIFY' ? 'verified' : 'rejected'} successfully`,
    })
  } catch (error: any) {
    if (error.message === 'TRANSFER_ALREADY_PROCESSED') {
      return NextResponse.json({ error: 'Transfer has already been processed' }, { status: 400 })
    }
    console.error('Admin bank transfer action error:', error)
    return NextResponse.json({ error: 'Failed to process bank transfer' }, { status: 500 })
  }
}
