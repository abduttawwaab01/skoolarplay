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
    const { title, description, type, xpReward, gemReward, date, isActive } = body;

    const challenge = await db.dailyChallenge.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(xpReward !== undefined && { xpReward }),
        ...(gemReward !== undefined && { gemReward }),
        ...(date !== undefined && { date }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ challenge });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update challenge" },
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

    await db.dailyChallengeCompletion.deleteMany({ where: { challengeId: id } });
    await db.dailyChallenge.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete challenge" },
      { status: 500 }
    );
  }
}
