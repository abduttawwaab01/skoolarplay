import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        gems: true,
        xp: true,
        streak: true,
        longestStreak: true,
        hearts: true,
        maxHearts: true,
        level: true,
        createdAt: true,
        lastActiveAt: true,
        isPremium: true,
        planTier: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get course stats
    const enrolledCount = await db.enrollment.count({ where: { userId } })

    const completedEnrollments = await db.enrollment.findMany({
      where: { userId, progress: 100 },
      select: { courseId: true },
    })
    const completedCourseCount = completedEnrollments.length

    // Get achievements
    const achievements = await db.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: {
          select: { id: true, title: true, description: true, icon: true },
        },
      },
      orderBy: { earnedAt: 'desc' },
    })

    // Get certificates
    const certificates = await db.certificate.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    })

    // Total achievements available
    const totalAchievements = await db.achievement.count()

    return NextResponse.json({
      user,
      stats: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCourseCount,
        achievements: achievements.length,
        totalAchievements,
        certificates: certificates.length,
      },
      achievements: achievements.map((a) => ({
        achievementId: a.id,
        id: a.achievement.id,
        title: a.achievement.title,
        description: a.achievement.description,
        icon: a.achievement.icon,
        earnedAt: a.earnedAt,
      })),
      certificates,
    })
  } catch (error: any) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, avatar } = body

    // Validate name
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
      }
    }

    // Validate bio
    if (bio !== null && bio !== undefined && typeof bio === 'string' && bio.length > 300) {
      return NextResponse.json({ error: 'Bio must be 300 characters or less' }, { status: 400 })
    }

    // Build update data
    const updateData: any = {}
    if (name !== undefined) updateData.name = name.trim()
    if (bio !== undefined) updateData.bio = bio && bio.trim() ? bio.trim() : null
    if (avatar !== undefined) updateData.avatar = avatar

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Profile update API error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
