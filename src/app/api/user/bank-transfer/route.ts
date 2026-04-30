import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const BANK_DETAILS = {
  bankName: process.env.BANK_NAME || 'First Bank of Nigeria',
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || '3084723948',
  accountName: process.env.BANK_ACCOUNT_NAME || 'SkoolarPlay Ltd',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { amount, paymentType, courseId, planType } = body as {
      amount: number
      paymentType: 'COURSE' | 'SUBSCRIPTION' | 'DONATION'
      courseId?: string
      planType?: string
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!paymentType) {
      return NextResponse.json({ error: 'Payment type is required' }, { status: 400 })
    }

    if (paymentType === 'COURSE' && !courseId) {
      return NextResponse.json({ error: 'Course ID is required for course payments' }, { status: 400 })
    }

    if (paymentType === 'SUBSCRIPTION' && !planType) {
      return NextResponse.json({ error: 'Plan type is required for subscription payments' }, { status: 400 })
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 48)

    const paymentRef = `BT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const bankTransfer = await db.bankTransfer.create({
      data: {
        userId,
        amount,
        currency: 'NGN',
        status: 'AWAITING_PAYMENT',
        paymentRef,
        paymentType,
        courseId: paymentType === 'COURSE' ? courseId : null,
        planType: paymentType === 'SUBSCRIPTION' ? planType : null,
        expiresAt,
        ...BANK_DETAILS,
      },
    })

    return NextResponse.json({
      success: true,
      paymentRef: bankTransfer.paymentRef,
      amount: bankTransfer.amount,
      currency: bankTransfer.currency,
      expiresAt: bankTransfer.expiresAt,
      bankDetails: {
        bankName: BANK_DETAILS.bankName,
        accountNumber: BANK_DETAILS.accountNumber,
        accountName: BANK_DETAILS.accountName,
      },
      instructions: [
        '1. Transfer the exact amount to the account details above',
        '2. Use the payment reference as your transfer description/reference',
        `3. Your reference is: ${bankTransfer.paymentRef}`,
        '4. After making the transfer, your payment will be verified within 24 hours',
      ],
    })
  } catch (error) {
    console.error('Bank transfer request error:', error)
    return NextResponse.json({ error: 'Failed to create bank transfer request' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    const where: any = { userId }
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
            select: { name: true, email: true },
          },
        },
      }),
      db.bankTransfer.count({ where }),
    ])

    return NextResponse.json({
      transfers: transfers.map(t => ({
        id: t.id,
        paymentRef: t.paymentRef,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentType: t.paymentType,
        expiresAt: t.expiresAt,
        verifiedAt: t.verifiedAt,
        rejectionReason: t.rejectionReason,
        createdAt: t.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      bankDetails: BANK_DETAILS,
    })
  } catch (error) {
    console.error('Bank transfer list error:', error)
    return NextResponse.json({ error: 'Failed to fetch bank transfers' }, { status: 500 })
  }
}
