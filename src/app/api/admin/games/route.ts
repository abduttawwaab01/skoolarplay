import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const games = await db.game.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ games })
  } catch (error) {
    console.error('Get games error:', error)
    return NextResponse.json({ error: 'Failed to get games' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      difficulty,
      courseId,
      icon,
      color,
      xpReward,
      gemReward,
      timeLimit,
      maxAttempts,
      isActive,
      minLevel,
      sortOrder,
    } = body

    if (!title || !type || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const game = await db.game.create({
      data: {
        title,
        description,
        type,
        difficulty,
        courseId,
        icon,
        color,
        xpReward: xpReward || 10,
        gemReward: gemReward || 1,
        timeLimit,
        maxAttempts,
        isActive: isActive !== false,
        minLevel: minLevel || 1,
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Create game error:', error)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
