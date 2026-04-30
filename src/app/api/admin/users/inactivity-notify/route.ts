import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

// Helper: format hours into a human-readable duration string
function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) return `${days} day${days !== 1 ? "s" : ""}`;
  return `${days}d ${remainingHours}h`;
}

// Helper: generate notification title/message for an inactivity interval
function generateNotificationContent(intervalHours: number) {
  const duration = formatDuration(intervalHours);
  return {
    title: `We miss you! You've been away for ${duration}`,
    message: `You haven't been active on SkoolarPlay for ${duration}. Your streak might be at risk! Come back and continue learning. ${duration.includes("day") ? "📚" : "⚡"}`,
  };
}

// Helper: parse inactivityReminders from settings
async function getInactivityIntervals(): Promise<number[]> {
  try {
    let settings = await db.adminSettings.findFirst();
    if (!settings) {
      settings = await db.adminSettings.create({ data: {} });
    }
    const parsed = JSON.parse(settings.inactivityReminders || "[5,10,24,48,168,336]");
    return Array.isArray(parsed) ? parsed.sort((a: number, b: number) => a - b) : [5, 10, 24, 48, 168, 336];
  } catch {
    return [5, 10, 24, 48, 168, 336];
  }
}

// GET: Return list of users eligible for inactivity reminders
export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const intervals = await getInactivityIntervals();
    const now = new Date();

    // Get all non-admin, non-banned users who have a lastActiveAt
    const users = await db.user.findMany({
      where: {
        role: { not: "ADMIN" },
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
        isOnline: true,
      },
    });

    // For each user, determine which reminder intervals they should receive
    const eligible: Array<{
      userId: string;
      userName: string;
      userEmail: string;
      hoursSinceActive: number;
      eligibleInterval: number;
      alreadySent: boolean;
    }> = [];

    for (const user of users) {
      if (!user.lastActiveAt) continue;

      const hoursSinceActive = (now.getTime() - user.lastActiveAt.getTime()) / (1000 * 60 * 60);

      // Skip if user is currently online or was active less than 1 hour ago
      if (user.isOnline || hoursSinceActive < 1) continue;

      // Find which reminder intervals the user has passed
      const passedIntervals = intervals.filter((interval) => hoursSinceActive >= interval);

      if (passedIntervals.length === 0) continue;

      // The most recent interval they've passed (and should receive)
      const eligibleInterval = passedIntervals[passedIntervals.length - 1];

      // Check if they already have a notification for this interval
      const { title } = generateNotificationContent(eligibleInterval);
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          title: { contains: "We miss you" },
          createdAt: {
            // Check if notification was sent within the last 2x the interval window
            gte: new Date(now.getTime() - eligibleInterval * 2 * 60 * 60 * 1000),
          },
        },
      });

      eligible.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        hoursSinceActive: Math.round(hoursSinceActive * 10) / 10,
        eligibleInterval,
        alreadySent: !!existingNotification,
      });
    }

    // Group by interval for summary
    const byInterval: Record<string, { total: number; new: number; alreadySent: number; users: typeof eligible }> = {};
    for (const item of eligible) {
      const key = `${item.eligibleInterval}h`;
      if (!byInterval[key]) {
        byInterval[key] = { total: 0, new: 0, alreadySent: 0, users: [] };
      }
      byInterval[key].total++;
      byInterval[key].users.push(item);
      if (item.alreadySent) {
        byInterval[key].alreadySent++;
      } else {
        byInterval[key].new++;
      }
    }

    const newEligible = eligible.filter((e) => !e.alreadySent);

    return NextResponse.json({
      intervals,
      totalEligible: eligible.length,
      newEligible: newEligible.length,
      byInterval,
      eligibleUsers: eligible,
    });
  } catch (error: any) {
    console.error("Inactivity notify GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inactivity data" },
      { status: 500 }
    );
  }
}

// POST: Send inactivity reminders
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { intervalHours, sendAll } = body as {
      intervalHours?: number;
      sendAll?: boolean;
    };

    const intervals = await getInactivityIntervals();
    const now = new Date();

    // Get eligible users (non-admin, non-banned, offline, inactive >= 1 hour)
    const users = await db.user.findMany({
      where: {
        role: { not: "ADMIN" },
        isBanned: false,
        isOnline: false,
        lastActiveAt: { lt: new Date(now.getTime() - 60 * 60 * 1000) },
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
      },
    });

    const notificationsToCreate: Array<{ userId: string; title: string; message: string; type: string }> = [];

    for (const user of users) {
      if (!user.lastActiveAt) continue;

      const hoursSinceActive = (now.getTime() - user.lastActiveAt.getTime()) / (1000 * 60 * 60);

      // Find which interval they're eligible for
      const passedIntervals = intervals.filter((interval) => hoursSinceActive >= interval);
      if (passedIntervals.length === 0) continue;

      const targetInterval = passedIntervals[passedIntervals.length - 1];

      // If specific interval requested, only process users at that exact interval
      if (intervalHours !== undefined && targetInterval !== intervalHours) continue;

      // Check if already notified
      const { title } = generateNotificationContent(targetInterval);
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          title: { contains: "We miss you" },
          createdAt: {
            gte: new Date(now.getTime() - targetInterval * 2 * 60 * 60 * 1000),
          },
        },
      });

      if (existingNotification) continue;

      // Only send if sendAll is true OR this is the first unsent reminder
      if (!sendAll && intervalHours === undefined) {
        // Default: only send the first (5h) reminder to first-time inactive users
        if (targetInterval !== intervals[0]) continue;
      }

      const { message } = generateNotificationContent(targetInterval);
      notificationsToCreate.push({
        userId: user.id,
        title,
        message,
        type: "INACTIVITY_REMINDER",
      });
    }

    if (notificationsToCreate.length === 0) {
      return NextResponse.json({
        success: true,
        notificationsCreated: 0,
        message: "No eligible users for inactivity reminders at this time.",
      });
    }

    // Create notifications in batches
    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < notificationsToCreate.length; i += batchSize) {
      const batch = notificationsToCreate.slice(i, i + batchSize);
      await db.notification.createMany({ data: batch });
      createdCount += batch.length;
    }

    // Get unique user IDs for push notification
    const targetUserIds = [...new Set(notificationsToCreate.map((n) => n.userId))];

    // Get push subscriptions for targeted users
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: { in: targetUserIds } },
    });

    // Use the last notification content for push broadcast
    const lastNotification = notificationsToCreate[notificationsToCreate.length - 1];
    const pushCount = subscriptions.length;

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "SEND_INACTIVITY_REMINDERS",
      entity: "Notification",
      entityId: "INACTIVITY",
      details: {
        notificationsCreated: createdCount,
        pushTargets: pushCount,
        intervalHours: intervalHours || "all",
        sendAll: !!sendAll,
        targetedUserCount: targetUserIds.length,
      },
    });

    return NextResponse.json({
      success: true,
      notificationsCreated: createdCount,
      pushTargets: pushCount,
      targetedUsers: targetUserIds.length,
      message: `Inactivity reminders sent to ${createdCount} users (${pushCount} with push subscriptions)`,
    });
  } catch (error: any) {
    console.error("Inactivity notify POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send inactivity reminders" },
      { status: 500 }
    );
  }
}
