import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any

    // Check user has TEACHER role or approved TeacherProfile
    const profile = await db.teacherProfile.findUnique({
      where: { userId: user.id },
    })

    if (!profile || (user.role !== 'TEACHER' && profile.status !== 'APPROVED')) {
      return NextResponse.json({ error: 'Not authorized as a teacher' }, { status: 403 })
    }

    // Get courses with enrollment counts and average rating
    const courses = await db.course.findMany({
      where: { teacherId: user.id },
      include: {
        _count: {
          select: { enrollments: true, reviews: true, modules: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compute average rating per course
    const courseRatings: Record<string, number> = {}
    courses.forEach((c) => {
      if (c.reviews.length > 0) {
        courseRatings[c.id] = c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
      }
    })

    // Get recent reviews
    const recentReviews = await db.courseReview.findMany({
      where: { teacherId: profile.id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get payout history
    const payouts = await db.teacherPayout.findMany({
      where: { teacherProfileId: profile.id },
      orderBy: { requestedAt: 'desc' },
      take: 10,
    })

    // Get student progress stats across all courses
    const courseIds = courses.map((c) => c.id)
    const enrollments = courseIds.length > 0
      ? await db.enrollment.findMany({
          where: { courseId: { in: courseIds } },
          select: { id: true, userId: true, courseId: true, progress: true },
        })
      : []

    // Total unique students
    const uniqueStudents = new Set(enrollments.map((e) => e.userId)).size
    // Completions (progress >= 100)
    const completions = enrollments.filter((e) => e.progress >= 100).length
    // Average completion rate
    const avgCompletionRate = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + Math.min(e.progress, 100), 0) / enrollments.length
      : 0
    // Overall average rating
    const allRatings = recentReviews.map((r) => r.rating)
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0

    // Get latest profile data
    const latestProfile = await db.teacherProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
      },
    })

    return NextResponse.json({
      profile: latestProfile,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        icon: c.icon,
        color: c.color,
        difficulty: c.difficulty,
        status: c.status,
        price: c.price,
        isFree: c.isFree,
        enrollments: c._count.enrollments,
        rating: courseRatings[c.id] || 0,
        reviewCount: c._count.reviews,
        moduleCount: c._count.modules,
        createdAt: c.createdAt,
      })),
      recentReviews,
      payouts,
      earningsSummary: {
        totalEarnings: profile.totalEarnings,
        availableBalance: profile.availableBalance,
        pendingPayouts: payouts
          .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
          .reduce((sum, p) => sum + p.amount, 0),
        commissionRate: profile.commissionRate,
      },
      analytics: {
        totalStudents: uniqueStudents,
        totalEnrollments: enrollments.length,
        totalCompletions: completions,
        avgCompletionRate: Math.round(avgCompletionRate),
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: allRatings.length,
      },
    })
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
