import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const subject = searchParams.get('subject')

    const where: Record<string, unknown> = {
      isActive: true,
      isPublished: true,
    }
    if (type) where.type = type
    if (subject) where.subject = subject

    const exams = await db.exam.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { attempts: { where: { userId: user.id } } },
        },
      },
    })

    // Get best scores for each exam
    const examIds = exams.map((e) => e.id)
    const attempts = await db.examAttempt.findMany({
      where: { userId: user.id, examId: { in: examIds } },
      orderBy: { percentage: 'desc' },
    })

    const bestAttempts = new Map<string, typeof attempts[0]>()
    for (const a of attempts) {
      const existing = bestAttempts.get(a.examId)
      if (!existing || a.percentage > existing.percentage) {
        bestAttempts.set(a.examId, a)
      }
    }

    const result = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      subject: exam.subject,
      year: exam.year,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      totalMarks: exam.totalMarks,
      passingMark: exam.passingMark,
      attemptsCount: exam._count.attempts,
      bestScore: bestAttempts.get(exam.id)
        ? {
            score: bestAttempts.get(exam.id)!.score,
            total: bestAttempts.get(exam.id)!.totalMarks,
            percentage: bestAttempts.get(exam.id)!.percentage,
            passed: bestAttempts.get(exam.id)!.passed,
          }
        : null,
    }))

    return NextResponse.json({ exams: result })
  } catch (error) {
    console.error('Failed to fetch exams:', error)
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 })
  }
}
