import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// GET /api/admin/feed/reports - Get pending reports
export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await db.feedReport.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ reports })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

// POST handler moved to /api/admin/feed/reports/[reportId]/resolve
