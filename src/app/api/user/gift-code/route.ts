import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Gift code is required" }, { status: 400 });
    }

    const userId = session.user.id;

    const giftCode = await db.giftCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { redemptions: true },
    });

    if (!giftCode) {
      return NextResponse.json({ error: "Invalid gift code" }, { status: 404 });
    }

    if (!giftCode.isActive) {
      return NextResponse.json({ error: "This gift code has been deactivated" }, { status: 400 });
    }

    if (giftCode.expiresAt && new Date(giftCode.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This gift code has expired" }, { status: 400 });
    }

    if (giftCode.usesUsed >= giftCode.usesTotal) {
      return NextResponse.json({ error: "This gift code has already been fully redeemed" }, { status: 400 });
    }

    const alreadyRedeemed = giftCode.redemptions.some(r => r.userId === userId);
    if (alreadyRedeemed) {
      return NextResponse.json({ error: "You have already redeemed this gift code" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { planTier: true, isPremium: true, premiumExpiresAt: true },
    });

    if (giftCode.tier && user?.planTier === giftCode.tier) {
      return NextResponse.json({ error: `You are already on the ${giftCode.tier} plan` }, { status: 400 });
    }

    const tierHierarchy = ['FREE', 'STARTER', 'PRO', 'SCHOLAR', 'SCHOLAR_PLUS'];
    const currentTierIndex = tierHierarchy.indexOf(user?.planTier || 'FREE');
    const giftTierIndex = tierHierarchy.indexOf(giftCode.tier || 'SCHOLAR_PLUS');
    
    if (giftTierIndex > currentTierIndex) {
      const subscription = await db.subscription.create({
        data: {
          userId,
          tierKey: giftCode.tier || 'PRO',
          plan: 'GIFT_CODE',
          amount: 0,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + (giftCode.duration * 30 * 24 * 60 * 60 * 1000)),
          createdBy: 'SYSTEM',
        },
      });

      await db.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumExpiresAt: subscription.expiresAt,
          planTier: giftCode.tier || 'PRO',
        },
      });
    }

    if (giftCode.gems) {
      await db.user.update({
        where: { id: userId },
        data: { gems: { increment: giftCode.gems } },
      });

      await db.gemTransaction.create({
        data: {
          userId,
          amount: giftCode.gems,
          type: 'BONUS',
          source: 'gift_code',
          description: `Gift code redemption: ${code}`,
        },
      });
    }

    await db.giftCodeRedemption.create({
      data: {
        giftCodeId: giftCode.id,
        userId,
      },
    });

    await db.giftCode.update({
      where: { id: giftCode.id },
      data: { usesUsed: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed ${giftCode.tier || 'PRO'} plan for ${giftCode.duration} months!`,
      tier: giftCode.tier || 'PRO',
      duration: giftCode.duration,
      gems: giftCode.gems || 0,
    });
  } catch (error) {
    console.error("Error redeeming gift code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
