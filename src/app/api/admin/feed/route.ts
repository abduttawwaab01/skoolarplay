import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// GET /api/admin/feed - Get all posts with filtering
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (status === 'PENDING') {
      where.isApproved = false
    } else if (status === 'APPROVED') {
      where.isApproved = true
      where.isHidden = false
    } else if (status === 'REPORTED') {
      const reports = await db.feedReport.findMany({
        select: { postId: true },
        distinct: ['postId'],
      })
      const reportedPostIds = reports.map(r => r.postId)
      where.id = { in: reportedPostIds }
    }

    const posts = await db.feedPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isPremium: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reports: true,
          },
        },
      },
    })

    const total = await db.feedPost.count({ where })

    const stats = {
      total: await db.feedPost.count(),
      pending: await db.feedPost.count({ where: { isApproved: false } }),
      approved: await db.feedPost.count({ where: { isApproved: true, isHidden: false } }),
      hidden: await db.feedPost.count({ where: { isHidden: true } }),
      reported: await db.feedReport.count({ where: { status: 'PENDING' } }),
    }

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed posts' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/feed - Update post (hide/show)
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

    const body = await req.json()
    const { isHidden } = body

    const post = await db.feedPost.update({
      where: { id: postId },
      data: { isHidden },
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/feed - Delete post
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    
    if (!postId) {
      return NextResponse.json({ error: 'Post ID required' }, { status: 400 })
    }

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
