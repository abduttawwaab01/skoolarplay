import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/vocabulary - Get all vocabulary sets for student
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const language = searchParams.get("language") || "";
    const difficulty = searchParams.get("difficulty") || "";

    const where: any = { isActive: true };
    if (language) where.language = language;
    if (difficulty) where.difficulty = difficulty;

    // Get user's progress for each set
    const progress = await db.vocabularyProgress.findMany({
      where: { userId },
      select: {
        vocabularySetId: true,
        wordsCompleted: true,
        correctCount: true,
        totalAttempts: true,
        bestStreak: true,
        completed: true,
        lastPracticedAt: true,
      },
    });

    const progressMap = new Map(progress.map(p => [p.vocabularySetId, p]));

    const sets = await db.vocabularySet.findMany({
      where,
      include: {
        words: {
          select: {
            id: true,
            word: true,
            definition: true,
            partOfSpeech: true,
            pronunciation: true,
            scrambledWord: true,
            missingLetter: true,
          },
        },
        _count: {
          select: { words: true },
        },
      },
      orderBy: { order: "asc" },
    });

    // Combine sets with progress
    const setsWithProgress = sets.map(set => ({
      id: set.id,
      title: set.title,
      description: set.description,
      language: set.language,
      difficulty: set.difficulty,
      xpReward: set.xpReward,
      gemReward: set.gemReward,
      isPremium: set.isPremium,
      totalWords: set._count.words,
      progress: progressMap.get(set.id) || null,
    }));

    return NextResponse.json({ sets: setsWithProgress });
  } catch (error: any) {
    console.error("Vocabulary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vocabulary" },
      { status: 500 }
    );
  }
}
