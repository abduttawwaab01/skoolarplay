import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, status: true },
    })

    if (!profile || profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not an approved teacher' }, { status: 403 })
    }

    const payouts = await db.teacherPayout.findMany({
      where: { teacherProfileId: profile.id },
      orderBy: { requestedAt: 'desc' },
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    // Get teacher profile with latest data
    const profile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile || profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not an approved teacher' }, { status: 403 })
    }

    // Validate minimum amount (5000 NGN)
    if (amount < 5000) {
      return NextResponse.json(
        { error: 'Minimum payout amount is 5,000 NGN' },
        { status: 400 }
      )
    }

    // Check available balance
    if (profile.availableBalance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ₦${profile.availableBalance.toLocaleString()}` },
        { status: 400 }
      )
    }

    // Check bank details are set
    if (!profile.bankName || !profile.accountNumber || !profile.accountName) {
      return NextResponse.json(
        { error: 'Please set your bank details before requesting a payout' },
        { status: 400 }
      )
    }

    // Generate reference
    const reference = `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create payout and deduct balance in a transaction
    const payout = await db.$transaction(async (tx) => {
      // Create payout
      const newPayout = await tx.teacherPayout.create({
        data: {
          teacherProfileId: profile.id,
          amount,
          status: 'PENDING',
          bankName: profile.bankName || '',
          accountNumber: profile.accountNumber || '',
          accountName: profile.accountName || '',
          reference,
        },
      })

      // Deduct from available balance
      await tx.teacherProfile.update({
        where: { id: profile.id },
        data: {
          availableBalance: { decrement: amount },
        },
      })

      return newPayout
    })

    return NextResponse.json({ payout }, { status: 201 })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 })
  }
}
