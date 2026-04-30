import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bossBattles = await db.bossBattle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        completions: { select: { id: true } },
        _count: { select: { completions: true } },
      },
    });

    return NextResponse.json({ bossBattles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch boss battles" },
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
    const { courseId, moduleId, title, description, difficulty, hp, xpReward, gemReward, timeLimit, isActive } = body;

    if (!courseId || !title || !description) {
      return NextResponse.json(
        { error: "CourseId, title, and description are required" },
        { status: 400 }
      );
    }

    const bossBattle = await db.bossBattle.create({
      data: {
        courseId,
        moduleId: moduleId || null,
        title,
        description,
        difficulty: difficulty || "NORMAL",
        hp: hp || 100,
        xpReward: xpReward || 0,
        gemReward: gemReward || 0,
        timeLimit: timeLimit || 120,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ bossBattle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create boss battle" },
      { status: 500 }
    );
  }
}
