import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/feed - Retrieve feed posts for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get current user to determine visibility
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isPremium: true },
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build query: posts that are approved, not hidden, and visible to this user
    // - PUBLIC posts are visible to all
    // - FOLLOWERS_ONLY posts require following relationship
    // - User's own posts are always visible
    const where: any = {
      isApproved: true,
      isHidden: false,
    }

    // Get following list for FOLLOWERS_ONLY posts
    const following = await db.follows.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    })
    const followingIds = following.map(f => f.followingId)
    const followingIdsArr = followingIds.length > 0 ? followingIds : ['']

    // Complex where: (visibility = 'PUBLIC') OR (visibility = 'FOLLOWERS_ONLY' AND authorId IN followingIds) OR (authorId = currentUser)
    // We'll handle this with raw query or two queries due to Prisma limitations
    // Simple approach: fetch all and filter in code (inefficient but works for small scale)
    // Better: Use raw SQL or disjunction in where

    // For now, let's fetch recent approved posts and filter manually
    const allPosts = await db.feedPost.findMany({
      where: {
        isApproved: true,
        isHidden: false,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isPremium: true,
            planTier: true,
            premiumExpiresAt: true,
            level: true,
            league: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                isPremium: true,
              },
            },
          },
        },
        comments: {
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
          where: {
            parentId: null, // Only top-level comments
          },
          orderBy: { createdAt: 'asc' },
        },
        reports: {
          where: {
            reporterId: session.user.id,
          },
        },
      },
    })

    // Filter posts based on visibility rules
    const visiblePosts = allPosts.filter(post => {
      if (post.authorId === session.user.id) return true // own posts
      if (post.visibility === 'PUBLIC') return true
      if (post.visibility === 'FOLLOWERS_ONLY' && followingIds.includes(post.authorId)) return true
      return false
    })

    // Check if current user liked each post
    const postsWithUserInteraction = visiblePosts.map(post => {
      const userLiked = post.likes.some(l => l.userId === session.user.id)
      const userReported = post.reports.length > 0
      return {
        ...post,
        userLiked,
        userReported,
      }
    })

    // Get total count for pagination (approximate - could be optimized)
    const total = await db.feedPost.count({
      where: {
        isApproved: true,
        isHidden: false,
      },
    })

    return NextResponse.json({
      posts: postsWithUserInteraction,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      user: {
        id: currentUser.id,
        isPremium: currentUser.isPremium,
      },
    })
  } catch (error: any) {
    console.error('Feed GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch feed' }, { status: 500 })
  }
}

// POST /api/feed - Create a new post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, visibility, mediaUrls, mentionedUserIds } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content exceeds maximum length of 5000 characters' }, { status: 400 })
    }

    // Validate visibility
    const allowedVisibilities = ['PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE']
    const finalVisibility = allowedVisibilities.includes(visibility) ? visibility : 'PUBLIC'

    // If PRIVATE, we don't create post (or create but not visible to anyone else)
    // For now, PRIVATE posts are not allowed via API; only for internal use
    if (finalVisibility === 'PRIVATE') {
      return NextResponse.json({ error: 'Private posts are not supported' }, { status: 400 })
    }

    // Validate mentioned users exist (if any)
    let validatedMentions: string[] = []
    if (mentionedUserIds && Array.isArray(mentionedUserIds)) {
      const validMentions = await db.user.findMany({
        where: { id: { in: mentionedUserIds } },
        select: { id: true },
      })
      validatedMentions = validMentions.map(u => u.id)
    }

    // Create post - requires admin approval (moderation enabled)
    const post = await db.feedPost.create({
      data: {
        authorId: session.user.id,
        content: content.trim(),
        visibility: finalVisibility,
        isApproved: false, // Posts require admin approval before being visible
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        mentionedUserIds: validatedMentions.length > 0 ? JSON.stringify(validatedMentions) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isPremium: true,
            premiumExpiresAt: true,
            level: true,
            league: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        userLiked: false,
        userReported: false,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Feed POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 })
  }
}
