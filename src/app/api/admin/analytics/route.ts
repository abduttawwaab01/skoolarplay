import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = now.toISOString().split("T")[0];

    // Total users
    const totalUsers = await db.user.count({ where: { role: "STUDENT" } });
    const newUsersThisWeek = await db.user.count({
      where: {
        role: "STUDENT",
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Active courses
    const activeCourses = await db.course.count({ where: { isActive: true } });

    // Total gems spent (from purchases)
    const totalGemsSpent = await db.purchase.aggregate({
      _sum: { totalGems: true },
    });

    // Daily active users (users active in last 24 hours)
    const dailyActiveUsers = await db.user.count({
      where: {
        lastActiveAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    // User registrations over last 30 days
    const userRegistrations = await db.user.findMany({
      where: {
        role: "STUDENT",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const registrationByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      registrationByDay[key] = 0;
    }
    userRegistrations.forEach((u) => {
      const key = u.createdAt.toISOString().split("T")[0];
      if (registrationByDay[key] !== undefined) {
        registrationByDay[key]++;
      }
    });

    const registrationData = Object.entries(registrationByDay).map(([date, count]) => ({
      date,
      count,
    }));

    // Top 5 courses by enrollment
    const topCourses = await db.course.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { enrollments: true } },
        category: { select: { name: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    });

    // User distribution by category
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        courses: {
          include: {
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      enrolled: cat.courses.reduce((sum, c) => sum + c._count.enrollments, 0),
    }));

    // Recent activity
    const recentUsers = await db.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const recentLessons = await db.lessonProgress.findMany({
      where: { completed: true },
      include: {
        user: { select: { name: true } },
        lesson: { select: { title: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    const recentPurchases = await db.purchase.findMany({
      include: {
        user: { select: { name: true } },
        shopItem: { select: { title: true, icon: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsersThisWeek,
        activeCourses,
        totalRevenue: totalGemsSpent._sum.totalGems || 0,
        dailyActiveUsers,
      },
      registrationData,
      topCourses,
      categoryDistribution,
      recentActivity: {
        recentUsers,
        recentLessons,
        recentPurchases,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
