import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { postId, reason, description } = body

    if (!postId || !reason) {
      return NextResponse.json({ error: 'Post ID and reason are required' }, { status: 400 })
    }

    // Verify post exists
    const post = await db.feedPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Can't report own post
    if (post.authorId === session.user.id) {
      return NextResponse.json({ error: 'You cannot report your own post' }, { status: 400 })
    }

    // Check if already reported
    const existing = await db.feedReport.findFirst({
      where: {
        postId,
        reporterId: session.user.id,
        status: 'PENDING',
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already reported this post' }, { status: 400 })
    }

    // Create report
    const report = await db.feedReport.create({
      data: {
        postId,
        reporterId: session.user.id,
        reason,
        description: description || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      message: 'Report submitted successfully',
      report,
    })
  } catch (error: any) {
    console.error('Report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit report' },
      { status: 500 }
    )
  }
}