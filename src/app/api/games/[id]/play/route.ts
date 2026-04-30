import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { submitGameScore } from '@/lib/game-center'
import { checkGameCenterAccess } from '@/lib/game-center'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check game center access
    const access = await checkGameCenterAccess(session.user.id)
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'Game Center locked', reason: access.reason },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { score, timeSpent } = body as { score: number; timeSpent: number }

    if (typeof score !== 'number' || typeof timeSpent !== 'number') {
      return NextResponse.json({ error: 'Invalid score or timeSpent' }, { status: 400 })
    }

    const result = await submitGameScore(session.user.id, id, score, timeSpent)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Game play error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit score' },
      { status: 500 }
    )
  }
}
