import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { PAYSTACK_API_URL } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    let paymentVerified = false
    let paymentData: Record<string, unknown> | null = null

     if (PAYSTACK_SECRET_KEY) {
       // Verify with Paystack API
       const response = await fetch(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      })

      const data = await response.json()

      if (data.status && data.data?.status === 'success') {
        paymentVerified = true
        paymentData = data.data
      } else {
        return NextResponse.json(
          { error: data.message || 'Payment verification failed' },
          { status: 400 }
        )
      }
    } else {
      // Simulated verification - only succeed if enrollment's userId matches session
      const simEnrollment = await db.enrollment.findFirst({
        where: { paymentRef: reference },
      })
      if (!simEnrollment || simEnrollment.userId !== session.user.id) {
        return NextResponse.json({ error: 'Enrollment not found or unauthorized' }, { status: 403 })
      }
      paymentVerified = true
      paymentData = {
        status: 'success',
        reference,
        amount: 0,
      }
    }

    if (paymentVerified) {
      // Find the enrollment by reference
      const enrollment = await db.enrollment.findFirst({
        where: { paymentRef: reference },
        include: { course: true },
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }

      if (enrollment.paymentStatus === 'PAID') {
        return NextResponse.json({
          message: 'Payment already verified',
          enrollment,
        })
      }

      // Update enrollment to PAID
      const updatedEnrollment = await db.$transaction(async (tx) => {
        // Update enrollment
        const updated = await tx.enrollment.update({
          where: { id: enrollment.id },
          data: {
            paymentStatus: 'PAID',
            paidAt: new Date(),
          },
        })

        // Credit teacher earnings if course has a teacher
        if (enrollment.course.teacherId) {
          const teacherProfile = await tx.teacherProfile.findUnique({
            where: { userId: enrollment.course.teacherId },
          })

          if (teacherProfile) {
            const teacherEarnings = enrollment.paymentAmount
              ? enrollment.paymentAmount * (1 - teacherProfile.commissionRate)
              : 0

            await tx.teacherProfile.update({
              where: { id: teacherProfile.id },
              data: {
                totalEarnings: { increment: teacherEarnings },
                availableBalance: { increment: teacherEarnings },
              },
            })
          }
        }

        return updated
      })

      return NextResponse.json({
        message: 'Payment verified successfully',
        enrollment: updatedEnrollment,
      })
    }

    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
