import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { id } = await params

    const group = await db.studyGroup.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatar: true, xp: true, level: true, isPremium: true, planTier: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        challenges: {
          where: { isActive: true },
          include: {
            completions: {
              where: { userId },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const isMember = group.members.some((m) => m.userId === userId)
    const userRole = group.members.find((m) => m.userId === userId)?.role || null

    // Build leaderboard from member XP
    const leaderboard = group.members
      .map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        xp: m.user.xp,
        level: m.user.level,
        role: m.role,
      }))
      .sort((a, b) => b.xp - a.xp)

    return NextResponse.json({
      ...group,
      memberCount: group.members.length,
      isMember,
      userRole,
      leaderboard,
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}
