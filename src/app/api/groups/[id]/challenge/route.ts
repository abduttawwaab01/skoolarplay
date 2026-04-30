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
    const body = await request.json()
    const { title, description, targetCount, xpReward, gemReward, startDate, endDate } = body

    if (!title || !xpReward || !gemReward || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check user is admin of the group
    const member = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: { groupId: id, userId: session.user.id },
      },
    })

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create challenges' }, { status: 403 })
    }

    const challenge = await db.groupChallenge.create({
      data: {
        groupId: id,
        title,
        description: description || null,
        targetCount: targetCount || 10,
        xpReward,
        gemReward,
        startDate,
        endDate,
      },
    })

    return NextResponse.json({ challenge })
  } catch (error) {
    console.error('Error creating group challenge:', error)
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 })
  }
}
