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
    const category = searchParams.get("category") || "";

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const quotes = await db.motivationalQuote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch quotes" },
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
    const { text, author, category, isActive } = body;

    if (!text || !author) {
      return NextResponse.json(
        { error: "Text and author are required" },
        { status: 400 }
      );
    }

    const quote = await db.motivationalQuote.create({
      data: {
        text,
        author,
        category: category || "GENERAL",
        isActive: isActive !== false,
        createdBy: admin.id,
      },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create quote" },
      { status: 500 }
    );
  }
}
