import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bio, subjects, experience, reason, sampleTitle, sampleDescription } = body

    if (!bio || !subjects || !subjects.length) {
      return NextResponse.json({ error: 'Bio and at least one subject are required' }, { status: 400 })
    }

    if (bio.length < 100) {
      return NextResponse.json({ error: 'Bio must be at least 100 characters' }, { status: 400 })
    }

    const existing = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existing) {
      return NextResponse.json({ error: 'You already have a teacher profile' }, { status: 400 })
    }

    const profile = await db.teacherProfile.create({
      data: {
        userId: session.user.id,
        bio,
        subjects: JSON.stringify(subjects),
        experience: experience || null,
        reason: reason || null,
        sampleTitle: sampleTitle || null,
        sampleDescription: sampleDescription || null,
        status: 'PENDING',
      },
    })

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'Teacher Application Submitted',
        message: 'Your teacher application has been submitted and is pending review. You will be notified once a decision is made.',
        type: 'SYSTEM',
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error submitting teacher application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
