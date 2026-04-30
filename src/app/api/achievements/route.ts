import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { cacheGetOrSet, CACHE_KEYS } from '@/lib/redis-cache'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Cap at 50
    const skip = (page - 1) * limit

    // Get all achievements with caching (public data, cache for 30 min)
    const allAchievements = await cacheGetOrSet(
      CACHE_KEYS.ACHIEVEMENTS_LIST || 'achievements:list',
      async () => {
        return db.achievement.findMany({
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            icon: true,
            condition: true,
            xpReward: true,
            gemReward: true,
          },
        })
      },
      60 * 30 // 30 minutes
    )

    // Paginate from cached data (more efficient than DB query)
    const totalCount = allAchievements.length
    const paginatedAchievements = allAchievements.slice(skip, skip + limit)

    // Get user's earned achievements (user-specific, can't cache)
    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
      select: {
        achievementId: true,
        earnedAt: true,
      },
    })

    const earnedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.earnedAt]))

    const achievementsWithStatus = paginatedAchievements.map((a) => ({
      ...a,
      earned: earnedMap.has(a.id),
      earnedAt: earnedMap.get(a.id) || null,
    }))

    const earnedCount = userAchievements.length

    return NextResponse.json({
      achievements: achievementsWithStatus,
      earnedCount,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    })
  } catch (error: any) {
    console.error('Achievements API error:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
