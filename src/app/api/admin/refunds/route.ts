import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET: Admin view of all refund requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'REFUNDED'
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status === 'ALL') {
      where.status = { in: ['REFUNDED', 'PENDING'] }
    } else {
      where.status = status
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate)
      }
    }

    const [refunds, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          course: {
            select: { id: true, title: true, icon: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    // Calculate summary stats
    const summary = await db.payment.aggregate({
      where: { status: 'REFUNDED' },
      _count: true,
      _sum: { amount: true },
    })

    return NextResponse.json({
      refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalRefunds: summary._count,
        totalAmountRefunded: summary._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error('Admin refunds API error:', error)
    return NextResponse.json({ error: 'Failed to fetch refund data' }, { status: 500 })
  }
}
