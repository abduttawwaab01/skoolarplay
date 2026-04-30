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
    const { isBanned } = body;

    const user = await db.user.update({
      where: { id },
      data: { isBanned: !!isBanned },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: !!isBanned ? 'BAN' : 'UPDATE',
      entity: 'User',
      entityId: id,
      details: { targetUserName: user.name, targetUserEmail: user.email, isBanned: !!isBanned },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update ban status" },
      { status: 500 }
    );
  }
}
