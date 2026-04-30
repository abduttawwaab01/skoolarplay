import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const LEAGUES = [
  { name: 'BRONZE', minXP: 0, maxXP: 99 },
  { name: 'SILVER', minXP: 100, maxXP: 299 },
  { name: 'GOLD', minXP: 300, maxXP: 599 },
  { name: 'PLATINUM', minXP: 600, maxXP: 999 },
  { name: 'DIAMOND', minXP: 1000, maxXP: 1999 },
  { name: 'SAPPHIRE', minXP: 2000, maxXP: 3499 },
  { name: 'RUBY', minXP: 3500, maxXP: 4999 },
  { name: 'OBSIDIAN', minXP: 5000, maxXP: Infinity },
]

export async function POST(request: NextRequest) {
  try {
    // Validate admin or system access
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || (user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const promotions: any[] = []
    const demotions: any[] = []
    const notifications: any[] = []

    await db.$transaction(async (tx) => {
      // Process each league (except OBSIDIAN which has no promotion)
      for (let i = 0; i < LEAGUES.length; i++) {
        const league = LEAGUES[i]
        const usersInLeague = await tx.user.findMany({
          where: { league: league.name },
          select: { id: true, name: true, weeklyXp: true, league: true },
          orderBy: { weeklyXp: 'desc' },
        })

        const totalUsers = usersInLeague.length
        if (totalUsers === 0) continue

        // Top 3 get promoted (unless OBSIDIAN - top league)
        if (league.name !== 'OBSIDIAN' && totalUsers > 3) {
          const promoteCount = Math.min(3, totalUsers)
          const nextLeague = LEAGUES[i + 1]

          for (let j = 0; j < promoteCount; j++) {
            const userToPromote = usersInLeague[j]
            if (userToPromote.weeklyXp <= 0) continue

            await tx.user.update({
              where: { id: userToPromote.id },
              data: { league: nextLeague.name },
            })

            promotions.push({
              userId: userToPromote.id,
              userName: userToPromote.name,
              fromLeague: league.name,
              toLeague: nextLeague.name,
              rank: j + 1,
            })

            notifications.push({
              userId: userToPromote.id,
              title: '🎉 League Promotion!',
              message: `Congratulations! You've been promoted from ${league.name} to ${nextLeague.name} league! Keep up the great work!`,
              type: 'ACHIEVEMENT',
            })
          }
        }

        // Bottom 3 get demoted (unless BRONZE - bottom league)
        if (league.name !== 'BRONZE' && totalUsers > 6) {
          const demoteCount = Math.min(3, totalUsers)
          const prevLeague = LEAGUES[i - 1]

          for (let j = 0; j < demoteCount; j++) {
            const userToDemote = usersInLeague[totalUsers - 1 - j]

            await tx.user.update({
              where: { id: userToDemote.id },
              data: { league: prevLeague.name },
            })

            demotions.push({
              userId: userToDemote.id,
              userName: userToDemote.name,
              fromLeague: league.name,
              toLeague: prevLeague.name,
              rank: totalUsers - j,
            })

            notifications.push({
              userId: userToDemote.id,
              title: '⚠️ League Demotion',
              message: `You've been demoted from ${league.name} to ${prevLeague.name} league. Earn more XP this week to stay in your league!`,
              type: 'WARNING',
            })
          }
        }
      }

      // Reset all users' weeklyXp to 0
      await tx.user.updateMany({
        data: { weeklyXp: 0 },
      })

      // Create notification records for all promoted/demoted users
      if (notifications.length > 0) {
        await tx.notification.createMany({
          data: notifications,
        })
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalPromotions: promotions.length,
        totalDemotions: demotions.length,
        promotions,
        demotions,
      },
    })
  } catch (error: any) {
    console.error('League promotion API error:', error)
    return NextResponse.json({ error: 'Failed to process league promotions' }, { status: 500 })
  }
}
