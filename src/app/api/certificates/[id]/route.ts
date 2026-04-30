import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
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

    // Fetch certificate with user details
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Only the certificate owner can view it
    if (certificate.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch course details for additional info
    const course = await db.course.findUnique({
      where: { id: certificate.courseId },
      select: { title: true, description: true, difficulty: true, category: true },
    })

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        courseName: certificate.courseName,
        verificationCode: certificate.verificationCode,
        type: certificate.type,
        certificateLevel: certificate.certificateLevel,
        score: certificate.score,
        totalLessons: certificate.totalLessons,
        completedLessons: certificate.completedLessons,
        issuedBy: certificate.issuedBy,
        ownerName: certificate.ownerName,
        earnedAt: certificate.earnedAt,
        userName: certificate.user.name,
        userEmail: certificate.user.email,
        course: course ? {
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          category: course.category?.name,
        } : null,
      },
    })
  } catch (error: any) {
    console.error('Certificate fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 })
  }
}
