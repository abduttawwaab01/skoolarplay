import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const group = await db.studyGroup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        maxMembers: true,
        creator: { select: { id: true, name: true } },
        members: { select: { userId: true } },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...group,
      memberCount: group.members.length,
      isMember: false,
    })
  } catch (error) {
    console.error('Error fetching group preview:', error)
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}
