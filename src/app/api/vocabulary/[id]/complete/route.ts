import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkLevelUp, getLevelInfo } from "@/lib/level-system";
import { calculateXpBoost } from "@/lib/xp-boost";

// POST /api/vocabulary/[id]/complete - Complete vocabulary practice
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: setId } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body as {
      answers: Array<{ wordId: string; correct: boolean }>;
    };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Get vocabulary set with word count
    const vocabularySet = await db.vocabularySet.findUnique({
      where: { id: setId, isActive: true },
      include: { _count: { select: { words: true } } },
    });

    if (!vocabularySet) {
      return NextResponse.json({ error: "Vocabulary set not found" }, { status: 404 });
    }

    const correctCount = answers.filter(a => a.correct).length;
    const totalAnswered = answers.length;
    const percentage = Math.round((correctCount / totalAnswered) * 100);
    const totalWords = vocabularySet._count.words;

    // Get existing progress
    const existingProgress = await db.vocabularyProgress.findUnique({
      where: {
        userId_vocabularySetId: { userId, vocabularySetId: setId },
      },
    });

    // Update progress
    const newCorrectCount = (existingProgress?.correctCount || 0) + correctCount;
    const newTotalAttempts = (existingProgress?.totalAttempts || 0) + totalAnswered;
    const newWordsCompleted = (existingProgress?.wordsCompleted || 0) + correctCount;
    const newStreak = correctCount === totalAnswered ? (existingProgress?.currentStreak || 0) + 1 : 0;
    const newBestStreak = Math.max(existingProgress?.bestStreak || 0, newStreak);
    const isCompleted = newWordsCompleted >= totalWords;

    await db.vocabularyProgress.upsert({
      where: {
        userId_vocabularySetId: { userId, vocabularySetId: setId },
      },
      create: {
        userId,
        vocabularySetId: setId,
        wordsCompleted: newWordsCompleted,
        correctCount: newCorrectCount,
        totalAttempts: newTotalAttempts,
        bestStreak: newBestStreak,
        currentStreak: newStreak,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        wordsCompleted: newWordsCompleted,
        correctCount: newCorrectCount,
        totalAttempts: newTotalAttempts,
        bestStreak: newBestStreak,
        currentStreak: newStreak,
        completed: isCompleted || (existingProgress?.completed || false),
        completedAt: isCompleted && !existingProgress?.completed ? new Date() : existingProgress?.completedAt,
        lastPracticedAt: new Date(),
      },
    });

    // Award rewards if passed (>= 60%)
    let xpEarned = 0;
    let gemsEarned = 0;
    let leveledUp = false;
    let newLevel = 0;

    if (percentage >= 60) {
      xpEarned = vocabularySet.xpReward;
      gemsEarned = vocabularySet.gemReward;

      // Get user data
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streak: true, isPremium: true },
      });

      // Apply XP boost
      const xpBoostResult = calculateXpBoost(xpEarned, {
        streak: currentUser?.streak || 0,
        isPremium: currentUser?.isPremium || false,
      });
      const boostedXp = xpBoostResult.totalXp;

      // Check level up
      const previousXp = currentUser?.xp || 0;
      const previousLevel = currentUser?.level || 1;
      const projectedTotalXp = previousXp + boostedXp;
      const newLevelInfo = getLevelInfo(projectedTotalXp);
      newLevel = newLevelInfo.level;
      leveledUp = newLevel > previousLevel;

      // Update user
      await db.user.update({
        where: { id: userId },
        data: {
          xp: { increment: boostedXp },
          gems: { increment: gemsEarned },
          level: newLevel,
        },
      });

      // Level up rewards
      if (leveledUp) {
        const levelUpResult = checkLevelUp(previousXp, projectedTotalXp);
        if (levelUpResult && levelUpResult.rewards.gems > 0) {
          await db.user.update({
            where: { id: userId },
            data: { gems: { increment: levelUpResult.rewards.gems } },
          });
          gemsEarned += levelUpResult.rewards.gems;
        }
      }
    }

    return NextResponse.json({
      success: true,
      correctCount,
      totalAnswered,
      percentage,
      xpEarned,
      gemsEarned,
      leveledUp,
      newLevel,
      completed: isCompleted,
      wordsCompleted: newWordsCompleted,
      totalWords: (vocabularySet as any)._count?.words || 0,
    });
  } catch (error: any) {
    console.error("Vocabulary complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete vocabulary" },
      { status: 500 }
    );
  }
}
