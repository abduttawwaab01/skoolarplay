import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studyPaths = await db.studyPath.findMany({
      orderBy: { order: "asc" },
      include: {
        courses: {
          where: { isActive: true },
          select: { id: true, title: true, isPremium: true },
        },
      },
    })

    return NextResponse.json({ studyPaths })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch study paths" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, type, icon, color, isActive } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    if (!type || !["EXAM", "SKILL", "LANGUAGE", "BUSINESS"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be EXAM, SKILL, LANGUAGE, or BUSINESS" },
        { status: 400 }
      )
    }

    // Get the next order value
    const maxOrder = await db.studyPath.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const studyPath = await db.studyPath.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        icon: icon || null,
        color: color || null,
        order: (maxOrder?.order ?? -1) + 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ studyPath }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create study path" },
      { status: 500 }
    )
  }
}