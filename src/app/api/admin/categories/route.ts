import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, color, icon, order, isActive } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Get the next order value if not provided
    const maxOrder = await db.category.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const category = await db.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || null,
        icon: icon || null,
        order: order !== undefined ? order : (maxOrder?.order ?? -1) + 1,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
