import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          category: true,
          modules: {
            include: {
              lessons: {
                select: { id: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { order: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.course.count({ where }),
    ])

    const coursesWithStats = courses.map(course => ({
      ...course,
      totalModules: course.modules.length,
      totalLessons: course.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    }))

    return NextResponse.json({
      courses: coursesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, categoryId, icon, color, difficulty, order, isActive, certificationEnabled, minimumLevel, isPremium } = body

    if (!title || !categoryId) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 })
    }

    const maxOrder = await db.course.aggregate({
      _max: { order: true },
      where: { categoryId },
    })

    const course = await db.course.create({
      data: {
        title,
        description,
        categoryId,
        icon: icon || '📚',
        color: color || '#008751',
        difficulty: difficulty || 'BEGINNER',
        order: order || ((maxOrder._max.order ?? 0) + 1),
        isActive: isActive ?? true,
        certificationEnabled: certificationEnabled ?? false,
        minimumLevel,
        isPremium: isPremium ?? false,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}