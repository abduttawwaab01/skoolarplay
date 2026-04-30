import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT /api/feed/[postId] - Edit a post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Find the post
    const post = await db.feedPost.findUnique({
      where: { id: postId },
      select: { authorId: true, isHidden: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check permission: only author or admin can edit
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (post.authorId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Cannot edit hidden posts
    if (post.isHidden) {
      return NextResponse.json({ error: 'Cannot edit a hidden post' }, { status: 400 })
    }

    const body = await req.json()
    const { content, visibility, mediaUrls, mentionedUserIds } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content exceeds maximum length of 5000 characters' }, { status: 400 })
    }

    const allowedVisibilities = ['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']
    if (visibility && !allowedVisibilities.includes(visibility)) {
      return NextResponse.json(
        { error: `Invalid visibility. Must be one of: ${allowedVisibilities.join(', ')}` },
        { status: 400 }
      )
    }

    const updatedPost = await db.feedPost.update({
      where: { id: postId },
      data: {
        content: content.trim(),
        ...(visibility !== undefined && { visibility }),
        ...(mediaUrls !== undefined && { 
          mediaUrls: Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : (mediaUrls ? JSON.stringify([mediaUrls]) : null)
        }),
        ...(mentionedUserIds !== undefined && { 
          mentionedUserIds: Array.isArray(mentionedUserIds) ? JSON.stringify(mentionedUserIds) : (mentionedUserIds ? JSON.stringify([mentionedUserIds]) : null)
        }),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ post: updatedPost })
  } catch (error: any) {
    console.error('Feed PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 })
  }
}

// DELETE /api/feed/[postId] - Delete (soft hide) a post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Find the post
    const post = await db.feedPost.findUnique({
      where: { id: postId },
      select: { authorId: true, isHidden: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check permission: only author or admin can delete
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (post.authorId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete: set isHidden = true
    await db.feedPost.update({
      where: { id: postId },
      data: { isHidden: true },
    })

    return NextResponse.json({ success: true, message: 'Post hidden' })
  } catch (error: any) {
    console.error('Feed DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 })
  }
}
