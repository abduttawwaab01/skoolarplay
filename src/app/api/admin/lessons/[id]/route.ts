import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
        questions: { orderBy: { order: "asc" } },
        videoContent: { orderBy: { order: "asc" } },
        _count: { select: { progress: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

     const { id } = await params;
     const body = await req.json();
     const {
       title,
       type,
       order,
       xpReward,
       gemReward,
       isActive,
       isLocked,
       lockReason,
       unlockThreshold,
       isPremium,
     } = body;

     // Validate lesson type if provided
     if (type && !["QUIZ", "VIDEO", "READING", "MIXED"].includes(type)) {
       return NextResponse.json(
         { error: "Invalid lesson type. Must be QUIZ, VIDEO, READING, or MIXED" },
         { status: 400 }
       );
     }

     const lesson = await db.lesson.update({
       where: { id },
       data: {
         ...(title !== undefined && { title }),
         ...(type !== undefined && { type }),
         ...(order !== undefined && { order }),
         ...(xpReward !== undefined && { xpReward: Number(xpReward) }),
         ...(gemReward !== undefined && { gemReward: Number(gemReward) }),
         ...(isActive !== undefined && { isActive }),
         ...(isLocked !== undefined && { isLocked }),
         ...(lockReason !== undefined && { lockReason }),
         ...(unlockThreshold !== undefined && { unlockThreshold: Number(unlockThreshold) }),
         ...(isPremium !== undefined && { isPremium }),
       },
     });

    return NextResponse.json({ lesson });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.lesson.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
