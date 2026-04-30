import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const giftCode = await db.giftCode.update({
      where: { id },
      data: {
        ...(body.tier !== undefined && { tier: body.tier }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.gems !== undefined && { gems: body.gems }),
        ...(body.usesTotal !== undefined && { usesTotal: body.usesTotal }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(giftCode);
  } catch (error) {
    console.error("Error updating gift code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.giftCode.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Gift code deleted successfully" });
  } catch (error) {
    console.error("Error deleting gift code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
