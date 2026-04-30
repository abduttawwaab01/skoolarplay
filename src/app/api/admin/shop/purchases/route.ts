import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const purchases = await db.purchase.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        shopItem: { select: { id: true, title: true, type: true, icon: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    });

    const total = await db.purchase.count();

    return NextResponse.json({ purchases, total });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch purchases" },
      { status: 500 }
    );
  }
}
