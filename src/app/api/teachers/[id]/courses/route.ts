import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify teacher profile exists
    const profile = await db.teacherProfile.findUnique({
      where: { id },
      select: { userId: true, isVerified: true, status: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const courses = await db.course.findMany({
      where: {
        teacherId: profile.userId,
        status: 'PUBLISHED',
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        _count: {
          select: { enrollments: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate average rating for each course
    const coursesWithRating = await Promise.all(
      courses.map(async (course) => {
        const reviewStats = await db.courseReview.aggregate({
          where: { courseId: course.id },
          _avg: { rating: true },
          _count: { id: true },
        })

        return {
          id: course.id,
          title: course.title,
          description: course.description,
          icon: course.icon,
          color: course.color,
          difficulty: course.difficulty,
          price: course.price,
          isFree: course.isFree,
          category: course.category,
          enrollmentCount: course._count.enrollments,
          reviewCount: reviewStats._count.id,
          averageRating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0,
          createdAt: course.createdAt,
        }
      })
    )

    return NextResponse.json({ courses: coursesWithRating })
  } catch (error) {
    console.error('Error fetching teacher courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
