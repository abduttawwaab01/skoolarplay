import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quests = await db.quest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { completions: true } },
      },
    });

    return NextResponse.json({ quests });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch quests" },
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
    const { title, description, type, requirement, targetCount, xpReward, gemReward, startDate, endDate, isActive } = body;

    if (!title || !description || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Title, description, type, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const quest = await db.quest.create({
      data: {
        title,
        description,
        type,
        requirement: requirement || "",
        targetCount: targetCount || 1,
        xpReward: xpReward || 0,
        gemReward: gemReward || 0,
        startDate,
        endDate,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ quest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create quest" },
      { status: 500 }
    );
  }
}
