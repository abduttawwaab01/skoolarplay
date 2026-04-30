import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Paystack webhook and verification for donations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const donationId = searchParams.get('donationId')

    if (!reference || !donationId) {
      return NextResponse.json(
        { error: 'Reference and donationId are required' },
        { status: 400 }
      )
    }

    // Fetch donation from database
    // We need to use a direct db connection here; in practice we'd use Prisma
    // but this is a simplified endpoint that redirects to manual verification
    // In production, the webhook endpoint should handle updates

    // For now, return a simple page indicating verification status
    // The actual payment verification should be handled by the webhook

    return NextResponse.json({
      message: 'Verification endpoint - use webhook for real updates',
      reference,
      donationId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

// Webhook endpoint - called by Paystack
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature') || ''
    const payload = JSON.parse(body)

    // Verify webhook signature
    const settings = await db.donationSettings.findFirst()
    if (!settings?.paystackSecretKey) {
      return NextResponse.json({ error: 'Paystack secret not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha512', settings.paystackSecretKey)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Handle event
    const event = payload.event

    if (event === 'charge.success') {
      const reference = payload.data.reference
      const amount = payload.data.amount / 100 // Convert kobo to NGN

      // Find and update donation record
      const donation = await db.donation.findFirst({
        where: { paymentRef: reference },
      })

      if (donation && donation.paymentStatus !== 'COMPLETED') {
        await db.donation.update({
          where: { id: donation.id },
          data: {
            paymentStatus: 'COMPLETED',
            amount: amount, // Ensure amount is correct
          },
        })

        // Update currentAmount in DonationSettings
        const settings = await db.donationSettings.findFirst()
        if (settings) {
          await db.donationSettings.update({
            where: { id: settings.id },
            data: {
              currentAmount: {
                increment: amount,
              },
            },
          })
        }
      }
    } else if (event === 'charge.failed') {
      const reference = payload.data.reference
      const donation = await db.donation.findFirst({
        where: { paymentRef: reference },
      })
      if (donation) {
        await db.donation.update({
          where: { id: donation.id },
          data: { paymentStatus: 'FAILED' },
        })
      }
    } else if (event === 'refund.created') {
      const reference = payload.data.transaction.reference
      const donation = await db.donation.findFirst({
        where: { paymentRef: reference },
      })
      if (donation) {
        await db.donation.update({
          where: { id: donation.id },
          data: { paymentStatus: 'REFUNDED' },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Donation webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    )
  }
}
