import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const LEAGUES = [
  { name: 'BRONZE', icon: '🥉', color: 'from-amber-700 to-amber-500', minXP: 0, maxXP: 99, reward1: 100, reward2: 50, reward3: 25, tier: 1 },
  { name: 'SILVER', icon: '🥈', color: 'from-gray-400 to-gray-300', minXP: 100, maxXP: 299, reward1: 150, reward2: 75, reward3: 40, tier: 2 },
  { name: 'GOLD', icon: '🥇', color: 'from-yellow-500 to-yellow-400', minXP: 300, maxXP: 599, reward1: 250, reward2: 125, reward3: 60, tier: 3 },
  { name: 'PLATINUM', icon: '💎', color: 'from-cyan-400 to-blue-400', minXP: 600, maxXP: 999, reward1: 400, reward2: 200, reward3: 100, tier: 4 },
  { name: 'DIAMOND', icon: '🔷', color: 'from-blue-500 to-purple-500', minXP: 1000, maxXP: 1999, reward1: 600, reward2: 300, reward3: 150, tier: 5 },
  { name: 'SAPPHIRE', icon: '💠', color: 'from-indigo-500 to-blue-600', minXP: 2000, maxXP: 3499, reward1: 800, reward2: 400, reward3: 200, tier: 6 },
  { name: 'RUBY', icon: '❤️‍🔥', color: 'from-red-500 to-pink-500', minXP: 3500, maxXP: 4999, reward1: 1000, reward2: 500, reward3: 250, tier: 7 },
  { name: 'OBSIDIAN', icon: '🖤', color: 'from-gray-800 to-gray-900', minXP: 5000, maxXP: Infinity, reward1: 1500, reward2: 750, reward3: 400, tier: 8 },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user's data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        league: true,
        weeklyXp: true,
        xp: true,
        id: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentLeagueName = user.league || 'BRONZE'
    const currentLeague = LEAGUES.find((l) => l.name === currentLeagueName) || LEAGUES[0]
    const currentLeagueIndex = LEAGUES.findIndex((l) => l.name === currentLeagueName)
    const nextLeague = LEAGUES[currentLeagueIndex + 1] || null
    const prevLeague = LEAGUES[currentLeagueIndex - 1] || null

    // Calculate XP progress within current league
    const weeklyXp = user.weeklyXp || 0
    const leagueMin = currentLeague.minXP
    const leagueMax = currentLeague.maxXP === Infinity ? currentLeague.minXP + 5000 : currentLeague.maxXP
    const xpNeeded = nextLeague ? nextLeague.minXP - weeklyXp : 0
    const progressInLeague = leagueMax === Infinity
      ? Math.min(100, ((weeklyXp - leagueMin) / 5000) * 100)
      : Math.min(100, ((weeklyXp - leagueMin) / (leagueMax - leagueMin + 1)) * 100)

    // Get top 5 users in current league
    const topUsers = await db.user.findMany({
      where: { league: currentLeagueName },
      select: {
        id: true,
        name: true,
        avatar: true,
        weeklyXp: true,
        isOnline: true,
        league: true,
        totalLessonsCompleted: true,
      },
      orderBy: { weeklyXp: 'desc' },
      take: 5,
    })

    // Get total users in current league
    const leagueSize = await db.user.count({
      where: { league: currentLeagueName },
    })

    // Get current user's rank in their league
    const leagueRank = await db.user.count({
      where: {
        league: currentLeagueName,
        weeklyXp: { gt: weeklyXp },
      },
    }) + 1

    // Calculate days until end of week (Sunday)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday
    const daysUntilEnd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const endOfWeek = new Date(now)
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEnd)
    endOfWeek.setHours(23, 59, 59, 999)

    // Build rewards description
    const rewards = [
      { rank: '1st', gems: currentLeague.reward1, icon: '🥇' },
      { rank: '2nd', gems: currentLeague.reward2, icon: '🥈' },
      { rank: '3rd', gems: currentLeague.reward3, icon: '🥉' },
      { rank: 'Top 10', gems: Math.floor(currentLeague.reward3 / 2), icon: '⭐' },
      { rank: 'Top 50', gems: Math.floor(currentLeague.reward3 / 4), icon: '🏅' },
    ]

    return NextResponse.json({
      currentLeague: {
        name: currentLeague.name,
        icon: currentLeague.icon,
        color: currentLeague.color,
        tier: currentLeague.tier,
      },
      nextLeague: nextLeague ? {
        name: nextLeague.name,
        icon: nextLeague.icon,
        color: nextLeague.color,
        minXP: nextLeague.minXP,
      } : null,
      prevLeague: prevLeague ? {
        name: prevLeague.name,
        icon: prevLeague.icon,
        color: prevLeague.color,
      } : null,
      weeklyXp,
      totalXp: user.xp,
      xpNeededToPromote: xpNeeded,
      progressInLeague: Math.max(0, progressInLeague),
      leagueRank,
      leagueSize,
      topUsers: topUsers.map((u, i) => ({
        ...u,
        rank: i + 1,
      })),
      rewards,
      daysUntilEnd,
      endOfWeek: endOfWeek.toISOString(),
    })
  } catch (error: any) {
    console.error('League info API error:', error)
    return NextResponse.json({ error: 'Failed to fetch league info' }, { status: 500 })
  }
}
