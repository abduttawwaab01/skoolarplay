import { NextResponse } from "next/server";
import { getSupportOrAdminUser, getUserPermissions } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getSupportOrAdminUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get permissions for the user
    const permissions = await getUserPermissions(user.id);

    // Get stats (these would normally come from database queries)
    // For now, return placeholder data - you can enhance this
    const stats = {
      totalUsers: 0, // Would query: await db.user.count()
      pendingReports: 0, // Would query: await db.userReport.count({ where: { status: 'PENDING' } })
      activeToday: 0, // Would query: await db.user.count({ where: { lastActiveAt: { gte: today } } })
      newThisWeek: 0, // Would query: await db.user.count({ where: { createdAt: { gte: weekStart } } })
    };

    return NextResponse.json({
      permissions,
      stats
    });
  } catch (error) {
    console.error("Support agent stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
