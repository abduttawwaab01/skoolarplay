import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkLevelUp, getLevelInfo } from "@/lib/level-system";
import { calculateXpBoost } from "@/lib/xp-boost";
import { compareAnswers } from "@/lib/answer-checker";

// POST /api/videos/[id]/complete - Complete video quiz
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers, timeSpent } = body as {
      answers: Array<{ questionId: string; answer: string }>;
      timeSpent?: number;
    };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Answers are required" }, { status: 400 });
    }

    // Get video and quiz
    const video = await db.videoContent.findUnique({
      where: { id: videoId },
      include: {
        quiz: {
          include: {
            questions: {
              select: {
                id: true,
                correctAnswer: true,
                type: true,
                question: true,
                options: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            moduleId: true,
            title: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const quiz = video.quiz;
    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ error: "No quiz found for this video" }, { status: 400 });
    }

    // Build question data map
    const questionDataMap = new Map<string, {
      answer: string;
      type: string;
      question: string;
      options: string | null;
      explanation: string | null;
      points: number;
    }>();

    for (const q of quiz.questions) {
      questionDataMap.set(q.id, {
        answer: q.correctAnswer,
        type: q.type,
        question: q.question,
        options: q.options,
        explanation: q.explanation,
        points: q.points,
      });
    }

    // Verify answers
    let correctCount = 0;
    const verifiedAnswers: Array<{ questionId: string; answer: string; isCorrect: boolean }> = [];

    for (const submitted of answers) {
      const questionData = questionDataMap.get(submitted.questionId);
      if (!questionData) continue;

      const isCorrect = compareAnswers(
        questionData.type,
        submitted.answer,
        questionData.answer
      );

      if (isCorrect) correctCount++;
      verifiedAnswers.push({
        questionId: submitted.questionId,
        answer: submitted.answer,
        isCorrect,
      });
    }

    // Calculate score
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = percentage >= quiz.passingScore;

    // Get existing progress
    const existingProgress = await db.videoQuizProgress.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    const previousBestScore = existingProgress?.bestScore ?? 0;
    const isFirstCompletion = !existingProgress?.completed;
    const scoreImproved = percentage > previousBestScore;

    // Determine rewards
    const shouldAwardRewards = isPassed && (isFirstCompletion || scoreImproved);
    let xpEarned = shouldAwardRewards ? quiz.xpReward : 0;
    let gemsEarned = shouldAwardRewards ? quiz.gemReward : 0;

    // Get user data
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, streak: true, isPremium: true, hearts: true },
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
    const newLevel = newLevelInfo.level;
    const leveledUp = newLevel > previousLevel;

    // Update user
    if (shouldAwardRewards) {
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

    // Update progress
    await db.videoQuizProgress.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      create: {
        userId,
        videoId,
        attempts: 1,
        score: percentage,
        bestScore: percentage,
        completed: isPassed,
        completedAt: isPassed ? new Date() : null,
        lastAttemptAt: new Date(),
      },
      update: {
        attempts: { increment: 1 },
        score: percentage,
        bestScore: Math.max(previousBestScore, percentage),
        completed: existingProgress?.completed ? existingProgress.completed : isPassed,
        completedAt: !existingProgress?.completed && isPassed ? new Date() : existingProgress?.completedAt,
        lastAttemptAt: new Date(),
      },
    });

    // Update quiz attempts
    await db.videoQuiz.update({
      where: { id: quiz.id },
      data: { attempts: { increment: 1 } },
    });

    // Build lesson report
    const lessonReport = {
      totalQuestions,
      correctCount,
      percentage,
      isPassed,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map((q, index) => {
        const submitted = verifiedAnswers.find(a => a.questionId === q.id);
        const correctAnswerParsed = JSON.parse(q.correctAnswer);
        return {
          questionId: q.id,
          questionNumber: index + 1,
          question: q.question,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : null,
          correctAnswer: correctAnswerParsed,
          userAnswer: submitted?.answer || null,
          isCorrect: submitted?.isCorrect || false,
          explanation: q.explanation,
          points: q.points,
        };
      }),
    };

    return NextResponse.json({
      success: true,
      passed: isPassed,
      score: percentage,
      passingScore: quiz.passingScore,
      xpEarned: boostedXp,
      gemsEarned,
      leveledUp,
      newLevel,
      lessonReport,
    });
  } catch (error: any) {
    console.error("Video quiz complete error:", error);
    return NextResponse.json(
      { error: "Failed to complete quiz" },
      { status: 500 }
    );
  }
}
