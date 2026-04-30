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

    const attempts = await db.examAttempt.findMany({
      where: { examId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    const stats = {
      total: attempts.length,
      passed: attempts.filter(a => a.passed).length,
      failed: attempts.filter(a => !a.passed).length,
      avgScore: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0,
    };

    return NextResponse.json({ attempts, stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch exam results" },
      { status: 500 }
    );
  }
}
