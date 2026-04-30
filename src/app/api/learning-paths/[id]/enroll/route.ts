import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    const studyPath = await db.studyPath.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isActive: true },
        },
      },
    })

    if (!studyPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }

    // Check if courses in the study path are returned with isFree field
    // Enroll user in all courses in this path, setting proper payment status
    let enrolledCount = 0
    let pendingCount = 0
    for (const course of studyPath.courses) {
      try {
        // Determine payment status based on whether the course is free
        const paymentStatus = course.isFree ? 'FREE' : 'PENDING'

        await db.enrollment.upsert({
          where: {
            userId_courseId: { userId: user.id, courseId: course.id },
          },
          create: {
            userId: user.id,
            courseId: course.id,
            paymentStatus,
          },
          update: {
            // Only update paymentStatus if currently FREE and course is paid
            ...(paymentStatus === 'PENDING' ? { paymentStatus: 'PENDING' } : {}),
          },
        })
        enrolledCount++
        if (paymentStatus === 'PENDING') pendingCount++
      } catch {
        // Already enrolled, skip
      }
    }

    return NextResponse.json({
      success: true,
      enrolledCount,
      pendingCount,
      totalCourses: studyPath.courses.length,
    })
  } catch (error) {
    console.error('Failed to enroll in learning path:', error)
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}
