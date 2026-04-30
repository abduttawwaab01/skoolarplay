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
    const { courseId, moduleId, title, description, difficulty, hp, xpReward, gemReward, timeLimit, isActive } = body;

    const bossBattle = await db.bossBattle.update({
      where: { id },
      data: {
        ...(courseId !== undefined && { courseId }),
        ...(moduleId !== undefined && { moduleId: moduleId || null }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(hp !== undefined && { hp }),
        ...(xpReward !== undefined && { xpReward }),
        ...(gemReward !== undefined && { gemReward }),
        ...(timeLimit !== undefined && { timeLimit }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ bossBattle });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update boss battle" },
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

    await db.bossBattleCompletion.deleteMany({ where: { bossBattleId: id } });
    await db.bossBattle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete boss battle" },
      { status: 500 }
    );
  }
}
