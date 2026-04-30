import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

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

    const course = await db.course.findUnique({
      where: { id },
      include: {
        category: true,
        modules: {
          include: {
            lessons: {
              include: {
                _count: { select: { questions: true, videoContent: true, progress: true } },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch course" },
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
       description,
       categoryId,
       icon,
       color,
       difficulty,
       order,
       isActive,
       price,
       isFree,
       isPremium,
       certificationEnabled,
       minimumLevel,
     } = body;

     // Validate difficulty enum if provided
     if (difficulty && !['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
       return NextResponse.json(
         { error: 'Invalid difficulty. Must be BEGINNER, INTERMEDIATE, or ADVANCED' },
         { status: 400 }
       );
     }

     // Validate minimumLevel if provided
     if (minimumLevel && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(minimumLevel)) {
       return NextResponse.json(
         { error: 'Invalid minimumLevel. Must be A1, A2, B1, B2, C1, or C2' },
         { status: 400 }
       );
     }

     const course = await db.course.update({
       where: { id },
       data: {
         ...(title !== undefined && { title }),
         ...(description !== undefined && { description }),
         ...(categoryId !== undefined && { categoryId }),
         ...(icon !== undefined && { icon }),
         ...(color !== undefined && { color }),
         ...(difficulty !== undefined && { difficulty }),
         ...(order !== undefined && { order }),
         ...(isActive !== undefined && { isActive }),
         ...(price !== undefined && { price: Number(price) }),
         ...(isFree !== undefined && { isFree }),
         ...(isPremium !== undefined && { isPremium }),
         ...(certificationEnabled !== undefined && { certificationEnabled }),
         ...(minimumLevel !== undefined && { minimumLevel }),
       },
       include: { category: true, _count: { select: { enrollments: true } } },
     });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: 'UPDATE',
      entity: 'Course',
      entityId: id,
      details: { title, description, categoryId, difficulty, isActive },
    });

    return NextResponse.json({ course });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update course" },
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

    const deletedCourse = await db.course.findUnique({
      where: { id },
      select: { title: true },
    });

    await db.course.delete({ where: { id } });

    await logAudit({
      actorId: admin.id,
      actorName: admin.name || admin.email,
      action: 'DELETE',
      entity: 'Course',
      entityId: id,
      details: { deletedCourseTitle: deletedCourse?.title },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}
