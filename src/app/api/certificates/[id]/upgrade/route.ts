import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const PREMIUM_UPGRADE_COST = 200 // gems

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get certificate
    const certificate = await db.certificate.findUnique({
      where: { id },
      select: { userId: true, type: true },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    if (certificate.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (certificate.type === 'PREMIUM') {
      return NextResponse.json({ error: 'Certificate is already premium' }, { status: 400 })
    }

    // Check if user has enough gems
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { gems: true },
    })

    if (!user || user.gems < PREMIUM_UPGRADE_COST) {
      return NextResponse.json(
        { error: `Not enough gems. You need ${PREMIUM_UPGRADE_COST} gems.` },
        { status: 400 }
      )
    }

    // Atomic transaction: deduct gems and upgrade certificate
    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { gems: { decrement: PREMIUM_UPGRADE_COST } },
      }),
      db.certificate.update({
        where: { id },
        data: { type: 'PREMIUM', certificateLevel: 'premium' },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Certificate upgraded to premium!',
      gemsRemaining: updatedUser.gems,
    })
  } catch (error: any) {
    console.error('Certificate upgrade error:', error)
    return NextResponse.json({ error: 'Failed to upgrade certificate' }, { status: 500 })
  }
}
