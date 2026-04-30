import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(
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

    // Get user premium status
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true },
    })

    const settings = await db.adminSettings.findFirst()
    const isPremium = user?.isPremium && (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())

    // Check user's group membership count
    const currentMembershipCount = await db.studyGroupMember.count({
      where: { userId },
    })

    const maxGroupsJoin = isPremium 
      ? (settings?.premiumMaxGroupsJoin || 999)
      : (settings?.freeMaxGroupsJoin || 3)

    if (!isPremium && currentMembershipCount >= maxGroupsJoin) {
      return NextResponse.json({ 
        error: `Free users can only join ${maxGroupsJoin} group(s). Upgrade to premium to join unlimited groups.`,
        upgradeRequired: true,
        currentLimit: maxGroupsJoin,
        groupsJoined: currentMembershipCount,
      }, { status: 403 })
    }

    const group = await db.studyGroup.findUnique({
      where: { id },
      include: { members: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    if (!group.isActive) {
      return NextResponse.json({ error: 'Group is not active' }, { status: 400 })
    }

    if (group.members.length >= group.maxMembers) {
      return NextResponse.json({ error: 'Group is full' }, { status: 400 })
    }

    const existingMember = group.members.find((m) => m.userId === userId)
    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    const member = await db.studyGroupMember.create({
      data: {
        groupId: id,
        userId,
        role: 'MEMBER',
      },
    })

    return NextResponse.json({ 
      member,
      limits: {
        maxGroupsJoin,
        groupsJoined: currentMembershipCount + 1,
        isPremium,
      }
    })
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json({ error: 'Failed to join group' }, { status: 500 })
  }
}
