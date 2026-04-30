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
     const { title, order, isPremium } = body;

     if (!title) {
       return NextResponse.json({ error: "Title is required" }, { status: 400 });
     }

     // Verify course exists
     const courseExists = await db.course.findUnique({ where: { id } })
     if (!courseExists) {
       return NextResponse.json({ error: "Course not found" }, { status: 404 })
     }

     const module_ = await db.module.create({
       data: {
         title,
         courseId: id,
         order: order || 0,
         isPremium: isPremium || false,
       },
     });

    return NextResponse.json({ module: module_ }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create module" },
      { status: 500 }
    );
  }
}
