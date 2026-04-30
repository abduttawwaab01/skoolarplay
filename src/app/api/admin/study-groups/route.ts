import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await db.studyGroup.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        _count: {
          select: {
            members: true,
            challenges: true,
          },
        },
      },
    });

    return NextResponse.json({ groups });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch study groups" },
      { status: 500 }
    );
  }
}
