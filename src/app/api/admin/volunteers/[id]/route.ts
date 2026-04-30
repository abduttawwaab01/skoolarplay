import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// PUT /api/admin/volunteers/[id] - Update volunteer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, displayOrder, isActive } = await req.json()

    const volunteer = await db.volunteer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    })

    return NextResponse.json({ volunteer })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update volunteer' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/volunteers/[id] - Delete volunteer
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await db.volunteer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete volunteer' },
      { status: 500 }
    )
  }
}