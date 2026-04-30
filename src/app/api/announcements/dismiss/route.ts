import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { announcementId } = await request.json()
    if (!announcementId) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 })
    }

    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true, dismissedBy: true },
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    let dismissedBy: string[] = []
    try {
      dismissedBy = JSON.parse(announcement.dismissedBy || '[]')
    } catch {
      dismissedBy = []
    }

    if (!dismissedBy.includes(userId)) {
      dismissedBy.push(userId)
    }

    await db.announcement.update({
      where: { id: announcementId },
      data: { dismissedBy: JSON.stringify(dismissedBy) },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dismiss announcement' },
      { status: 500 }
    )
  }
}
