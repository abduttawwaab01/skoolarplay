import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// POST /api/admin/feed/reports/[reportId]/resolve - Resolve a report
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportId } = await params
    const body = await req.json()
    const { action = 'RESOLVED' } = body

    const status = action === 'DISMISSED' ? 'DISMISSED' : 'RESOLVED'

    const report = await db.feedReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewedBy: admin.id,
        resolvedAt: new Date(),
      },
      include: {
        post: true,
      },
    })

    if (status === 'RESOLVED') {
      await db.feedPost.update({
        where: { id: report.postId },
        data: { isHidden: true },
      })
    }

    return NextResponse.json({ success: true, report })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to resolve report' },
      { status: 500 }
    )
  }
}
