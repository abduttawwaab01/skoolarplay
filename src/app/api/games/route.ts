import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailableGames } from '@/lib/game-center'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const games = await getAvailableGames(session.user.id)
    return NextResponse.json({ games })
  } catch (error) {
    console.error('Games list error:', error)
    return NextResponse.json({ error: 'Failed to get games' }, { status: 500 })
  }
}
