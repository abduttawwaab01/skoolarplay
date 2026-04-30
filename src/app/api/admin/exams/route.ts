import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const exams = await db.exam.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            sections: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json({ exams });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch exams" },
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
    const { title, description, type, subject, year, duration, totalMarks, passingMark, isPublished, sections } = body;

    if (!title || !type || !subject) {
      return NextResponse.json(
        { error: "Title, type, and subject are required" },
        { status: 400 }
      );
    }

    const totalQuestions = sections?.reduce(
      (acc: number, s: any) => acc + (s.questions?.length || 0),
      0
    ) || 0;

    const exam = await db.exam.create({
      data: {
        title,
        description: description || "",
        type,
        subject,
        year: year || null,
        duration: duration || 60,
        totalQuestions,
        totalMarks: totalMarks || 100,
        passingMark: passingMark || 50,
        isPublished: isPublished !== false,
        isActive: true,
        sections: {
          create: (sections || []).map((section: any) => ({
            title: section.title,
            instruction: section.instruction || "",
            marks: section.marks || 0,
            order: section.order || 0,
            questions: {
              create: (section.questions || []).map((q: any) => ({
                type: q.type || "MCQ",
                question: q.question,
                options: q.options ? JSON.stringify(q.options) : null,
                correctAnswer: typeof q.correctAnswer === "string" ? q.correctAnswer : JSON.stringify(q.correctAnswer),
                marks: q.marks || 1,
                explanation: q.explanation || "",
                order: q.order || 0,
              })),
            },
          })),
        },
      },
      include: { sections: { include: { questions: true } } },
    });

    return NextResponse.json({ exam }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create exam" },
      { status: 500 }
    );
  }
}
