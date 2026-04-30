import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, key, name, displayName, description, monthlyPrice, quarterlyPrice, annualPrice, maxHearts, maxGroupsCreate, maxGroupsJoin, dailyMessageLimit, aiChatLimitPerDay, features, color, icon, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Tier ID is required" }, { status: 400 });
    }

    const tier = await db.subscriptionTier.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(name && { name }),
        ...(displayName && { displayName }),
        ...(description !== undefined && { description }),
        ...(monthlyPrice !== undefined && { monthlyPrice }),
        ...(quarterlyPrice !== undefined && { quarterlyPrice }),
        ...(annualPrice !== undefined && { annualPrice }),
        ...(maxHearts !== undefined && { maxHearts }),
        ...(maxGroupsCreate !== undefined && { maxGroupsCreate }),
        ...(maxGroupsJoin !== undefined && { maxGroupsJoin }),
        ...(dailyMessageLimit !== undefined && { dailyMessageLimit }),
        ...(aiChatLimitPerDay !== undefined && { aiChatLimitPerDay }),
        ...(features && { features: JSON.stringify(features) }),
        ...(color && { color }),
        ...(icon && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(tier);
  } catch (error) {
    console.error("Error updating subscription tier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Tier ID is required" }, { status: 400 });
    }

    const existingTier = await db.subscriptionTier.findUnique({
      where: { id },
    });

    if (!existingTier) {
      return NextResponse.json({ error: "Tier not found" }, { status: 404 });
    }

    if (existingTier.key === "FREE" || existingTier.key === "PRO") {
      return NextResponse.json({ error: "Cannot delete default tiers" }, { status: 400 });
    }

    await db.subscriptionTier.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tier deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription tier:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
