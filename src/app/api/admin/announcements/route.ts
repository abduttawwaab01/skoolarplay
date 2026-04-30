import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, getSupportOrAdminUser, hasPermission } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Allow both admins and support agents
    const user = await getSupportOrAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await db.announcement.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ announcements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Allow both admins and support agents with announcements.send permission
    const user = await getSupportOrAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permission (admins bypass this)
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin) {
      const canSend = await hasPermission(user.id, "announcements.send");
      if (!canSend) {
        return NextResponse.json({ error: "Permission denied: announcements.send" }, { status: 403 });
      }
    }

    const body = await req.json();
    const { title, content, type, isActive, imageUrl, bannerType, targetUrl, priority, expiresAt, scheduledAt } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content: content || "",
        type: type || "INFO",
        isActive: isActive !== false,
        imageUrl: imageUrl || null,
        bannerType: bannerType || "FEATURE",
        targetUrl: targetUrl || null,
        priority: typeof priority === "number" ? priority : 0,
        ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}
