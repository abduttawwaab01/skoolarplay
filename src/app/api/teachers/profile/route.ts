import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, name: true, avatar: true, email: true } },
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching teacher profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}
