import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { referralSchema } from '@/lib/validation-schemas'
import { ZodError } from 'zod'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { email?: string }
    try {
      body = await req.json()
      referralSchema.parse(body)
    } catch (error: any) {
      if (error.name === 'ZodError' || error.constructor.name === 'ZodError') {
        return NextResponse.json(
          { error: error.errors?.[0]?.message || 'Validation failed' },
          { status: 400 }
        )
      }
      throw error
    }

    const email = body.email!

    // Check if user already submitted a referral
    const existingReferred = await db.referral.findUnique({
      where: { referredEmail: email },
    })

    if (existingReferred) {
      return NextResponse.json({ error: 'This email has already been referred!' }, { status: 400 })
    }

    // Create referral
    const referral = await db.referral.create({
      data: {
        referrerId: session.user.id,
        referredEmail: email,
        referredId: null,
      },
    })

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        referredEmail: referral.referredEmail,
        rewardGems: referral.rewardGems,
      },
    })
  } catch (error) {
    console.error('Referral error:', error)
    return NextResponse.json({ error: 'Failed to submit referral' }, { status: 500 })
  }
}
