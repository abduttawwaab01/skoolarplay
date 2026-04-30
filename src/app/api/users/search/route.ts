import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] })
    }

    const userId = (session.user as any).id

    const users = await db.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { isBanned: false },
          {
            OR: [
              { name: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('User search error:', error)
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 })
  }
}
