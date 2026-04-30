import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

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
    const { isActive, action } = body;

    if (action === "delete") {
      await db.groupChallengeCompletion.deleteMany({
        where: { challenge: { groupId: id } },
      });
      await db.groupChallenge.deleteMany({ where: { groupId: id } });
      await db.studyGroupMember.deleteMany({ where: { groupId: id } });
      await db.studyGroup.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    // Toggle active status
    const group = await db.studyGroup.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ group });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update study group" },
      { status: 500 }
    );
  }
}
