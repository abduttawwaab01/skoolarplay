import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: groupId } = await params
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const before = searchParams.get("before")

    // Check if user is a member
    const membership = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    // Get messages
    const where: any = {
      groupId,
      isDeleted: false,
    }

    if (before) {
      where.createdAt = { lt: new Date(before) }
    }

    const messages = await db.groupMessage.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error: any) {
    console.error("Group messages fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: groupId } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
    }

    // Check if user is a member
    const membership = await db.studyGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
    }

    // Check message limit for free users
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        premiumExpiresAt: true,
      },
    })

    const isPremium = user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()

    if (!isPremium) {
      const settings = await db.adminSettings.findFirst()
      const dailyLimit = settings?.freeDailyMessageLimit || 20

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const messageCount = await db.groupMessage.count({
        where: {
          senderId: session.user.id,
          createdAt: { gte: today },
        },
      })

      if (messageCount >= dailyLimit) {
        return NextResponse.json({
          error: `Daily message limit reached. Upgrade to premium for unlimited messages.`,
          limit: dailyLimit,
          remaining: 0,
        }, { status: 429 })
      }
    }

    // Create message
    const message = await db.groupMessage.create({
      data: {
        groupId,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ message, success: true })
  } catch (error: any) {
    console.error("Group message send error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
