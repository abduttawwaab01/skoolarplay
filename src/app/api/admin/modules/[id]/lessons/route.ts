import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function POST(
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

     if (!title) {
       return NextResponse.json({ error: "Title is required" }, { status: 400 });
     }

     // Validate lesson type enum
     const validTypes = ["QUIZ", "VIDEO", "READING", "MIXED"];
     if (type && !validTypes.includes(type)) {
       return NextResponse.json(
         { error: `Invalid lesson type. Must be one of: ${validTypes.join(", ")}` },
         { status: 400 }
       );
     }

     const lesson = await db.lesson.create({
       data: {
         title,
         moduleId: id,
         type: type || "QUIZ",
         order: order || 0,
         xpReward: xpReward != null ? Number(xpReward) : 10,
         gemReward: gemReward != null ? Number(gemReward) : 1,
         isActive: isActive !== false,
         isLocked: isLocked || false,
         lockReason: lockReason || null,
         unlockThreshold: unlockThreshold || null,
         isPremium: isPremium || false,
       },
     });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create lesson" },
      { status: 500 }
    );
  }
}
