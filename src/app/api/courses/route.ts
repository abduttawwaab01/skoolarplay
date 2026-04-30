import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { cacheGet, cacheSet, cacheGetOrSet, CACHE_KEYS, CACHE_TTL, isRedisAvailable } from '@/lib/redis-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    let useCache = isRedisAvailable() && !categoryId && !search

    const where: any = { isActive: true }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Build cache key based on filters - include search if present
    let cacheKey: string
    if (search) {
      cacheKey = `courses:search:${search.toLowerCase().trim()}`
      useCache = false // Don't cache search results for better freshness
    } else if (categoryId) {
      cacheKey = `courses:cat:${categoryId}`
    } else {
      cacheKey = CACHE_KEYS.COURSES_LIST
    }

    // Fetch courses (with caching for general list)

    // Fetch courses (with caching for general list)
    const courses = useCache
      ? await cacheGetOrSet(cacheKey, async () => {
          return db.course.findMany({
            where,
            include: {
              category: {
                select: { id: true, name: true, icon: true, color: true },
              },
              modules: {
                include: {
                  lessons: {
                    where: { isActive: true },
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
          })
        }, CACHE_TTL.COURSES)
      : await db.course.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, icon: true, color: true },
            },
            modules: {
              include: {
                lessons: {
                  where: { isActive: true },
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
        })

    // Get session to check enrollment status
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    let enrolledCourseIds: string[] = []
    let enrollmentsMap: Record<string, any> = {}

    if (userId) {
      const enrollments = await db.enrollment.findMany({
        where: { userId },
        select: { courseId: true, progress: true },
      })
      enrolledCourseIds = enrollments.map((e) => e.courseId)
      enrollmentsMap = Object.fromEntries(enrollments.map((e) => [e.courseId, e]))
    }

    const formattedCourses = (courses || []).map((course: any) => {
      const totalLessons = (course.modules || []).reduce((sum: any, m: any) => sum + (m.lessons || []).length, 0)
      const enrollment = enrollmentsMap[course.id]

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        icon: course.icon,
        color: course.color,
        difficulty: course.difficulty,
        category: course.category,
        totalModules: (course.modules || []).length,
        totalLessons,
        enrollmentCount: course._count?.enrollments || 0,
        isEnrolled: enrolledCourseIds.includes(course.id),
        progress: enrollment?.progress || 0,
      }
    })

    return NextResponse.json({ courses: formattedCourses })
  } catch (error: any) {
    console.error('Courses API error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
