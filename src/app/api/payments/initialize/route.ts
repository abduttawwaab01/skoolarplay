import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { PAYSTACK_API_URL } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Get course details
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: { select: { id: true, name: true } },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check course is published and is paid
    if (course.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Course is not available for enrollment' }, { status: 400 })
    }

    if (course.isFree || (course.price === 0)) {
      return NextResponse.json({ error: 'This is a free course. Enroll directly.' }, { status: 400 })
    }

    // Check user is not already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 })
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

    // Generate a payment reference
    const reference = `SP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    if (!PAYSTACK_SECRET_KEY) {
      // Simulated payment flow - no live keys
      // Create enrollment with PENDING status
      const enrollment = await db.enrollment.create({
        data: {
          userId: session.user.id,
          courseId,
          paymentStatus: 'PENDING',
          paymentAmount: course.price,
          paymentRef: reference,
        },
      })

      return NextResponse.json({
        authorization_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payments/verify?reference=${reference}`,
        reference,
        access_code: `simulated_${Date.now()}`,
        enrollmentId: enrollment.id,
        simulated: true,
      })
    }

    // Live Paystack integration
    const paystackResponse = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: (session.user as any).email,
        amount: Math.round(course.price * 100), // Paystack expects amount in kobo
        reference,
        metadata: {
          courseId,
          userId: session.user.id,
          custom_fields: [
            {
              display_name: 'Course Title',
              variable_name: 'course_title',
              value: course.title,
            },
          ],
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json(
        { error: paystackData.message || 'Payment initialization failed' },
        { status: 500 }
      )
    }

    // Create enrollment with PENDING status
    await db.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        paymentStatus: 'PENDING',
        paymentAmount: course.price,
        paymentRef: reference,
      },
    })

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      access_code: paystackData.data.access_code,
      simulated: false,
    })
  } catch (error) {
    console.error('Error initializing payment:', error)
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 })
  }
}
