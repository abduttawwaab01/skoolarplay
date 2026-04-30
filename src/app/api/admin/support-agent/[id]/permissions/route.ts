import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// PUT /api/admin/support-agent/[id]/permissions - Update agent permissions
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { permissions } = await req.json()

    // Verify user exists and is a support agent
    const agent = await db.user.findUnique({
      where: { id },
      select: { role: true },
    })

    if (!agent || agent.role !== 'SUPPORT') {
      return NextResponse.json({ error: 'Support agent not found' }, { status: 404 })
    }

    const updated = await db.user.update({
      where: { id },
      data: { delegatedPermissions: JSON.stringify(permissions) },
      select: { id: true, name: true, delegatedPermissions: true },
    })

    return NextResponse.json({ 
      success: true, 
      agent: { ...updated, delegatedPermissions: undefined } 
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update permissions' },
      { status: 500 }
    )
  }
}