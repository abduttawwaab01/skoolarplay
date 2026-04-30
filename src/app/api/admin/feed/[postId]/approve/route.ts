import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// PUT /api/admin/feed/[postId]/approve - Approve or hide a post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const body = await req.json()
    const { action } = body // 'approve' or 'hide'

    if (action === 'approve') {
      const post = await db.feedPost.update({
        where: { id: postId },
        data: { isApproved: true, isHidden: false },
      })
      return NextResponse.json({ success: true, post })
    } else if (action === 'hide') {
      const post = await db.feedPost.update({
        where: { id: postId },
        data: { isHidden: true },
      })
      return NextResponse.json({ success: true, post })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}
