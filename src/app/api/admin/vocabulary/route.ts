import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/vocabulary - Get vocabulary sets
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language") || "";
    const difficulty = searchParams.get("difficulty") || "";

    const where: any = { isActive: true };
    if (language) where.language = language;
    if (difficulty) where.difficulty = difficulty;

    const sets = await db.vocabularySet.findMany({
      where,
      include: {
        words: {
          select: { id: true, word: true },
        },
        category: {
          select: { id: true, name: true, language: true },
        },
        _count: {
          select: { words: true, progress: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ sets });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch vocabulary sets" },
      { status: 500 }
    );
  }
}

// POST /api/admin/vocabulary - Create vocabulary set
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      language,
      difficulty,
      xpReward,
      gemReward,
      isPremium,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const set = await db.vocabularySet.create({
      data: {
        title,
        description: description || null,
        categoryId: categoryId || null,
        language: language || "en",
        difficulty: difficulty || "BEGINNER",
        xpReward: xpReward ?? 10,
        gemReward: gemReward ?? 2,
        isPremium: isPremium ?? false,
      },
    });

    return NextResponse.json({ set }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create vocabulary set" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vocabulary - Update vocabulary set
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
    }

    const {
      title,
      description,
      categoryId,
      language,
      difficulty,
      xpReward,
      gemReward,
      isPremium,
      isActive,
    } = body;

    const set = await db.vocabularySet.update({
      where: { id },
      data: {
        title,
        description: description || null,
        categoryId: categoryId || null,
        language,
        difficulty,
        xpReward,
        gemReward,
        isPremium,
        isActive,
      },
    });

    return NextResponse.json({ set });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update vocabulary set" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vocabulary - Delete vocabulary set
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Set ID is required" }, { status: 400 });
    }

    await db.vocabularySet.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Vocabulary set deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete vocabulary set" },
      { status: 500 }
    );
  }
}
