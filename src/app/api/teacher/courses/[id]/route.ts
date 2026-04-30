import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const course = await db.course.findUnique({
      where: { id },
      select: { teacherId: true },
    })

    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: 'Course not found or not yours' }, { status: 404 })
    }

    const { title, description, categoryId, difficulty, price, isFree, icon, color, status } = body

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (price !== undefined) updateData.price = price
    if (isFree !== undefined) updateData.isFree = isFree
    if (icon !== undefined) updateData.icon = icon
    if (color !== undefined) updateData.color = color

    // Handle status changes
    if (status !== undefined) {
      if (status === 'UNDER_REVIEW') {
        // Submit for review - course must have at least one module
        const moduleCount = await db.module.count({
          where: { courseId: id },
        })
        if (moduleCount === 0) {
          return NextResponse.json(
            { error: 'Course must have at least one module before submitting for review' },
            { status: 400 }
          )
        }
        updateData.status = 'UNDER_REVIEW'
      } else if (status === 'DRAFT') {
        updateData.status = 'DRAFT'
      } else if (status === 'PUBLISHED' || status === 'UNLISTED') {
        // Only admin or system can publish - teachers can only set DRAFT or UNDER_REVIEW
        return NextResponse.json(
          { error: 'Cannot set status to PUBLISHED or UNLISTED directly. Submit for review.' },
          { status: 400 }
        )
      } else {
        updateData.status = status
      }
    }

    const updatedCourse = await db.course.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        _count: {
          select: { enrollments: true, reviews: true, modules: true },
        },
      },
    })

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const { id } = await params

    // Verify ownership
    const course = await db.course.findUnique({
      where: { id },
      select: { teacherId: true, status: true },
    })

    if (!course || course.teacherId !== user.id) {
      return NextResponse.json({ error: 'Course not found or not yours' }, { status: 404 })
    }

    // Only DRAFT courses can be deleted
    if (course.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft courses can be deleted' },
        { status: 400 }
      )
    }

    await db.course.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
