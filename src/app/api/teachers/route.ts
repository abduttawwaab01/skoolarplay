import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const teachers = await db.teacherProfile.findMany({
      where: { isVerified: true, status: 'APPROVED' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { rating: 'desc' },
      take: 20,
    })

    // Get review counts for each teacher
    const teachersWithReviews = await Promise.all(
      teachers.map(async (teacher) => {
        const reviewCount = await db.courseReview.count({
          where: { teacherId: teacher.id },
        })

        return {
          ...teacher,
          reviewCount,
        }
      })
    )

    return NextResponse.json({ teachers: teachersWithReviews })
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}
