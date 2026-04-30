import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const item = await db.shopItem.findUnique({
      where: { id },
      include: {
        _count: { select: { purchases: true } },
        purchases: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Shop item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shop item" },
      { status: 500 }
    );
  }
}

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
    const { title, description, type, icon, price, quantity, isActive } = body;

    const item = await db.shopItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(icon !== undefined && { icon }),
        ...(price !== undefined && { price }),
        ...(quantity !== undefined && { quantity }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update shop item" },
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

    await db.shopItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete shop item" },
      { status: 500 }
    );
  }
}
