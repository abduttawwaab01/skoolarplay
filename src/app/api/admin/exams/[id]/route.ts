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

    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        sections: {
          include: { questions: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch exam" },
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
    const { title, description, type, subject, year, duration, totalMarks, passingMark, isPublished, isActive } = body;

    const exam = await db.exam.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(subject !== undefined && { subject }),
        ...(year !== undefined && { year }),
        ...(duration !== undefined && { duration }),
        ...(totalMarks !== undefined && { totalMarks }),
        ...(passingMark !== undefined && { passingMark }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ exam });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update exam" },
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

    // Delete related data first
    const examQuestions = await db.examQuestion.findMany({
      where: { section: { examId: id } },
      select: { id: true },
    });
    const qIds = examQuestions.map(q => q.id);

    await db.examAttempt.deleteMany({ where: { examId: id } });
    if (qIds.length > 0) await db.examQuestion.deleteMany({ where: { id: { in: qIds } } });
    await db.examSection.deleteMany({ where: { examId: id } });
    await db.exam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete exam" },
      { status: 500 }
    );
  }
}
