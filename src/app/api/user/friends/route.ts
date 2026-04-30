import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch followers, following, and suggested friends
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch followers
    const followers = await db.follows.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, name: true, avatar: true, level: true, xp: true, league: true, role: true },
        },
      },
    });

    // Fetch following
    const following = await db.follows.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, name: true, avatar: true, level: true, xp: true, league: true, role: true },
        },
      },
    });

    // Extract exactly the user models out of the follows mapping
    const followerUsers = followers.map((f) => f.follower);
    const followingUsers = following.map((f) => f.following);

    // Fetch some suggestions (simple: users in same league, not already following)
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: { league: true },
    });

    const followingIds = followingUsers.map((u) => u.id);

    const suggestions = await db.user.findMany({
      where: {
        id: { notIn: [...followingIds, userId] },
        role: "STUDENT",
        league: currentUser?.league || "BRONZE",
      },
      select: { id: true, name: true, avatar: true, level: true, xp: true, league: true, role: true },
      take: 5,
    });

    return NextResponse.json({
      followers: followerUsers,
      following: followingUsers,
      suggestions,
    });
  } catch (error) {
    console.error("Failed to fetch friends:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Follow a user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followerId = session.user.id;
    const { targetId } = await req.json();

    if (!targetId || targetId === followerId) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    // Check if target user exists
    const target = await db.user.findUnique({ where: { id: targetId } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Attempt to create the follow relationship
    await db.follows.create({
      data: {
        followerId,
        followingId: targetId,
      },
    });

    return NextResponse.json({ message: "Successfully followed user", status: "followed" });
  } catch (error: any) {
    // Unique constraint violation (already following)
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: "Already following this user" }, { status: 400 });
    }
    console.error("Failed to follow user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Unfollow a user
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const followerId = session.user.id;
    // Extract targetId from query params
    const url = new URL(req.url);
    const targetId = url.searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json({ error: "Missing target userId" }, { status: 400 });
    }

    await db.follows.deleteMany({
      where: {
        followerId,
        followingId: targetId,
      },
    });

    return NextResponse.json({ message: "Successfully unfollowed user", status: "unfollowed" });
  } catch (error) {
    console.error("Failed to unfollow user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
