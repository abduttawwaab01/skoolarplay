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
    const status = searchParams.get("status") || "";

    const where: Record<string, string> = {};

    if (status && ["PENDING", "PROCESSING", "COMPLETED", "FAILED"].includes(status)) {
      where.status = status;
    }

    const payouts = await db.teacherPayout.findMany({
      where,
      include: {
        teacher: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    });

    // Summary stats
    const allPayouts = await db.teacherPayout.findMany({
      select: { status: true, amount: true },
    });

    const summary = {
      totalRequested: allPayouts.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: allPayouts
        .filter((p) => p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0),
      processingAmount: allPayouts
        .filter((p) => p.status === "PROCESSING")
        .reduce((sum, p) => sum + p.amount, 0),
      completedAmount: allPayouts
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0),
      pendingCount: allPayouts.filter((p) => p.status === "PENDING").length,
      processingCount: allPayouts.filter((p) => p.status === "PROCESSING").length,
      completedCount: allPayouts.filter((p) => p.status === "COMPLETED").length,
    };

    return NextResponse.json({ payouts, summary });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
