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
    const { title, description, icon, condition, xpReward, gemReward } = body;

    const achievement = await db.achievement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(condition !== undefined && { condition }),
        ...(xpReward !== undefined && { xpReward }),
        ...(gemReward !== undefined && { gemReward }),
      },
    });

    return NextResponse.json({ achievement });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update achievement" },
      { status: 500 }
    );
  }
}

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

    await db.userAchievement.deleteMany({ where: { achievementId: id } });
    await db.achievement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete achievement" },
      { status: 500 }
    );
  }
}
