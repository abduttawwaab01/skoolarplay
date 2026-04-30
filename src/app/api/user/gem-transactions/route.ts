import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      db.gemTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.gemTransaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gem transactions:", error);
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
    const { userId, amount, type, source, description, relatedId } = body;

    if (!userId || amount === undefined || !type || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newBalance = user.gems + amount;
    if (newBalance < 0) {
      return NextResponse.json({ error: "Insufficient gems" }, { status: 400 });
    }

    const [transaction, updatedUser] = await db.$transaction([
      db.gemTransaction.create({
        data: {
          userId,
          amount,
          type,
          source,
          description: description || `${type} - ${source}`,
          relatedId,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: { gems: newBalance },
      }),
    ]);

    return NextResponse.json({
      transaction,
      newBalance: updatedUser.gems,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating gem transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
