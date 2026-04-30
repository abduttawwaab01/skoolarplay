import { NextRequest, NextResponse } from 'next/server'
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

    // Verify teacher status
    const profile = await db.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, isVerified: true },
    })

    if (!profile || profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not an approved teacher' }, { status: 403 })
    }

    const courses = await db.course.findMany({
      where: { teacherId: user.id },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        _count: {
          select: { enrollments: true, reviews: true, modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching teacher courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any

    // Verify teacher status
    const profile = await db.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, isVerified: true },
    })

    if (!profile || profile.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Not an approved teacher' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, categoryId, difficulty, price, isFree, icon, color } = body

    if (!title || !categoryId) {
      return NextResponse.json(
        { error: 'Title and categoryId are required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await db.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Create course as DRAFT
    const course = await db.course.create({
      data: {
        title,
        description: description || null,
        categoryId,
        difficulty: difficulty || 'BEGINNER',
        price: price || 0,
        isFree: isFree !== undefined ? isFree : true,
        icon: icon || null,
        color: color || null,
        status: 'DRAFT',
        teacherId: user.id,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
