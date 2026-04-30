import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { adId } = body as { adId: string };

    if (!adId) {
      return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
    }

    // Verify the announcement exists
    const announcement = await db.announcement.findUnique({
      where: { id: adId },
      select: { id: true, title: true },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, role: true },
    });

    // Create ad click log entry
    // We'll use the AuditLog model for tracking
    await logAudit({
      actorId: userId,
      actorName: user?.name || "Unknown",
      action: "AD_CLICK",
      entity: "Announcement",
      entityId: adId,
      details: {
        announcementTitle: announcement.title,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get ad click stats from audit logs
    const adClicks = await db.auditLog.findMany({
      where: { action: "AD_CLICK", entity: "Announcement" },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    // Group by announcement ID
    const stats: Record<string, { adId: string; title: string; clicks: number; lastClick: string; uniqueUsers: Set<string> }> = {};

    for (const click of adClicks) {
      const details = click.details ? JSON.parse(click.details) : {};
      const adId = click.entityId;

      if (!stats[adId]) {
        stats[adId] = {
          adId,
          title: details.announcementTitle || "Unknown",
          clicks: 0,
          lastClick: "",
          uniqueUsers: new Set(),
        };
      }

      stats[adId].clicks++
      stats[adId].uniqueUsers.add(click.actorId)
      if (!stats[adId].lastClick || click.createdAt > new Date(stats[adId].lastClick)) {
        stats[adId].lastClick = click.createdAt.toISOString()
      }
    }

    const summary = Object.values(stats).map((s) => ({
      adId: s.adId,
      title: s.title,
      clicks: s.clicks,
      uniqueUsers: s.uniqueUsers.size,
      lastClick: s.lastClick,
    })).sort((a, b) => b.clicks - a.clicks);

    return NextResponse.json({
      totalClicks: adClicks.length,
      stats: summary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
