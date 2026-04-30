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

    const module_ = await db.module.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true } },
        lessons: {
          include: {
            _count: { select: { questions: true, videoContent: true } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!module_) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    return NextResponse.json({ module: module_ });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch module" },
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
     const { title, order, isPremium, isActive } = body;

     const module_ = await db.module.update({
       where: { id },
       data: {
         ...(title !== undefined && { title }),
         ...(order !== undefined && { order }),
         ...(isPremium !== undefined && { isPremium }),
         ...(isActive !== undefined && { isActive }),
       },
     });

    return NextResponse.json({ module: module_ });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update module" },
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

    await db.module.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete module" },
      { status: 500 }
    );
  }
}
