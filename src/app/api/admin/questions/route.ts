import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || "";
    const moduleId = searchParams.get("moduleId") || "";
    const lessonId = searchParams.get("lessonId") || "";

    const where: any = {};

    if (lessonId) {
      where.lessonId = lessonId;
    } else if (moduleId) {
      where.lesson = { moduleId };
    } else if (courseId) {
      where.lesson = { module: { courseId } };
    }

    const questions = await db.question.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
          },
        },
      },
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

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lessonId, type, question, hint, explanation, options, correctAnswer, language, points, order } = body;

    if (!lessonId || !question) {
      return NextResponse.json(
        { error: "Lesson ID and question text are required" },
        { status: 400 }
      );
    }

    // Validate and format options
    let optionsStr: string | null = null
    if (options && options.length > 0) {
      if (Array.isArray(options)) {
        optionsStr = JSON.stringify(options.map((o: any) => typeof o === 'string' ? o : String(o?.text || '')).filter(Boolean))
      } else if (typeof options === 'string' && options.startsWith('[')) {
        optionsStr = options // Already JSON string
      } else {
        optionsStr = JSON.stringify(options)
      }
    }

    // Validate and format correctAnswer - always required in DB
    let correctAnswerStr = correctAnswer !== undefined && correctAnswer !== null
      ? (typeof correctAnswer === 'number' ? String(correctAnswer) :
         typeof correctAnswer === 'string' ? correctAnswer :
         Array.isArray(correctAnswer) ? JSON.stringify(correctAnswer) :
         String(correctAnswer))
      : ''

    // Validate question type needs options
    const questionType = type || 'MCQ'
    const noOptionsTypes = ['FILL_BLANK', 'TRUE_FALSE', 'SPEECH']
    const needsOptions = !noOptionsTypes.includes(questionType)
    if (needsOptions && (!optionsStr || optionsStr === '[]')) {
      return NextResponse.json(
        { error: "Options are required for this question type" },
        { status: 400 }
      );
    }
    if (!correctAnswerStr) {
      return NextResponse.json(
        { error: "Correct answer is required" },
        { status: 400 }
      );
    }

    const q = await db.question.create({
      data: {
        lessonId,
        type: questionType,
        question,
        hint: hint || null,
        explanation: explanation || null,
        options: optionsStr,
        correctAnswer: correctAnswerStr,
        language: language || null,
        points: points || 10,
        order: order || 0,
      },
    });

    return NextResponse.json({ question: q }, { status: 201 });
  } catch (error: any) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}
