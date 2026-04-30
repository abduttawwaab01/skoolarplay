import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const question = await db.question.findUnique({
      where: { id },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch question" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { type, question, hint, explanation, options, correctAnswer, language, points, order, isActive } = body;

    // Validate and format options
    let optionsStr: string | null = null
    if (options !== undefined) {
      if (options && options.length > 0) {
        if (Array.isArray(options)) {
          optionsStr = JSON.stringify(options.map((o: any) => typeof o === 'string' ? o : String(o?.text || '')).filter(Boolean))
        } else if (typeof options === 'string' && options.startsWith('[')) {
          optionsStr = options // Already JSON string
        } else {
          optionsStr = JSON.stringify(options)
        }
      } else {
        optionsStr = null
      }
    }

    // Validate and format correctAnswer
    let correctAnswerStr: string | undefined = undefined
    if (correctAnswer !== undefined) {
      if (correctAnswer !== null) {
        if (typeof correctAnswer === 'number') {
          correctAnswerStr = String(correctAnswer)
        } else if (typeof correctAnswer === 'string') {
          try {
            const parsed = JSON.parse(correctAnswer)
            correctAnswerStr = typeof parsed === 'number' ? String(parsed) : correctAnswer
          } catch {
            correctAnswerStr = correctAnswer
          }
        } else if (Array.isArray(correctAnswer)) {
          correctAnswerStr = JSON.stringify(correctAnswer)
        } else {
          correctAnswerStr = String(correctAnswer)
        }
      } else {
        correctAnswerStr = ''
      }
    }

    const q = await db.question.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(question !== undefined && { question }),
        ...(hint !== undefined && { hint: hint || null }),
        ...(explanation !== undefined && { explanation: explanation || null }),
        ...(options !== undefined && { options: optionsStr }),
        ...(correctAnswer !== undefined && { correctAnswer: correctAnswerStr }),
        ...(language !== undefined && { language: language || null }),
        ...(points !== undefined && { points }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ question: q });
  } catch (error: any) {
    console.error('Update question error:', error)
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
