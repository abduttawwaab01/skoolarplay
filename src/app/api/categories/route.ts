import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cacheGetOrSet, CACHE_KEYS, CACHE_TTL, isRedisAvailable } from '@/lib/redis-cache'

export async function GET() {
  try {
    const useCache = isRedisAvailable()

    const categories = useCache
      ? await cacheGetOrSet(CACHE_KEYS.CATEGORIES_LIST, async () => {
          return db.category.findMany({
            where: { isActive: true },
            include: {
              _count: {
                select: {
                  courses: {
                    where: { isActive: true },
                  },
                },
              },
            },
            orderBy: { order: 'asc' },
          })
        }, CACHE_TTL.CATEGORIES)
      : await db.category.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: {
                courses: {
                  where: { isActive: true },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        })

    const formatted = categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      courseCount: cat._count?.courses ?? 0,
    }))

    return NextResponse.json({ categories: formatted })
  } catch (error: any) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
