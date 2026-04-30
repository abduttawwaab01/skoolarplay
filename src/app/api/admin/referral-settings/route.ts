import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current referral settings from the latest referrals
    const latestReferral = await db.referral.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Default settings
    const settings = {
      rewardGems: latestReferral?.rewardGems || 25,
      enabled: true,
    };

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch referral settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rewardGems } = body;

    if (rewardGems === undefined || rewardGems < 0) {
      return NextResponse.json(
        { error: "Invalid reward amount" },
        { status: 400 }
      );
    }

    // Update all existing referral records with new reward amount
    await db.referral.updateMany({
      data: { rewardGems },
    });

    return NextResponse.json({ success: true, rewardGems });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update referral settings" },
      { status: 500 }
    );
  }
}
