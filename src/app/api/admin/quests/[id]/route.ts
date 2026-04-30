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
    const { title, description, type, requirement, targetCount, xpReward, gemReward, startDate, endDate, isActive } = body;

    const quest = await db.quest.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(requirement !== undefined && { requirement }),
        ...(targetCount !== undefined && { targetCount }),
        ...(xpReward !== undefined && { xpReward }),
        ...(gemReward !== undefined && { gemReward }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ quest });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update quest" },
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

    await db.questCompletion.deleteMany({ where: { questId: id } });
    await db.quest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete quest" },
      { status: 500 }
    );
  }
}
