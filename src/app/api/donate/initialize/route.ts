import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { PAYSTACK_API_URL } from '@/lib/constants'

// Donation initialization - creates a Paystack payment for a donation
export async function POST(req: NextRequest) {
  try {
    // Try to get session but don't require it - allow guest donations
    const session = await getServerSession(authOptions)
    
    const body = await req.json()
    const { amount, tier, donorName, donorEmail, message, isAnonymous } = body

    // Validate amount
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Validate email is provided for guest donations
    if (!donorEmail && !session?.user?.email) {
      return NextResponse.json({ error: 'Email is required for donation' }, { status: 400 })
    }

    // Get donation settings
    const settings = await db.donationSettings.findFirst()
    if (!settings || !settings.paystackPublicKey || !settings.isActive) {
      return NextResponse.json(
        { error: 'Donations are currently disabled or not configured' },
        { status: 403 }
      )
    }

    // Generate unique reference
    const reference = `don_${crypto.randomBytes(10).toString('hex')}`

    // Get user info from session or use guest info
    const userName = donorName || session?.user?.name || 'Guest Donor'
    const userEmail = donorEmail || session?.user?.email || ''

    // Create pending donation record
    const donation = await db.donation.create({
      data: {
        donorName: userName,
        donorEmail: userEmail,
        amount: amountNum,
        tier: tier || null,
        message: message || null,
        isAnonymous: isAnonymous || false,
        paymentRef: reference,
        paymentStatus: 'PENDING',
        provider: 'PAYSTACK',
      },
    })

     // Initialize Paystack payment
     const paystackUrl = `${PAYSTACK_API_URL}/transaction/initialize`
    const payload = {
      email: userEmail,
      amount: Math.round(amountNum * 100), // Paystack uses kobo
      reference,
      callback_url: `${req.nextUrl.origin}/api/donate/verify?reference=${reference}&donationId=${donation.id}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Donation ID',
            variable_name: 'donation_id',
            value: donation.id,
          },
          {
            display_name: 'Donor Name',
            variable_name: 'donor_name',
            value: userName,
          },
        ],
      },
    }

    const response = await fetch(paystackUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.paystackPublicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok || !data.status) {
      // Update donation status to FAILED
      await db.donation.update({
        where: { id: donation.id },
        data: { paymentStatus: 'FAILED' },
      })
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: data.data.authorization_url,
      reference,
      donationId: donation.id,
    })
  } catch (error: any) {
    console.error('Donation initialize error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize donation' },
      { status: 500 }
    )
  }
}
