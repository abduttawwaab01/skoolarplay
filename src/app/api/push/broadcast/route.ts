import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limiter";
import * as webpush from "web-push";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, userIds, url } = body as {
      title: string;
      message: string;
      userIds?: string[];
      url?: string;
    };

     if (!title || !message) {
       return NextResponse.json(
         { error: "Title and message are required" },
         { status: 400 }
       );
     }

     // Rate limiting: prevent spam broadcasts
     const rateLimitKey = `broadcast:${admin.id}`;
     const rateLimitResult = await rateLimiter.checkLimit(
       rateLimitKey,
       RATE_LIMITS.PUSH_BROADCAST_PER_HOUR || 5
     );
     if (!rateLimitResult.allowed) {
       return NextResponse.json(
         { error: "Too many broadcast requests. Please wait.", retryAfter: rateLimitResult.retryAfter },
         { status: 429 }
       );
     }

     // Create in-app notification records for the targeted users
    let targetUsers: { id: string }[];

    if (userIds && userIds.length > 0) {
      targetUsers = await db.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });
    } else {
      // Send to all non-admin users
      targetUsers = await db.user.findMany({
        where: { role: { not: "ADMIN" } },
        select: { id: true },
      });
    }

    // Batch create notifications
    const notifications = targetUsers.map((user) => ({
      userId: user.id,
      title,
      message,
      type: "INFO" as const,
      link: url || null,
    }));

    // Create in batches to avoid timeout
    const batchSize = 100;
    let createdCount = 0;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      await db.notification.createMany({ data: batch });
      createdCount += batch.length;
    }

    // Get push subscriptions for targeted users
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: { in: targetUsers.map((u) => u.id) },
      },
    });

    // Send push notifications to each subscription
    let pushSentCount = 0;
    let pushFailedCount = 0;

    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@skoolarplay.com";

    if (vapidPublicKey && vapidPrivateKey && subscriptions.length > 0) {
      // Configure VAPID for this request
      webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
      );

      const pushPayload = JSON.stringify({
        title,
        message,
        url: url || '/notifications',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      });

      for (const sub of subscriptions) {
        try {
          const subscription = JSON.parse(sub.keys);
          await webpush.sendNotification(subscription, pushPayload);
          pushSentCount++;
        } catch (error: any) {
          console.error('Push send failed for user', sub.userId, error.message);
          pushFailedCount++;
          // If subscription is invalid (410 Gone), delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await db.pushSubscription.delete({
              where: { id: sub.id },
            });
          }
        }
      }
    } else {
      if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('VAPID keys not configured, push notifications not sent');
      }
    }

    const pushTargets = pushSentCount;

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || "Admin",
      action: "BROADCAST_NOTIFICATION",
      entity: "Notification",
      entityId: "BROADCAST",
      details: {
        title,
        messageLength: message.length,
        targetedUsers: targetUsers.length,
        notificationsCreated: createdCount,
        pushSent: pushSentCount,
        pushFailed: pushFailedCount,
        specificUserIds: userIds || "ALL_USERS",
      },
    });

    return NextResponse.json({
      success: true,
      notificationsCreated: createdCount,
      pushSent: pushSentCount,
      pushFailed: pushFailedCount,
      totalTargeted: targetUsers.length,
      message: `Notification sent to ${createdCount} users (${pushSentCount} push sent, ${pushFailedCount} failed)`,
    });
  } catch (error: any) {
    console.error("Push broadcast error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
