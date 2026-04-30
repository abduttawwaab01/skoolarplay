import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/feed/[postId]/comment/[commentId] - Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId, commentId } = await params

    // Get comment
    const comment = await db.feedComment.findUnique({
      where: { id: commentId },
    })

    if (!comment || comment.postId !== postId) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check ownership
    if (comment.userId !== session.user.id) {
      const user = await db.user.findUnique({ where: { id: session.user.id } })
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 })
      }
    }

    // Delete replies first
    await db.feedComment.deleteMany({
      where: { parentId: commentId },
    })

    await db.feedComment.delete({
      where: { id: commentId },
    })

    // Decrement comment count on post
    await db.feedPost.update({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Feed comment DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete comment' }, { status: 500 })
  }
}
