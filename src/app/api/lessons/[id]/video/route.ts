import { NextRequest, NextResponse } from 'next/server'
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
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lesson = await db.lesson.findUnique({
      where: { id, isActive: true },
      select: { id: true, title: true, type: true },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const videoContent = await db.videoContent.findMany({
      where: { lessonId: id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({
      lesson: {
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
      },
      videos: videoContent.map((v) => ({
        id: v.id,
        title: v.title,
        url: v.url,
        duration: v.duration,
        order: v.order,
      })),
    })
  } catch (error: any) {
    console.error('Video lesson API error:', error)
    return NextResponse.json({ error: 'Failed to fetch video content' }, { status: 500 })
  }
}
