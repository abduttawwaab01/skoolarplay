import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const codes = await db.giftCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        redemptions: {
          select: { userId: true, redeemedAt: true },
        },
      },
    });

    return NextResponse.json(codes);
  } catch (error) {
    console.error("Error fetching gift codes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, tier, duration, gems, usesTotal, expiresAt } = body;

    if (!code || !duration) {
      return NextResponse.json({ error: "Code and duration are required" }, { status: 400 });
    }

    const existing = await db.giftCode.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: "Code already exists" }, { status: 400 });
    }

    const giftCode = await db.giftCode.create({
      data: {
        code: code.toUpperCase(),
        tier,
        duration,
        gems: gems || null,
        usesTotal: usesTotal || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(giftCode, { status: 201 });
  } catch (error) {
    console.error("Error creating gift code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
