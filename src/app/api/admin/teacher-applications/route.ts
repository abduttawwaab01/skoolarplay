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

    if (status === "pending") {
      where.status = "PENDING";
    } else if (status === "approved") {
      where.status = "APPROVED";
    } else if (status === "rejected") {
      where.status = "REJECTED";
    }

    const teacherProfiles = await db.teacherProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
        _count: {
          select: { reviews: true, payouts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications: teacherProfiles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch teacher applications" },
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

    const { userId, bio, subjects } = body;

    if (!userId || !subjects) {
      return NextResponse.json(
        { error: "UserId and subjects are required" },
        { status: 400 }
      );
    }

    const profile = await db.teacherProfile.create({
      data: {
        userId,
        bio: bio || "",
        subjects: typeof subjects === "string" ? subjects : JSON.stringify(subjects),
        status: "PENDING",
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create teacher application" },
      { status: 500 }
    );
  }
}
