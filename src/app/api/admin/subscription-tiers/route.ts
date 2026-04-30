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

    const tiers = await db.subscriptionTier.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("Error fetching subscription tiers:", error);
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
    const { key, name, displayName, description, monthlyPrice, quarterlyPrice, annualPrice, features, color, icon, sortOrder } = body;

    if (!key || !name || !displayName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingTier = await db.subscriptionTier.findUnique({
      where: { key },
    });

    if (existingTier) {
      return NextResponse.json({ error: "Tier with this key already exists" }, { status: 400 });
    }

    const tier = await db.subscriptionTier.create({
      data: {
        key,
        name,
        displayName,
        description,
        monthlyPrice: monthlyPrice || 0,
        quarterlyPrice: quarterlyPrice || 0,
        annualPrice: annualPrice || 0,
        features: JSON.stringify(features || []),
        color: color || "#6B7280",
        icon: icon || "star",
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription tier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
