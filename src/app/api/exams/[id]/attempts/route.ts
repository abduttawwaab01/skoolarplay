import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    const attempts = await db.examAttempt.findMany({
      where: { userId: user.id, examId: id, completedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        passed: a.passed,
        timeSpent: a.timeSpent,
        completedAt: a.completedAt,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}
