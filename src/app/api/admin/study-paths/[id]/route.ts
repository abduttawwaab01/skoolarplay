import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const studyPath = await db.studyPath.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isActive: true },
          select: { id: true, title: true, isPremium: true },
        },
      },
    })

    if (!studyPath) {
      return NextResponse.json({ error: "Study path not found" }, { status: 404 })
    }

    return NextResponse.json({ studyPath })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch study path" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { title, description, type, icon, color, isActive, order, courseIds } = body

    const existing = await db.studyPath.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Study path not found" }, { status: 404 })
    }

    // Update study path metadata
    const studyPath = await db.studyPath.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        description: description !== undefined ? description?.trim() || null : existing.description,
        type: type || existing.type,
        icon: icon !== undefined ? icon : existing.icon,
        color: color !== undefined ? color : existing.color,
        order: order ?? existing.order,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    })

    // Handle course assignments if provided
    if (courseIds !== undefined) {
      // First, remove all courses from this study path
      await db.course.updateMany({
        where: { studyPathId: id },
        data: { studyPathId: null },
      })

      // Then assign the selected courses
      if (courseIds.length > 0) {
        await db.course.updateMany({
          where: { id: { in: courseIds } },
          data: { studyPathId: id },
        })
      }
    }

    // Fetch updated courses
    const updatedPath = await db.studyPath.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isActive: true },
          select: { id: true, title: true, isPremium: true },
        },
      },
    })

    return NextResponse.json({ studyPath: updatedPath })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update study path" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.studyPath.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Study path not found" }, { status: 404 })
    }

    // Soft delete - set isActive to false
    await db.studyPath.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Study path deleted" })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete study path" },
      { status: 500 }
    )
  }
}