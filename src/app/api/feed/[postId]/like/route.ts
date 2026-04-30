import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/feed/[postId]/like - Toggle like on a post or update reaction type
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
    const { type = 'LIKE' } = body // LIKE, LOVE, HAHA, WOW, SAD, ANGRY

    // Check post exists and is approved/not hidden
    const post = await db.feedPost.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.isApproved || post.isHidden) {
      return NextResponse.json({ error: 'Post is not available' }, { status: 404 })
    }

    // Check if user already liked this post
    const existingLike = await db.feedLike.findUnique({
      where: {
        postId_userId: { postId, userId: session.user.id },
      },
    })

    if (existingLike) {
      // If same type, unlike (toggle off)
      if (existingLike.type === type) {
        await db.$transaction(async (tx) => {
          await tx.feedLike.delete({
            where: { id: existingLike.id },
          })
          await tx.feedPost.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
          })
        })
        return NextResponse.json({ liked: false, likeCount: post.likeCount - 1, reactionType: null })
      } else {
        // Different type - update the reaction (keep count the same)
        await db.feedLike.update({
          where: { id: existingLike.id },
          data: { type },
        })
        return NextResponse.json({ liked: true, likeCount: post.likeCount, reactionType: type })
      }
    } else {
      // Like - use transaction for consistency
      await db.$transaction(async (tx) => {
        await tx.feedLike.create({
          data: {
            postId,
            userId: session.user.id,
            type,
          },
        })
        await tx.feedPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        })
      })
      return NextResponse.json({ liked: true, likeCount: post.likeCount + 1, reactionType: type })
    }
  } catch (error: any) {
    console.error('Feed like error:', error)
    return NextResponse.json({ error: error.message || 'Failed to toggle like' }, { status: 500 })
  }
}

// DELETE /api/feed/[postId]/like - Remove like (explicit unlike, same as POST if already liked)
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

    const existingLike = await db.feedLike.findUnique({
      where: {
        postId_userId: { postId, userId: session.user.id },
      },
    })

    if (existingLike) {
      // Use transaction for consistency
      await db.$transaction(async (tx) => {
        await tx.feedLike.delete({ where: { id: existingLike.id } })
        await tx.feedPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        })
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true }) // Already not liked
  } catch (error: any) {
    console.error('Feed unlike error:', error)
    return NextResponse.json({ error: error.message || 'Failed to unlike' }, { status: 500 })
  }
}
