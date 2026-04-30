import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()

    const announcements = await db.announcement.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
          {
            OR: [
              { scheduledAt: null },
              { scheduledAt: { lte: now } },
            ],
          },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        content: true,
        bannerType: true,
        imageUrl: true,
        targetUrl: true,
        type: true,
        priority: true,
        dismissedBy: true,
      },
    })

    return NextResponse.json({ announcements })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
