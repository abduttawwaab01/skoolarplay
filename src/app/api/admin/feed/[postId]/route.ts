import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// PUT /api/admin/feed/[postId] - Update a specific post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const body = await req.json()
    const { isHidden, content, visibility } = body

    const updateData: any = {}
    if (typeof isHidden === 'boolean') updateData.isHidden = isHidden
    if (content !== undefined) updateData.content = content
    if (visibility !== undefined) updateData.visibility = visibility

    const post = await db.feedPost.update({
      where: { id: postId },
      data: updateData,
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/feed/[postId] - Delete a specific post
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Delete related records first
    await Promise.all([
      db.feedLike.deleteMany({ where: { postId } }),
      db.feedComment.deleteMany({ where: { postId } }),
      db.feedReport.deleteMany({ where: { postId } }),
    ])

    await db.feedPost.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}