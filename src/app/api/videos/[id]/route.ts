import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkLevelUp, getLevelInfo } from "@/lib/level-system";
import { calculateXpBoost } from "@/lib/xp-boost";

// GET /api/videos/[id] - Get video content with quiz for students
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userIsPremium = (session?.user as any)?.isPremium || false;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const video = await db.videoContent.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
            isPremium: true,
            module: {
              select: {
                id: true,
                title: true,
                isPremium: true,
                course: {
                  select: { id: true, title: true, isPremium: true },
                },
              },
            },
          },
        },
        quiz: {
          where: { isActive: true },
          include: {
            questions: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                type: true,
                question: true,
                hint: true,
                explanation: true,
                options: true,
                correctAnswer: true,
                order: true,
                points: true,
              },
            },
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Check premium access
    const videoIsPremium = video.lesson?.isPremium || false;
    const moduleIsPremium = video.lesson?.module?.isPremium || false;
    const courseIsPremium = video.lesson?.module?.course?.isPremium || false;
    const isPremiumContent = videoIsPremium || moduleIsPremium || courseIsPremium;

    if (isPremiumContent && !userIsPremium) {
      return NextResponse.json({
        error: "Premium subscription required",
        requiresPremium: true,
        premiumLevel: videoIsPremium ? "lesson" : moduleIsPremium ? "module" : "course",
      }, { status: 403 });
    }

    // Get user's progress for this video
    const progress = await db.videoQuizProgress.findUnique({
      where: {
        userId_videoId: { userId, videoId: id },
      },
    });

    return NextResponse.json({
      video: {
        id: video.id,
        title: video.title,
        url: video.url,
        duration: video.duration,
        lesson: video.lesson,
        isPremium: isPremiumContent,
      },
      quiz: video.quiz ? {
        id: video.quiz.id,
        title: video.quiz.title,
        passingScore: video.quiz.passingScore,
        timeLimit: video.quiz.timeLimit,
        xpReward: video.quiz.xpReward,
        gemReward: video.quiz.gemReward,
        requireFullscreen: video.quiz.requireFullscreen,
        preventTabSwitch: video.quiz.preventTabSwitch,
        preventCopyPaste: video.quiz.preventCopyPaste,
        shuffleQuestions: video.quiz.shuffleQuestions,
        shuffleOptions: video.quiz.shuffleOptions,
        questions: video.quiz.questions,
        hasQuiz: video.quiz.questions.length > 0,
      } : null,
      progress: progress ? {
        attempts: progress.attempts,
        bestScore: progress.bestScore,
        completed: progress.completed,
      } : null,
    });
  } catch (error: any) {
    console.error("Video quiz API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}
