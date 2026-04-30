import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const profile = await db.teacherProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, createdAt: true },
        },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Get published courses by this teacher
    const courses = await db.course.findMany({
      where: { teacherId: profile.userId, status: 'PUBLISHED', isActive: true },
      select: { id: true, title: true, icon: true, color: true, difficulty: true, price: true, isFree: true },
    })

    // Get reviews for this teacher
    const reviews = await db.courseReview.findMany({
      where: { teacherId: profile.id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
    const averageRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0

    return NextResponse.json({
      teacher: {
        id: profile.id,
        bio: profile.bio,
        subjects: profile.subjects,
        experience: profile.experience,
        rating: profile.rating,
        totalStudents: profile.totalStudents,
        totalCourses: profile.totalCourses,
        status: profile.status,
        isVerified: profile.isVerified,
        createdAt: profile.createdAt,
        user: profile.user,
        averageRating,
        reviewCount: reviews.length,
        courses,
      },
    })
  } catch (error) {
    console.error('Error fetching teacher profile:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher profile' }, { status: 500 })
  }
}
