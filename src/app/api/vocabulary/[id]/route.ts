import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/vocabulary/[id] - Get vocabulary set with words for practice
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const set = await db.vocabularySet.findUnique({
      where: { id, isActive: true },
      include: {
        words: true,
      },
    });

    if (!set) {
      return NextResponse.json({ error: "Vocabulary set not found" }, { status: 404 });
    }

    // Shuffle words for practice
    const shuffledWords = [...set.words].sort(() => Math.random() - 0.5);

    // Get user's progress
    const progress = await db.vocabularyProgress.findUnique({
      where: {
        userId_vocabularySetId: { userId, vocabularySetId: id },
      },
    });

    return NextResponse.json({
      set: {
        id: set.id,
        title: set.title,
        description: set.description,
        language: set.language,
        difficulty: set.difficulty,
        xpReward: set.xpReward,
        gemReward: set.gemReward,
        totalWords: set.words.length,
      },
      words: shuffledWords.map(w => ({
        id: w.id,
        word: w.word,
        definition: w.definition,
        partOfSpeech: w.partOfSpeech,
        pronunciation: w.pronunciation,
        exampleSentence: w.exampleSentence,
        synonyms: w.synonyms ? JSON.parse(w.synonyms) : [],
        antonyms: w.antonyms ? JSON.parse(w.antonyms) : [],
        scrambledWord: w.scrambledWord,
        missingLetter: w.missingLetter,
        audioUrl: w.audioUrl,
        imageUrl: w.imageUrl,
      })),
      progress,
    });
  } catch (error: any) {
    console.error("Vocabulary practice API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch vocabulary" },
      { status: 500 }
    );
  }
}
