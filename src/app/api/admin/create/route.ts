import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const email = process.env.ADMIN_EMAIL
  const name = process.env.ADMIN_NAME
  const password = process.env.ADMIN_PASSWORD

  if (!email || !name || !password) {
    return NextResponse.json({
      error: "Admin creation not configured. Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD environment variables.",
    }, { status: 500 })
  }

  try {
    const deleteResult = await db.user.deleteMany({ where: { email } })

    const hashedPassword = bcrypt.hashSync(password, 12)

    const admin = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
        gems: 9999,
        xp: 0,
        streak: 0,
        hearts: 5,
        maxHearts: 5,
        level: 1,
        isBanned: false,
        lastHeartRefillAt: new Date(),
      },
    })

    const { password: _, ...adminSafe } = admin

    return NextResponse.json({
      success: true,
      message: "Admin created",
      admin: adminSafe,
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to create admin",
      message: error.message,
    }, { status: 500 })
  }
}