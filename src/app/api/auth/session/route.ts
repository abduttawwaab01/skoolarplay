import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function checkAndUpdateStreak(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastActiveAt: true },
  });

  if (!user || user.streak === 0) return;

  const now = new Date();
  const lastActive = new Date(user.lastActiveAt);
  const diffTime = now.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // If user was active today or yesterday, streak is safe
  if (diffDays <= 1) return;

  // More than 1 day - check if streak freeze can protect
  const streakFreezePurchases = await db.purchase.findMany({
    where: {
      userId,
      shopItem: { type: "STREAK_FREEZE", isActive: true },
    },
    orderBy: { createdAt: "asc" },
    take: 1,
  });

  if (streakFreezePurchases.length > 0) {
    // Use streak freeze - update lastActiveAt to yesterday
    await db.purchase.delete({ where: { id: streakFreezePurchases[0].id } });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    await db.user.update({
      where: { id: userId },
      data: { lastActiveAt: yesterday },
    });
    await db.notification.create({
      data: {
        userId,
        title: "❄️ Streak Freeze Used!",
        message: `Your streak freeze was activated to protect your ${user.streak}-day streak!`,
        type: "INFO",
      },
    });
  } else {
    // No freeze - streak is lost
    const oldStreak = user.streak;
    await db.user.update({
      where: { id: userId },
      data: { streak: 0 },
    });
    await db.notification.create({
      data: {
        userId,
        title: "🔥 Streak Lost!",
        message: `You missed ${diffDays - 1} day(s) of learning and your ${oldStreak}-day streak has been reset. Buy a Streak Freeze to protect your streak next time!`,
        type: "WARNING",
        link: "shop",
      },
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const userId = (session.user as any).id;
    
    try {
      // Check and update streak on every session load
      await checkAndUpdateStreak(userId);

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          gems: true,
          xp: true,
          streak: true,
          longestStreak: true,
          hearts: true,
          maxHearts: true,
          level: true,
          isBanned: true,
          lastActiveAt: true,
          createdAt: true,
          isPremium: true,
          premiumExpiresAt: true,
          unlockedFeatures: true,
          gemMultiplier: true,
          lastHeartRefillAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      return NextResponse.json({ user, session }, { status: 200 });
    } catch (dbError: any) {
      console.error("Database error in session fetch:", dbError.message);
      return NextResponse.json({ user: null, error: "Database error" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session", message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
