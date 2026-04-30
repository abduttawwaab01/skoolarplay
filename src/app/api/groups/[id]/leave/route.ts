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

    const { id } = await params

    const member = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: { groupId: id, userId: session.user.id },
      },
      include: { group: true },
    })

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 })
    }

    if (member.role === 'ADMIN') {
      return NextResponse.json({ error: 'Admin cannot leave. Transfer ownership first.' }, { status: 400 })
    }

    await db.studyGroupMember.delete({
      where: { id: member.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json({ error: 'Failed to leave group' }, { status: 500 })
  }
}
