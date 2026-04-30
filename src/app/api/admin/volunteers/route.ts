import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// GET /api/admin/volunteers - Get all volunteers
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const volunteers = await db.volunteer.findMany({
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({ volunteers })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch volunteers' },
      { status: 500 }
    )
  }
}

// POST /api/admin/volunteers - Create volunteer
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, displayOrder } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const volunteer = await db.volunteer.create({
      data: {
        name,
        displayOrder: displayOrder || 0,
      },
    })

    return NextResponse.json({ volunteer }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create volunteer' },
      { status: 500 }
    )
  }
}