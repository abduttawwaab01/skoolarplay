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
    const type = searchParams.get("type") || "";
    const date = searchParams.get("date") || "";

    const where: any = {};
    if (type) where.type = type;
    if (date) where.date = date;

    const challenges = await db.dailyChallenge.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        _count: { select: { completions: true } },
      },
    });

    return NextResponse.json({ challenges });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch challenges" },
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
    const { title, description, type, xpReward, gemReward, date, isActive } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const challenge = await db.dailyChallenge.create({
      data: {
        title,
        description: description || "",
        type: type || "QUIZ",
        xpReward: xpReward || 0,
        gemReward: gemReward || 0,
        date,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create challenge" },
      { status: 500 }
    );
  }
}
