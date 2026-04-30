import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkGameCenterAccess } from '@/lib/game-center'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const access = await checkGameCenterAccess(session.user.id)
    return NextResponse.json(access)
  } catch (error) {
    console.error('Game center status error:', error)
    return NextResponse.json({ error: 'Failed to check access' }, { status: 500 })
  }
}
