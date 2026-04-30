import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the flag report
    const report = await db.userReport.create({
      data: {
        reporterId: admin.id,
        targetType: "USER",
        targetId: id,
        reason,
        status: "REVIEWED",
        reviewedBy: admin.id,
      },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: "FLAG",
      entity: "User",
      entityId: id,
      details: {
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
        reason,
        reportId: report.id,
      },
    });

    // Create a notification for the flagged user
    await db.notification.create({
      data: {
        userId: id,
        title: "Account Flagged for Review",
        message: `Your account has been flagged for: ${reason}. An admin will review your account. If you believe this is an error, please contact support.`,
        type: "WARNING",
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: `User ${targetUser.name} flagged successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to flag user" },
      { status: 500 }
    );
  }
}
