import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params

    const group = await db.studyGroup.findUnique({
      where: { id: groupId },
      include: { members: true },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const currentUserId = session.user.id
    const isMember = group.members.some((m) => m.userId === currentUserId)
    const memberRole = group.members.find((m) => m.userId === currentUserId)?.role

    if (!isMember || memberRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete the group' }, { status: 403 })
    }

    await db.studyGroup.delete({ where: { id: groupId } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete group error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
