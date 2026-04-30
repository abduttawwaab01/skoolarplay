import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

async function verifyOwnership(request: NextRequest, courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null, user: null }
  }
  const user = session.user as any
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  })
  if (!course || course.teacherId !== user.id) {
    return { error: NextResponse.json({ error: 'Course not found or not yours' }, { status: 404 }), session, user }
  }
  return { error: null, session, user }
}

// GET - List modules with lessons for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error, session } = await verifyOwnership(request, id)
    if (error) return error

    const modules = await db.module.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { questions: true, progress: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Failed to fetch modules' }, { status: 500 })
  }
}

// POST - Create module
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(request, id)
    if (error) return error

    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json({ error: 'Module title is required' }, { status: 400 })
    }

    const lastModule = await db.module.findFirst({
      where: { courseId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const nextOrder = lastModule ? lastModule.order + 1 : 0

    const newModule = await db.module.create({
      data: {
        title,
        courseId: id,
        order: nextOrder,
      },
    })

    return NextResponse.json({ module: newModule }, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Failed to create module' }, { status: 500 })
  }
}

// PUT - Update module
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(request, id)
    if (error) return error

    const body = await request.json()
    const { moduleId, title, order } = body

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

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (order !== undefined) updateData.order = order

    const updatedModule = await db.module.update({
      where: { id: moduleId },
      data: updateData,
    })

    return NextResponse.json({ module: updatedModule })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: 'Failed to update module' }, { status: 500 })
  }
}

// DELETE - Delete module
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(request, id)
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

    await db.module.delete({ where: { id: moduleId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Failed to delete module' }, { status: 500 })
  }
}
