import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys } = body as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this user
    const existing = await db.pushSubscription.findFirst({
      where: { userId, endpoint },
    });

    if (existing) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    // Create new subscription
    await db.pushSubscription.create({
      data: {
        userId,
        endpoint,
        keys: JSON.stringify(keys),
      },
    });

    return NextResponse.json({ success: true, message: "Subscribed to push notifications" });
  } catch (error: any) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body as { endpoint: string };

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
    }

    await db.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });

    return NextResponse.json({ success: true, message: "Unsubscribed from push notifications" });
  } catch (error: any) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
