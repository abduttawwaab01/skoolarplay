import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // PENDING, COMPLETED, FAILED, REFUNDED
    const sort = searchParams.get('sort') || '-createdAt' // - for descending

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.paymentStatus = status
    }

    // Get total count for pagination
    const total = await db.donation.count({ where })

    // Get donations with pagination and sorting
    const donations = await db.donation.findMany({
      where,
      orderBy: { [sort.replace('-', '')]: sort.startsWith('-') ? 'desc' : 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        donorName: true,
        donorEmail: true,
        amount: true,
        tier: true,
        message: true,
        isAnonymous: true,
        paymentRef: true,
        paymentStatus: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Get summary stats
    const completedStats = await db.donation.aggregate({
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
      _count: { id: true },
    })

    const totalRaised = completedStats._sum.amount || 0

    const donorCount = await db.donation.groupBy({
      by: ['donorName'],
      _count: { donorName: true },
    }).then(res => res.length)

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalRaised,
        donorCount,
        totalDonations: total,
        byStatus: completedStats,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate required fields
    if (!body.donorName || !body.amount) {
      return NextResponse.json(
        { error: 'Donor name and amount are required' },
        { status: 400 }
      )
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than zero' },
        { status: 400 }
      )
    }

    // Create donation record
    const donation = await db.donation.create({
      data: {
        donorName: body.donorName,
        donorEmail: body.donorEmail || null,
        amount: body.amount,
        tier: body.tier || null,
        message: body.message || null,
        isAnonymous: body.isAnonymous || false,
        paymentRef: body.paymentRef || null,
        paymentStatus: body.paymentStatus || 'COMPLETED', // Admin can create completed donations directly
        provider: body.provider || 'DIRECT',
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
      select: {
        id: true,
        donorName: true,
        donorEmail: true,
        amount: true,
        tier: true,
        message: true,
        isAnonymous: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    // If donation is COMPLETED, update DonationSettings currentAmount
    if (donation.paymentStatus === 'COMPLETED') {
      const settings = await db.donationSettings.findFirst()
      if (settings) {
        await db.donationSettings.update({
          where: { id: settings.id },
          data: {
            currentAmount: {
              increment: donation.amount,
            },
          },
        })
      }
    }

    return NextResponse.json(
      { success: true, donation },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create donation' },
      { status: 500 }
    )
  }
}
