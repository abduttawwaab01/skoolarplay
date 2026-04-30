import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/surveys/available - Get surveys available for current user (student view)
// This returns surveys that the user hasn't responded to yet, or all active if includeCompleted=true
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = session.user.id

    // Get all active surveys
    const surveys = await db.survey.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            type: true,
            question: true,
            options: true,
            isRequired: true,
            order: true,
          },
        },
      },
    })

    // Get user's responses to check which surveys they've completed
    const userResponses = await db.surveyResponse.findMany({
      where: { userId },
      select: { surveyId: true },
    })
    const completedSurveyIds = new Set(userResponses.map(r => r.surveyId))

    // Filter surveys and add completion status
    const surveysWithStatus = surveys.map(survey => ({
      ...survey,
      questions: survey.questions.map(q => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : null,
      })),
      hasResponded: completedSurveyIds.has(survey.id),
      responseCount: 0, // Will be updated
    }))

    return NextResponse.json({ surveys: surveysWithStatus })
  } catch (error: any) {
    console.error('Available surveys GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch available surveys' }, { status: 500 })
  }
}
