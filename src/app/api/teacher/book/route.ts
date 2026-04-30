import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Using an atomic transaction to prevent race conditions on gem deduction
    const result = await db.$transaction(async (tx) => {
      const student = await tx.user.findUnique({
        where: { id: userId }
      })

      if (!student) {
        throw new Error('User not found')
      }

      const body = await req.json()
      const { teacherProfileId, scheduleDate, durationMinutes, notes, paymentMethod, price } = body

      if (!teacherProfileId || !scheduleDate || !durationMinutes || price === undefined) {
        throw new Error('Missing required booking fields')
      }

      if (paymentMethod === 'GEMS') {
        if (student.gems < price) {
          throw new Error('Insufficient gems')
        }

        // Deduct gems from student
        await tx.user.update({
          where: { id: student.id },
          data: { gems: { decrement: price } }
        })
      }

      // Create Booking
      const booking = await tx.teacherBooking.create({
        data: {
          teacherProfileId,
          studentId: student.id,
          scheduleDate: new Date(scheduleDate),
          durationMinutes,
          notes,
          paymentMethod,
          price,
          status: 'PENDING',
          paymentStatus: paymentMethod === 'GEMS' ? 'PAID' : 'PENDING'
        }
      })

      // Send a notification message to the teacher
      const teacherProfile = await tx.teacherProfile.findUnique({
        where: { id: teacherProfileId }
      })

      if (teacherProfile) {
        await tx.teacherMessage.create({
          data: {
            senderId: student.id,
            recipientId: teacherProfile.userId,
            subject: 'New 1-on-1 Class Request',
            content: `I have requested a ${durationMinutes}-minute class on ${new Date(scheduleDate).toLocaleString()}. Note: ${notes || 'None'}. Please accept and provide a meeting link.`,
          }
        })
      }

      return booking
    })

    return NextResponse.json({ success: true, booking: result })

  } catch (error: any) {
    console.error('Teacher booking error:', error)
    // Send 400 for user errors (like Insufficient gems)
    if (error.message === 'Insufficient gems' || error.message.includes('Missing')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 })
  }
}
