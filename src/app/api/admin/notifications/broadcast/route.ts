import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, link } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Get all active users
    const users = await db.user.findMany({
      where: { isBanned: false },
      select: { id: true },
    });

    // Create notification for all users
    const notifications = await db.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title,
        message,
        type: type || "INFO",
        link: link || null,
      })),
    });

    return NextResponse.json(
      { success: true, count: notifications.count },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to broadcast notification" },
      { status: 500 }
    );
  }
}
