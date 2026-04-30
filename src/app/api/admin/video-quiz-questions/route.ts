import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

// GET /api/admin/video-quiz-questions - Get questions by quizId
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 });
    }

    const questions = await db.videoQuizQuestion.findMany({
      where: { videoQuizId: quizId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/video-quiz-questions - Create question
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      videoQuizId,
      type,
      question,
      hint,
      explanation,
      options,
      correctAnswer,
      points,
      order,
    } = body;

    if (!videoQuizId || !question || correctAnswer === undefined) {
      return NextResponse.json(
        { error: "Quiz ID, question text, and correct answer are required" },
        { status: 400 }
      );
    }

    // Check if quiz exists
    const quiz = await db.videoQuiz.findUnique({
      where: { id: videoQuizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Video quiz not found" }, { status: 404 });
    }

    // Get the next order number if not provided
    let orderNum = order;
    if (orderNum === undefined) {
      const lastQuestion = await db.videoQuizQuestion.findFirst({
        where: { videoQuizId },
        orderBy: { order: "desc" },
        select: { order: true },
      });
      orderNum = (lastQuestion?.order ?? -1) + 1;
    }

    const q = await db.videoQuizQuestion.create({
      data: {
        videoQuizId,
        type: type || "MCQ",
        question,
        hint: hint || null,
        explanation: explanation || null,
        options: options ? JSON.stringify(options) : null,
        correctAnswer: typeof correctAnswer === "string" ? correctAnswer : JSON.stringify(correctAnswer),
        points: points || 10,
        order: orderNum,
      },
    });

    return NextResponse.json({ question: q }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/video-quiz-questions - Update question
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      type,
      question,
      hint,
      explanation,
      options,
      correctAnswer,
      points,
      order,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (question !== undefined) updateData.question = question;
    if (hint !== undefined) updateData.hint = hint;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (options !== undefined) updateData.options = options ? JSON.stringify(options) : null;
    if (correctAnswer !== undefined) {
      updateData.correctAnswer = typeof correctAnswer === "string" ? correctAnswer : JSON.stringify(correctAnswer);
    }
    if (points !== undefined) updateData.points = points;
    if (order !== undefined) updateData.order = order;

    const q = await db.videoQuizQuestion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ question: q });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/video-quiz-questions - Delete question
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }

    await db.videoQuizQuestion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
