import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const excludePathId = searchParams.get('excludePathId')

    const where: any = { isActive: true }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Exclude courses already assigned to a specific study path
    if (excludePathId) {
      where.studyPathId = { not: excludePathId }
    }

    const courses = await db.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        isPremium: true,
        studyPathId: true,
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: { title: 'asc' },
      take: 100,
    })

    return NextResponse.json({ courses })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
