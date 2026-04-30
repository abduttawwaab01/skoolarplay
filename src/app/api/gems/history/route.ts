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
    const type = searchParams.get('type') || 'all' // sent, received, all
    const cursor = searchParams.get('cursor') || undefined
    const limit = 20

    const userId = (session.user as any).id

    const whereClause: any = {}
    if (type === 'sent') {
      whereClause.senderId = userId
    } else if (type === 'received') {
      whereClause.recipientId = userId
    } else {
      whereClause.OR = [{ senderId: userId }, { recipientId: userId }]
    }

    const gifts = await db.gemGift.findMany({
      where: whereClause,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        recipient: { select: { id: true, name: true, avatar: true } },
      },
    })

    const hasMore = gifts.length > limit
    const items = hasMore ? gifts.slice(0, limit) : gifts
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return NextResponse.json({
      gifts: items.map((gift) => ({
        id: gift.id,
        amount: gift.amount,
        message: gift.message,
        createdAt: gift.createdAt,
        sender: gift.sender,
        recipient: gift.recipient,
        direction: gift.senderId === userId ? 'sent' : 'received',
      })),
      nextCursor,
      hasMore,
    })
  } catch (error: any) {
    console.error('Gift history error:', error)
    return NextResponse.json({ error: 'Failed to load gift history' }, { status: 500 })
  }
}
