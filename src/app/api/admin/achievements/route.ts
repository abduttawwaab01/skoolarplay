import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await db.achievement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json({ achievements });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch achievements" },
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
    const { title, description, icon, condition, xpReward, gemReward } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const achievement = await db.achievement.create({
      data: {
        key: title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        title,
        description: description || "",
        icon: icon || "🏆",
        condition: condition || "",
        xpReward: xpReward || 0,
        gemReward: gemReward || 0,
      },
    });

    return NextResponse.json({ achievement }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create achievement" },
      { status: 500 }
    );
  }
}
