import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { hearts } = body as { hearts: number }

    if (typeof hearts !== 'number' || hearts < 0) {
      return NextResponse.json({ error: 'Invalid hearts value' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { hearts: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only update lastHeartLossAt if hearts decreased
    if (hearts < user.hearts) {
      await db.user.update({
        where: { id: userId },
        data: {
          lastHeartLossAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Heart loss tracking error:', error)
    return NextResponse.json({ error: 'Failed to track heart loss' }, { status: 500 })
  }
}