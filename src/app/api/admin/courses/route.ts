import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { cacheDelete, CACHE_KEYS } from "@/lib/redis-cache";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await db.course.findMany({
      include: {
        category: { select: { id: true, name: true } },
        modules: {
          include: {
            lessons: {
              include: {
                _count: { select: { questions: true, videoContent: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
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

     if (!title || !categoryId) {
       return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
     }

     // Validate difficulty enum
     const validDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
     if (difficulty && !validDifficulties.includes(difficulty)) {
       return NextResponse.json(
         { error: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}` },
         { status: 400 }
       );
     }

     // Validate minimumLevel if provided
     const validLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
     if (minimumLevel && !validLevels.includes(minimumLevel)) {
       return NextResponse.json(
         { error: `Invalid minimumLevel. Must be one of: ${validLevels.join(", ")}` },
         { status: 400 }
       );
     }

     const course = await db.course.create({
       data: {
         title,
         description: description || "",
         categoryId,
         icon: icon || "📚",
         color: color || "#008751",
         difficulty: difficulty || "BEGINNER",
         order: order || 0,
         isActive: isActive !== false,
         price: price != null ? Number(price) : 0,
         isFree: isFree !== false,
         isPremium: isPremium || false,
         certificationEnabled: certificationEnabled || false,
         minimumLevel: minimumLevel || "A1",
       },
       include: { category: true, _count: { select: { enrollments: true } } },
     });

    // Invalidate courses cache
    await cacheDelete(CACHE_KEYS.COURSES_LIST)

    return NextResponse.json({ course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
