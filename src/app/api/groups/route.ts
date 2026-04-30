import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mine = searchParams.get('mine')
    const discover = searchParams.get('discover')
    const search = searchParams.get('search')

    let groups

    if (mine === 'true') {
      const memberships = await db.studyGroupMember.findMany({
        where: { userId: session.user.id },
        include: {
          group: {
            include: {
              creator: { select: { id: true, name: true, avatar: true } },
              members: { include: { user: { select: { id: true, name: true, avatar: true, xp: true, isPremium: true, planTier: true } } } },
              challenges: { where: { isActive: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      })
      groups = memberships.map((m) => ({
        ...m.group,
        memberCount: m.group.members.length,
        activeChallenges: m.group.challenges.length,
        userRole: m.role,
      }))
    } else if (discover === 'true') {
      const where: Record<string, unknown> = { isActive: true }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
        ]
      }

      const allGroups = await db.studyGroup.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          challenges: { where: { isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      // Filter out groups the user is already in
      const userGroupIds = await db.studyGroupMember.findMany({
        where: { userId: session.user.id },
        select: { groupId: true },
      })
      const joinedGroupIds = new Set(userGroupIds.map((g) => g.groupId))

      groups = allGroups
        .filter((g) => !joinedGroupIds.has(g.id))
        .map((g) => ({
          ...g,
          memberCount: g.members.length,
          activeChallenges: g.challenges.length,
        }))
    } else {
      const allGroups = await db.studyGroup.findMany({
        where: { isActive: true },
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          challenges: { where: { isActive: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
      groups = allGroups.map((g) => ({
        ...g,
        memberCount: g.members.length,
        activeChallenges: g.challenges.length,
      }))
    }

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, icon, maxMembers } = body

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Get user and admin settings
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, premiumExpiresAt: true },
    })

    const settings = await db.adminSettings.findFirst()
    const isPremium = user?.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())

    // Check if free users can create groups
    if (!isPremium && !settings?.freeGroupCreateEnabled) {
      return NextResponse.json({ 
        error: 'Free users cannot create groups. Upgrade to premium to create unlimited groups.' 
      }, { status: 403 })
    }

    // Count user's groups
    const userGroupsCreated = await db.studyGroup.count({
      where: { createdBy: session.user.id },
    })

    const maxGroups = isPremium 
      ? (settings?.premiumMaxGroupsCreate || 999)
      : (settings?.freeMaxGroupsCreate || 1)

    if (!isPremium && userGroupsCreated >= maxGroups) {
      return NextResponse.json({ 
        error: `Free users can only create ${maxGroups} group(s). Upgrade to premium to create unlimited groups.`,
        upgradeRequired: true,
        currentLimit: maxGroups,
      }, { status: 403 })
    }

    const defaultMaxMembers = settings?.defaultGroupMaxMembers || 50

    const group = await db.studyGroup.create({
      data: {
        name,
        description: description || null,
        icon: icon || '📚',
        maxMembers: maxMembers || defaultMaxMembers,
        createdBy: session.user.id,
      },
    })

    // Add creator as admin member
    await db.studyGroupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role: 'ADMIN',
      },
    })

    return NextResponse.json({ 
      group,
      limits: {
        maxGroups,
        groupsCreated: userGroupsCreated + 1,
        isPremium,
      }
    })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
