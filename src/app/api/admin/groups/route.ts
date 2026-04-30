import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    let where: any = {}
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [groups, total] = await Promise.all([
      db.studyGroup.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          members: { select: { userId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.studyGroup.count({ where }),
    ])

    const groupsWithCounts = await Promise.all(
      groups.map(async (g) => {
        const [memberCount, messageCount, challengeCount] = await Promise.all([
          db.studyGroupMember.count({ where: { groupId: g.id } }),
          db.groupMessage.count({ where: { groupId: g.id } }),
          db.groupChallenge.count({ where: { groupId: g.id } }),
        ])
        return {
          ...g,
          memberCount,
          messageCount,
          challengeCount,
        }
      })
    )

    return NextResponse.json({
      groups: groupsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Admin groups fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
