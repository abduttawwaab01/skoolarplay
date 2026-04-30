import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId") || "";
    const moduleId = searchParams.get("moduleId") || "";
    const lessonId = searchParams.get("lessonId") || "";

    const where: any = {};
    if (lessonId) {
      where.lessonId = lessonId;
    } else if (moduleId) {
      where.lesson = { moduleId };
    } else if (courseId) {
      where.lesson = { module: { courseId } };
    }

    const videos = await db.videoContent.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ videos });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch videos" },
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
    const { lessonId, title, url, duration, order } = body;

    if (!lessonId || !title || !url) {
      return NextResponse.json(
        { error: "Lesson ID, title, and URL are required" },
        { status: 400 }
      );
    }

    const video = await db.videoContent.create({
      data: {
        lessonId,
        title,
        url,
        duration: duration || 0,
        order: order || 0,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create video" },
      { status: 500 }
    );
  }
}
