import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const currentUserId = session.user.id

    const membership = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: currentUserId,
        },
      },
    })

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    const targetMembership = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })

    if (!targetMembership) {
      return NextResponse.json({ error: 'User not a member' }, { status: 404 })
    }

    if (targetMembership.role === 'ADMIN') {
      return NextResponse.json({ error: 'Cannot remove another admin' }, { status: 400 })
    }

    await db.studyGroupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Remove member error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
