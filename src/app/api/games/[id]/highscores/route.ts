import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    const highscores = await db.gameScore.findMany({
      where: { gameId: id },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, level: true },
        },
      },
    })

    return NextResponse.json({ highscores })
  } catch (error) {
    console.error('Highscores error:', error)
    return NextResponse.json({ error: 'Failed to get highscores' }, { status: 500 })
  }
}
