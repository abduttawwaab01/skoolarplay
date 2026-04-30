import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        avatar: true,
        bio: true,
        gems: true,
        xp: true,
        streak: true,
        longestStreak: true,
        hearts: true,
        maxHearts: true,
        level: true,
        isBanned: true,
        isPremium: true,
        premiumExpiresAt: true,
        unlockedFeatures: true,
        isOnline: true,
        lastActiveAt: true,
        league: true,
        weeklyXp: true,
        totalLessonsCompleted: true,
        totalCoursesCompleted: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            lessonProgress: true,
            purchases: true,
            achievements: true,
            certificates: true,
          },
        },
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true },
            },
          },
        },
        achievements: {
          include: {
            achievement: {
              select: { id: true, title: true, icon: true },
            },
          },
        },
        purchases: {
          include: {
            shopItem: {
              select: { id: true, title: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, role, gems, xp, isPremium, premiumExpiresAt, unlockedFeatures, streak, hearts, maxHearts, longestStreak } = body;

    // Validate role if provided
    if (role !== undefined && role !== null && role !== '' && !['STUDENT', 'TEACHER', 'ADMIN', 'SUPPORT'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be STUDENT, TEACHER, ADMIN, or SUPPORT.' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(gems !== undefined && { gems }),
        ...(xp !== undefined && { xp }),
        ...(isPremium !== undefined && { isPremium }),
        ...(premiumExpiresAt !== undefined && { premiumExpiresAt: premiumExpiresAt ? new Date(premiumExpiresAt) : null }),
        ...(unlockedFeatures !== undefined && { unlockedFeatures: typeof unlockedFeatures === 'string' ? unlockedFeatures : JSON.stringify(unlockedFeatures) }),
        ...(streak !== undefined && { streak }),
        ...(hearts !== undefined && { hearts }),
        ...(maxHearts !== undefined && { maxHearts }),
        ...(longestStreak !== undefined && { longestStreak }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        gems: true,
        xp: true,
        streak: true,
        longestStreak: true,
        hearts: true,
        maxHearts: true,
        level: true,
        isBanned: true,
        isPremium: true,
        premiumExpiresAt: true,
        unlockedFeatures: true,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      details: { name, role, gems, xp, isPremium, premiumExpiresAt, streak, hearts, maxHearts, longestStreak },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting their own account
    if (id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account.' },
        { status: 400 }
      );
    }

    const deletedUser = await db.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });

    // Soft delete - mark as deleted instead of removing
    await db.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: admin.id,
        email: `deleted_${Date.now()}_${deletedUser?.email}`, // Make email unique again
        name: 'Deleted User',
        password: 'DELETED',
        avatar: null,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
      details: { deletedUserName: deletedUser?.name, deletedUserEmail: deletedUser?.email },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
