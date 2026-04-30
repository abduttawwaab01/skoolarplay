import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

async function verifyOwnership(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  const user = session.user as any
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  })
  if (!course || course.teacherId !== user.id) {
    return { error: NextResponse.json({ error: 'Course not found or not yours' }, { status: 404 }), user }
  }
  return { error: null, user }
}

// GET - List lessons for a module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
    }

    // Verify module belongs to this course
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    })
    if (!moduleData || moduleData.courseId !== id) {
      return NextResponse.json({ error: 'Module not found or does not belong to this course' }, { status: 404 })
    }

    const lessons = await db.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { questions: true, progress: true },
        },
      },
    })

    return NextResponse.json({ lessons })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

// POST - Create lesson
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const body = await request.json()
    const { moduleId, title, type, xpReward, gemReward } = body

    if (!moduleId || !title) {
      return NextResponse.json(
        { error: 'Module ID and lesson title are required' },
        { status: 400 }
      )
    }

    // Verify module belongs to this course
    const moduleData = await db.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    })

    if (!moduleData || moduleData.courseId !== id) {
      return NextResponse.json({ error: 'Module not found or does not belong to this course' }, { status: 400 })
    }

    // Get next order number
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = lastLesson ? lastLesson.order + 1 : 0

    const lesson = await db.lesson.create({
      data: {
        title,
        moduleId,
        type: type || 'QUIZ',
        order: nextOrder,
        xpReward: xpReward || 10,
        gemReward: gemReward || 1,
      },
    })

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}

// PUT - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const body = await request.json()
    const { lessonId, title, type, xpReward, gemReward, order, isActive } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verify lesson belongs to this course via module
    const lessonData = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    })
    if (!lessonData || lessonData.module.courseId !== id) {
      return NextResponse.json({ error: 'Lesson not found or does not belong to this course' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.type = type
    if (xpReward !== undefined) updateData.xpReward = xpReward
    if (gemReward !== undefined) updateData.gemReward = gemReward
    if (order !== undefined) updateData.order = order
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedLesson = await db.lesson.update({
      where: { id: lessonId },
      data: updateData,
    })

    return NextResponse.json({ lesson: updatedLesson })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 })
  }
}

// DELETE - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verify lesson belongs to this course via module
    const lessonData = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    })
    if (!lessonData || lessonData.module.courseId !== id) {
      return NextResponse.json({ error: 'Lesson not found or does not belong to this course' }, { status: 404 })
    }

    await db.lesson.delete({ where: { id: lessonId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 })
  }
}
