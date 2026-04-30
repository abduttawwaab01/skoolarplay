import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, getSupportOrAdminUser, hasPermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Allow both admins and support agents with users.view permission
    const user = await getSupportOrAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission (admins bypass this)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin) {
      const canView = await hasPermission(user.id, "users.view");
      if (!canView) {
        return NextResponse.json({ error: "Permission denied: users.view" }, { status: 403 });
      }
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role) {
      where.role = role;
    }
    if (status === "banned") {
      where.isBanned = true;
    } else if (status === "active") {
      where.isBanned = false;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
