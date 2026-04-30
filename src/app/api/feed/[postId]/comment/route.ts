import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/feed/[postId]/comment - Get comments for a post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Verify post exists
    const post = await db.feedPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get top-level comments (no parent) with replies
    const comments = await db.feedComment.findMany({
      where: {
        postId,
        parentId: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isPremium: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                isPremium: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ comments })
  } catch (error: any) {
    console.error('Feed comments GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/feed/[postId]/comment - Add a comment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const body = await req.json()
    const { content, parentId } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment exceeds maximum length of 1000 characters' }, { status: 400 })
    }

    // Verify post exists and is approved
    const post = await db.feedPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.isApproved || post.isHidden) {
      return NextResponse.json({ error: 'Post is not available' }, { status: 404 })
    }

    // If parentId provided, verify parent comment exists and belongs to same post
    if (parentId) {
      const parentComment = await db.feedComment.findUnique({
        where: { id: parentId },
      })
      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 })
      }
    }

    // Create comment
    const comment = await db.feedComment.create({
      data: {
        postId,
        userId: session.user.id,
        parentId: parentId || null,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isPremium: true,
          },
        },
      },
    })

    // Increment comment count on post
    await db.feedPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json({ success: true, comment }, { status: 201 })
  } catch (error: any) {
    console.error('Feed comment POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create comment' }, { status: 500 })
  }
}

// DELETE handler moved to /api/feed/[postId]/comment/[commentId]
