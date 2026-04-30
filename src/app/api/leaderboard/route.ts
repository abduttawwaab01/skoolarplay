import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { cacheGetOrSet } from '@/lib/redis-cache'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || 'WEEKLY') as string
    const category = (searchParams.get('category') || 'OVERALL') as string

    const validPeriods = ['DAILY', 'WEEKLY', 'ALL_TIME']
    if (!validPeriods.includes(period)) {
      return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    const validCategories = ['OVERALL', 'FRIENDS', 'LEAGUE']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get current user for league/friends filtering
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { league: true },
    })

    const userLeague = currentUser?.league || 'BRONZE'

    // Build user filter based on category
    let userFilter: any = {}
    if (category === 'LEAGUE') {
      userFilter.league = userLeague
    } else if (category === 'FRIENDS') {
      // Get study group member IDs for current user
      const memberships = await db.studyGroupMember.findMany({
        where: { userId },
        select: { groupId: true },
      })
      const groupIds = memberships.map((m) => m.groupId)
      const friendMemberships = groupIds.length > 0
        ? await db.studyGroupMember.findMany({
            where: { groupId: { in: groupIds } },
            select: { userId: true },
          })
        : []
      const friendIds = [...new Set(friendMemberships.map((m) => m.userId)), userId]
      if (friendIds.length <= 1) {
        userFilter = {}
      } else {
        userFilter.id = { in: friendIds }
      }
    }

    // Date filter
    let dateFilter: any = {}
    if (period === 'DAILY') {
      dateFilter.date = today
    } else if (period === 'WEEKLY') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]
      dateFilter = {
        date: { gte: weekAgoStr },
      }
    }

    // Cache key based on period and category (not user-specific for public data)
    const cacheKey = `leaderboard:${period}:${category}`
    const cacheTTL = period === 'DAILY' ? 60 * 5 : period === 'WEEKLY' ? 60 * 15 : 60 * 30

    // For FRIENDS category, we can't cache - fetch fresh each time
    if (category === 'FRIENDS') {
      const data = await fetchLeaderboardData(request, userId, period, category, userLeague, userFilter, dateFilter)
      return NextResponse.json(data)
    }

    // For other categories, use caching
    const cachedData = await cacheGetOrSet(
      cacheKey,
      async () => {
        const data = await fetchLeaderboardData(request, userId, period, category, userLeague, userFilter, dateFilter)
        return data
      },
      cacheTTL
    )

    // Build response with current user's rank
    const response: any = { ...cachedData }
    let currentUserRank: number | null = null
    
    const currentUserEntry = cachedData.entries?.find((e: any) => e.id === userId)
    if (currentUserEntry) {
      currentUserRank = currentUserEntry.rank
    } else if (period === 'ALL_TIME') {
      const userXp = await db.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      })
      if (userXp) {
        const count = await db.user.count({
          where: { xp: { gt: userXp.xp }, ...userFilter },
        })
        currentUserRank = count + 1
      }
    }
    
    if (currentUserEntry) {
      currentUserRank = currentUserEntry.rank
    } else {
      // Calculate rank for user not in top entries
      if (period === 'ALL_TIME') {
        const userXp = await db.user.findUnique({
          where: { id: userId },
          select: { xp: true },
        })
        if (userXp) {
          const count = await db.user.count({
            where: {
              xp: { gt: userXp.xp },
              ...userFilter,
            },
          })
          currentUserRank = count + 1
        }
      } else {
        const myEntries = await db.leaderboardEntry.findMany({
          where: { userId, period, ...dateFilter },
        })
        const myTotalXp = myEntries.reduce((sum, e) => sum + e.xp, 0)
        const allRaw = await db.leaderboardEntry.findMany({
          where: { period, ...dateFilter },
          include: { user: { select: { league: true } } },
        })
        const userXpMap = new Map<string, number>()
        for (const entry of allRaw) {
          if (category === 'LEAGUE' && entry.user.league !== userLeague) continue
          const existing = userXpMap.get(entry.userId)
          userXpMap.set(entry.userId, (existing || 0) + entry.xp)
        }
        const count = Array.from(userXpMap.values()).filter((xp) => xp > myTotalXp).length
        currentUserRank = count + 1
      }
    }

    response.currentUserRank = currentUserRank
    
    if (category === 'LEAGUE') {
      const leagueSize = await db.user.count({
        where: { league: userLeague },
      })
      response.myLeagueRank = currentUserRank
      response.myLeagueSize = leagueSize
      response.myLeague = userLeague
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

async function fetchLeaderboardData(request: NextRequest, userId: string, period: string, category: string, userLeague: string, userFilter: any, dateFilter: any) {
  const today = new Date().toISOString().split('T')[0]

  let entries: any[] = []

  if (period === 'ALL_TIME') {
    const users = await db.user.findMany({
      where: userFilter,
      select: {
        id: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        league: true,
        planTier: true,
        isOnline: true,
        totalLessonsCompleted: true,
        totalCoursesCompleted: true,
      },
      orderBy: { xp: 'desc' },
      take: 50,
    })

    entries = users.map((u, index) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      level: u.level,
      xp: u.xp,
      rank: index + 1,
      league: u.league,
      planTier: u.planTier,
      isOnline: u.isOnline,
      totalLessonsCompleted: u.totalLessonsCompleted,
      totalCoursesCompleted: u.totalCoursesCompleted,
    }))
  } else {
    const rawEntries = await db.leaderboardEntry.findMany({
      where: {
        period,
        ...dateFilter,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
            league: true,
            planTier: true,
            isOnline: true,
            totalLessonsCompleted: true,
            totalCoursesCompleted: true,
          },
        },
      },
      orderBy: { xp: 'desc' },
    })

    const userXpMap = new Map<string, { user: any; xp: number }>()
    for (const entry of rawEntries) {
      if (category === 'LEAGUE' && entry.user.league !== userLeague) continue
      if (category === 'FRIENDS' && Object.keys(userFilter).length > 0 && !userFilter.id?.in?.includes(entry.userId)) continue

      const existing = userXpMap.get(entry.userId)
      if (existing) {
        existing.xp += entry.xp
      } else {
        userXpMap.set(entry.userId, {
          user: entry.user,
          xp: entry.xp,
        })
      }
    }

    entries = Array.from(userXpMap.values())
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 50)
      .map((e, index) => ({
        id: e.user.id,
        name: e.user.name,
        avatar: e.user.avatar,
        level: e.user.level,
        xp: e.xp,
        rank: index + 1,
        league: e.user.league,
        isOnline: e.user.isOnline,
        totalLessonsCompleted: e.user.totalLessonsCompleted,
        totalCoursesCompleted: e.user.totalCoursesCompleted,
      }))
  }

  return {
    entries,
    period,
    category,
    currentUserRank: null,
  }
}
