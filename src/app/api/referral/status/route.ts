import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Generate referral code from user ID
    const referralCode = user.id.slice(0, 8).toUpperCase()

    // Get referrals made
    const referrals = await db.referral.findMany({
      where: { referrerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const totalReferrals = referrals.length
    const claimedRewards = referrals.filter((r) => r.rewardClaimed).length
    const totalGemsEarned = claimedRewards * 25

    return NextResponse.json({
      referralCode,
      totalReferrals,
      claimedRewards,
      totalGemsEarned,
      rewardPerReferral: 25,
      referrals: referrals.map((r) => ({
        id: r.id,
        referredEmail: r.referredEmail,
        rewardClaimed: r.rewardClaimed,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('Referral status error:', error)
    return NextResponse.json({ error: 'Failed to get referral status' }, { status: 500 })
  }
}
