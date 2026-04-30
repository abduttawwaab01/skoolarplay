import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent admin from deleting their own account
    if (id === admin.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Verify the user is a support agent
    const supportAgent = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!supportAgent) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (supportAgent.role !== "SUPPORT") {
      return NextResponse.json(
        { error: "This user is not a support agent" },
        { status: 400 }
      );
    }

    await db.user.delete({ where: { id } });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: "DELETE",
      entity: "User",
      entityId: id,
      details: {
        deletedUserName: supportAgent.name,
        deletedUserEmail: supportAgent.email,
        deletedUserRole: "SUPPORT",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Support agent ${supportAgent.name} has been deleted`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete support agent" },
      { status: 500 }
    );
  }
}
