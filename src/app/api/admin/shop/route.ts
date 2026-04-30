import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.shopItem.findMany({
      include: {
        _count: { select: { purchases: true } },
        purchases: {
          select: { totalGems: true, quantity: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const itemsWithStats = items.map((item) => ({
      ...item,
      totalRevenue: item.purchases.reduce((sum, p) => sum + p.totalGems, 0),
      totalPurchases: item._count.purchases,
    }));

    return NextResponse.json({ items: itemsWithStats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch shop items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, type, icon, price, quantity, isActive } = body;

    if (!title || !type || price === undefined) {
      return NextResponse.json(
        { error: "Title, type, and price are required" },
        { status: 400 }
      );
    }

    const item = await db.shopItem.create({
      data: {
        title,
        description: description || "",
        type,
        icon: icon || "🎁",
        price,
        quantity: quantity !== undefined ? quantity : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create shop item" },
      { status: 500 }
    );
  }
}
