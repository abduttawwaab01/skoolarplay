import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiter'
import { examAttemptSchema } from '@/lib/validation-schemas'
import { ZodError } from 'zod'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { id } = await params

    // Rate limiting
    const rateLimit = await rateLimiter.checkLimit(
      `exam:${user.id}`,
      RATE_LIMITS.LESSON_COMPLETE_PER_MINUTE
    )

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many exam submissions. Please wait.', retryAfter: rateLimit.retryAfter },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 60) } }
      )
    }

    // Validate request body
    let body: { answers?: Record<string, string | string[]>; timeSpent?: number }
    try {
      body = await req.json()
      examAttemptSchema.parse({ examId: id, ...body })
    } catch (error: any) {
      if (error.name === 'ZodError' || error.constructor.name === 'ZodError') {
        return NextResponse.json(
          { error: error.errors?.[0]?.message || 'Validation failed' },
          { status: 400 }
        )
      }
      throw error
    }

    const { answers, timeSpent } = body as {
      answers: Record<string, string | string[]>
      timeSpent?: number
    }

    // Fetch exam with sections and questions (include correct answers)
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            questions: { orderBy: { order: 'asc' } },
          },
        },
      },
    })

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
    }

    // Check exam attempt limit from admin settings
    const settings = await db.adminSettings.findFirst()
    const maxAttempts = settings?.completionExamAttempts ?? 3

    const attemptCount = await db.examAttempt.count({
      where: { userId: user.id, examId: id },
    })

    if (attemptCount >= maxAttempts) {
      return NextResponse.json(
        {
          error: `Maximum attempts (${maxAttempts}) reached for this exam`,
          attemptsUsed: attemptCount,
          maxAttempts,
        },
        { status: 403 }
      )
    }

    // Cap timeSpent to exam duration
    const cappedTimeSpent = Math.min(timeSpent || 0, exam.duration * 60)

    // Calculate scores
    let totalScore = 0
    const sectionScores: Record<string, { score: number; total: number; percentage: number }> = {}

    for (const section of exam.sections) {
      let sectionScore = 0
      const sectionTotal = section.marks || section.questions.reduce((sum, q) => sum + q.marks, 0)

      for (const question of section.questions) {
        const userAnswer = answers[question.id]
        const correctAnswer = question.correctAnswer

        let isCorrect = false
        if (question.type === 'MCQ' || question.type === 'TRUE_FALSE') {
          isCorrect = userAnswer === correctAnswer
        } else if (question.type === 'FILL_BLANK') {
          const userAnswerStr = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
          isCorrect = userAnswerStr?.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
        } else {
          // ESSAY - cannot auto-grade, always 0
          isCorrect = false
        }

        if (isCorrect) {
          totalScore += question.marks
          sectionScore += question.marks
        }
      }

      sectionScores[section.id] = {
        score: sectionScore,
        total: sectionTotal,
        percentage: sectionTotal > 0 ? Math.round((sectionScore / sectionTotal) * 100) : 0,
      }
    }

    const percentage = exam.totalMarks > 0 ? Math.round((totalScore / exam.totalMarks) * 100) : 0
    const passed = percentage >= exam.passingMark

    // Save attempt
    const attempt = await db.examAttempt.create({
      data: {
        userId: user.id,
        examId: id,
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage,
        timeSpent: cappedTimeSpent,
        answers: JSON.stringify(answers),
        sectionScores: JSON.stringify(sectionScores),
        passed,
        completedAt: new Date(),
      },
    })

    // Check previous attempts to prevent XP/gem farming
    const previousAttempts = await db.examAttempt.findMany({
      where: { userId: user.id, examId: id },
      select: { percentage: true },
      orderBy: { percentage: 'desc' },
    })

    const bestPreviousPercentage = previousAttempts.length > 0 ? Math.max(...previousAttempts.map((a) => a.percentage)) : 0
    const isFirstAttempt = previousAttempts.length === 0
    const scoreImproved = percentage > bestPreviousPercentage

    // Only award XP/gems if this is the first attempt OR the score improved
    let xpEarned = 0
    let gemsEarned = 0

    if (isFirstAttempt || scoreImproved) {
      xpEarned = Math.round(percentage * 0.5) // Up to 50 XP for 100%
      gemsEarned = passed ? 5 : 2

      await db.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: xpEarned },
          gems: { increment: gemsEarned },
        },
      })
    }

    // Get all questions with explanations for review (exclude correctAnswer)
    const allQuestions = exam.sections.flatMap((section) =>
      section.questions.map((q) => ({
        id: q.id,
        sectionId: section.id,
        type: q.type,
        question: q.question,
        options: q.options,
        marks: q.marks,
        explanation: q.explanation,
      }))
    )

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage,
        passed,
        timeSpent: cappedTimeSpent,
        sectionScores,
        xpEarned,
        gemsEarned,
        questions: allQuestions,
      },
    })
  } catch (error) {
    console.error('Failed to submit exam:', error)
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 })
  }
}
