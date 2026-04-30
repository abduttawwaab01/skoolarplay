import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/video-quiz - Get video quiz by videoId
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const quiz = await db.videoQuiz.findUnique({
      where: { videoId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        video: {
          select: {
            id: true,
            title: true,
            lesson: {
              select: {
                id: true,
                title: true,
                module: {
                  select: {
                    id: true,
                    title: true,
                    course: { select: { id: true, title: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ quiz });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch video quiz" },
      { status: 500 }
    );
  }
}

// POST /api/admin/video-quiz - Create or update video quiz
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      videoId,
      title,
      passingScore,
      timeLimit,
      xpReward,
      gemReward,
      requireFullscreen,
      preventTabSwitch,
      preventCopyPaste,
      shuffleQuestions,
      shuffleOptions,
    } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    // Check if video exists
    const video = await db.videoContent.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Upsert quiz (create or update)
    const quiz = await db.videoQuiz.upsert({
      where: { videoId },
      create: {
        videoId,
        title: title || "Video Quiz",
        passingScore: passingScore ?? 60,
        timeLimit: timeLimit ?? null,
        xpReward: xpReward ?? 15,
        gemReward: gemReward ?? 2,
        requireFullscreen: requireFullscreen ?? false,
        preventTabSwitch: preventTabSwitch ?? false,
        preventCopyPaste: preventCopyPaste ?? false,
        shuffleQuestions: shuffleQuestions ?? false,
        shuffleOptions: shuffleOptions ?? false,
      },
      update: {
        title: title ?? "Video Quiz",
        passingScore: passingScore ?? 60,
        timeLimit: timeLimit ?? null,
        xpReward: xpReward ?? 15,
        gemReward: gemReward ?? 2,
        requireFullscreen: requireFullscreen ?? false,
        preventTabSwitch: preventTabSwitch ?? false,
        preventCopyPaste: preventCopyPaste ?? false,
        shuffleQuestions: shuffleQuestions ?? false,
        shuffleOptions: shuffleOptions ?? false,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create/update video quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/video-quiz - Delete video quiz
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    await db.videoQuiz.delete({
      where: { videoId },
    });

    return NextResponse.json({ success: true, message: "Video quiz deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete video quiz" },
      { status: 500 }
    );
  }
}
