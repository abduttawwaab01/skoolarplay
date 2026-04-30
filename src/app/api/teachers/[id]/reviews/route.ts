import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const profile = await db.teacherProfile.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    const reviews = await db.courseReview.findMany({
      where: { teacherId: profile.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        course: {
          select: { id: true, title: true, icon: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { courseId, rating, comment } = body

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Valid courseId and rating (1-5) are required' },
        { status: 400 }
      )
    }

    // Verify teacher profile exists
    const profile = await db.teacherProfile.findUnique({
      where: { id },
      select: { id: true, userId: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 })
    }

    // Verify course belongs to this teacher
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { teacherId: true },
    })

    if (!course || course.teacherId !== profile.userId) {
      return NextResponse.json({ error: 'Course not found or does not belong to this teacher' }, { status: 400 })
    }

    // Check user hasn't already reviewed this course
    const existingReview = await db.courseReview.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId },
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 })
    }

    // Create the review
    const review = await db.courseReview.create({
      data: {
        userId: session.user.id,
        courseId,
        teacherId: profile.id,
        rating,
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
    })

    // Update teacher's aggregated rating
    const allReviews = await db.courseReview.findMany({
      where: { teacherId: profile.id },
      select: { rating: true },
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    await db.teacherProfile.update({
      where: { id: profile.id },
      data: { rating: Math.round(avgRating * 10) / 10 },
    })

    // Create notification for teacher
    await db.notification.create({
      data: {
        userId: profile.userId,
        title: 'New Review',
        message: `You received a ${rating}-star review on your course.`,
        type: 'SOCIAL',
        link: `/courses/${courseId}`,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
