import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function PUT(
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
    const { isRestricted, restrictReason } = body as {
      isRestricted: boolean;
      restrictReason?: string;
    };

    if (typeof isRestricted !== "boolean") {
      return NextResponse.json(
        { error: "isRestricted must be a boolean" },
        { status: 400 }
      );
    }

    // Verify target user exists
    const targetUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        unlockedFeatures: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's unlocked features
    let newFeatures: string;
    if (isRestricted) {
      newFeatures = "[]";
    } else {
      newFeatures = "[]"; // Reset to empty when unrestricting; admin can grant features via edit
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        unlockedFeatures: newFeatures,
      },
      select: { id: true, name: true, email: true, unlockedFeatures: true },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: isRestricted ? "RESTRICT" : "UNRESTRICT",
      entity: "User",
      entityId: id,
      details: {
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
        isRestricted,
        restrictReason: restrictReason || null,
      },
    });

    // Create notification for the user
    if (isRestricted) {
      await db.notification.create({
        data: {
          userId: id,
          title: "Account Restricted",
          message: `Your account has been restricted. Reason: ${restrictReason || "No reason specified"}. Some features may be limited. If you believe this is an error, please contact support.`,
          type: "WARNING",
        },
      });
    } else {
      await db.notification.create({
        data: {
          userId: id,
          title: "Account Restriction Lifted",
          message: "Your account restriction has been lifted. All features should now be available again.",
          type: "INFO",
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: isRestricted
        ? `User ${targetUser.name} restricted successfully`
        : `User ${targetUser.name} unrestricted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update restriction status" },
      { status: 500 }
    );
  }
}
