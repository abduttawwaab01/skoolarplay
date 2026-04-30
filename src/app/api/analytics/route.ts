import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get lesson progress with course info
    const lessonProgress = await db.lessonProgress.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    })

    // Build subject performance map
    const subjectMap = new Map<string, {
      name: string
      scores: number[]
      completed: number
      total: number
      icon: string | null
      color: string | null
    }>()

    // Group by course (as "subject")
    for (const lp of lessonProgress) {
      const course = lp.lesson.module?.course
      if (!course) continue

      const key = course.id
      const existing = subjectMap.get(key) || {
        name: course.title,
        scores: [],
        completed: 0,
        total: 0,
        icon: course.icon,
        color: course.color,
      }

      existing.total += 1
      if (lp.completed && lp.bestScore !== null) {
        existing.completed += 1
        existing.scores.push(lp.bestScore)
      }

      subjectMap.set(key, existing)
    }

    const subjectPerformance = Array.from(subjectMap.values()).map((s) => ({
      ...s,
      averageScore: s.scores.length > 0
        ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
        : 0,
      recentScores: s.scores.slice(-5),
    }))

    // Strengths & Weaknesses
    const sorted = [...subjectPerformance].sort((a, b) => b.averageScore - a.averageScore)
    const strengths = sorted.filter((s) => s.completed > 0).slice(0, 3)
    const weaknesses = sorted.filter((s) => s.completed > 0).reverse().slice(0, 3)

    // Predicted WAEC grades per subject
    function getWaecGrade(percentage: number): string {
      if (percentage >= 75) return 'A1'
      if (percentage >= 70) return 'B2'
      if (percentage >= 65) return 'B3'
      if (percentage >= 60) return 'C4'
      if (percentage >= 55) return 'C5'
      if (percentage >= 50) return 'C6'
      if (percentage >= 45) return 'D7'
      if (percentage >= 40) return 'E8'
      return 'F9'
    }

    const predictedGrades = subjectPerformance.map((s) => ({
      subject: s.name,
      grade: getWaecGrade(s.averageScore),
      score: s.averageScore,
      confidence: Math.min(100, s.scores.length * 20),
    }))

    // Overall predicted score
    const overallAverage = subjectPerformance.length > 0
      ? Math.round(subjectPerformance.reduce((sum, s) => sum + s.averageScore, 0) / subjectPerformance.length)
      : 0

    // Learning streak (using lesson progress completedAt dates)
    const completedDates = lessonProgress
      .filter((lp) => lp.completedAt)
      .map((lp) => lp.completedAt!.toISOString().split('T')[0])

    const uniqueDates = [...new Set(completedDates)].sort().reverse()

    // Build activity calendar (last 12 weeks)
    const today = new Date()
    const activityMap = new Map<string, number>()
    for (const date of uniqueDates) {
      activityMap.set(date, (activityMap.get(date) || 0) + 1)
    }

    const calendar: { date: string; count: number }[] = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      calendar.push({
        date: dateStr,
        count: activityMap.get(dateStr) || 0,
      })
    }

    // Performance trend (last 30 days)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentProgress = lessonProgress
      .filter((lp) => lp.completedAt && lp.completedAt >= thirtyDaysAgo && lp.bestScore !== null)
      .sort((a, b) => (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0))

    const performanceTrend = recentProgress.map((lp) => ({
      date: lp.completedAt!.toISOString().split('T')[0],
      score: lp.bestScore!,
    }))

    // Exam attempts summary
    const examAttempts = await db.examAttempt.findMany({
      where: { userId: user.id, completedAt: { not: null } },
      include: { exam: true },
      orderBy: { createdAt: 'desc' },
    })

    const examSummary = {
      totalExams: examAttempts.length,
      passedExams: examAttempts.filter((a) => a.passed).length,
      averageScore: examAttempts.length > 0
        ? Math.round(examAttempts.reduce((sum, a) => sum + a.percentage, 0) / examAttempts.length)
        : 0,
      bestScore: examAttempts.length > 0
        ? Math.max(...examAttempts.map((a) => a.percentage))
        : 0,
    }

    return NextResponse.json({
      overall: {
        totalXP: user.xp,
        level: user.level,
        streak: user.streak,
        gems: user.gems,
        totalCourses: subjectPerformance.length,
        averageScore: overallAverage,
        totalLessonsCompleted: lessonProgress.filter((lp) => lp.completed).length,
      },
      subjectPerformance,
      strengths,
      weaknesses,
      predictedGrades,
      overallAverage,
      calendar,
      performanceTrend,
      examSummary,
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
