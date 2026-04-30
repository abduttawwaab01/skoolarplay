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
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Run all queries in parallel for performance
    const [
      totalUsers,
      onlineNow,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      inactiveUsers,
      inactive7Days,
      inactive14Days,
      inactive30Days,
      newUsersToday,
      newUsersThisWeek,
      byRoleData,
      byLeagueData,
      averageStats,
      premiumCount,
      recentAudits,
      topStreaks,
      topXpEarners,
      mostActive,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Online now
      db.user.count({ where: { isOnline: true } }),

      // Active today (lastActiveAt within 24h)
      db.user.count({ where: { lastActiveAt: { gte: oneDayAgo } } }),

      // Active this week (lastActiveAt within 7 days)
      db.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),

      // Active this month (lastActiveAt within 30 days)
      db.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),

      // Inactive users (not active in 7+ days)
      db.user.count({ where: { lastActiveAt: { lt: sevenDaysAgo } } }),

      // Inactive 7-13 days
      db.user.count({ 
        where: { 
          lastActiveAt: { 
            gte: fourteenDaysAgo,
            lt: sevenDaysAgo 
          } 
        } 
      }),

      // Inactive 14-29 days
      db.user.count({ 
        where: { 
          lastActiveAt: { 
            gte: thirtyDaysAgo,
            lt: fourteenDaysAgo 
          } 
        } 
      }),

      // Inactive 30+ days
      db.user.count({ where: { lastActiveAt: { lt: thirtyDaysAgo } } }),

      // New users today
      db.user.count({ where: { createdAt: { gte: oneDayAgo } } }),

      // New users this week
      db.user.count({ where: { createdAt: { gte: startOfWeek } } }),

      // Users by role
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),

      // Users by league
      db.user.groupBy({
        by: ["league"],
        _count: { league: true },
      }),

      // Average XP and streak
      db.user.aggregate({
        _avg: {
          xp: true,
          streak: true,
        },
        _count: true,
      }),

      // Premium users
      db.user.count({ where: { isPremium: true } }),

      // Recent activity from audit logs
      db.auditLog.findMany({
        where: {
          entity: "User",
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          actor: {
            select: { name: true, email: true },
          },
        },
      }),

      // Top streak holders
      db.user.findMany({
        orderBy: { streak: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          streak: true,
          longestStreak: true,
          xp: true,
          level: true,
          lastActiveAt: true,
          isPremium: true,
        },
      }),

      // Top XP earners (all time)
      db.user.findMany({
        orderBy: { xp: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          xp: true,
          level: true,
          streak: true,
          lastActiveAt: true,
          isPremium: true,
        },
      }),

      // Most active (by lesson progress count)
      db.user.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: {
              lessonProgress: true,
            },
          },
          xp: true,
          streak: true,
          lastActiveAt: true,
        },
        orderBy: {
          lessonProgress: {
            _count: "desc",
          },
        },
      }),
    ]);

    // Build byRole map
    const byRole: Record<string, number> = {
      STUDENT: 0,
      TEACHER: 0,
      ADMIN: 0,
    };
    for (const item of byRoleData) {
      byRole[item.role] = item._count.role;
    }

    // Build byLeague map
    const byLeague: Record<string, number> = {};
    for (const item of byLeagueData) {
      byLeague[item.league] = item._count.league;
    }

    // Format recent activity
    const recentActivity = recentAudits.map((audit) => ({
      name: audit.actorName,
      action: audit.action,
      entity: audit.entity,
      entityId: audit.entityId,
      details: audit.details,
      timestamp: audit.createdAt,
    }));

    // Top users with lessons count
    const topConsistentUsers = mostActive.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      lessonsCompleted: u._count.lessonProgress,
      xp: u.xp,
      streak: u.streak,
      lastActiveAt: u.lastActiveAt,
    }));

    return NextResponse.json({
      totalUsers,
      onlineNow,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      inactiveUsers,
      inactive7Days,
      inactive14Days,
      inactive30Days,
      newUsersToday,
      newUsersThisWeek,
      byRole,
      byLeague,
      averageXp: Math.round(averageStats._avg.xp || 0),
      averageStreak: Math.round((averageStats._avg.streak || 0) * 10) / 10,
      premiumUsers: premiumCount,
      recentActivity,
      topStreakHolders: topStreaks,
      topXpEarners: topXpEarners,
      topConsistentUsers,
    });
  } catch (error: any) {
    console.error("Admin users stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
