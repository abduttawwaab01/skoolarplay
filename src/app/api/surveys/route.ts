import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/surveys - List all surveys (admin)
// GET /api/surveys?page=1&limit=20 - Pagination support
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const includeQuestions = searchParams.get('include') === 'questions'
    const includeResponses = searchParams.get('include') === 'responses'

    const [surveys, total] = await Promise.all([
      db.survey.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true,
              responses: true,
            },
          },
          ...(includeQuestions && {
            questions: {
              orderBy: { order: 'asc' },
            },
          }),
          ...(includeResponses && {
            responses: {
              take: 10,
              orderBy: { submittedAt: 'desc' },
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
          }),
        },
      }),
      db.survey.count(),
    ])

    return NextResponse.json({
      surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Surveys GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch surveys' }, { status: 500 })
  }
}

// POST /api/surveys - Create a new survey (admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, triggerType, triggerConfig, isActive, questions } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const validTriggers = ['COURSE_COMPLETION', 'MANUAL', 'SCHEDULED']
    const finalTriggerType = validTriggers.includes(triggerType) ? triggerType : 'COURSE_COMPLETION'

    // Create survey with questions in a transaction
    const survey = await db.$transaction(async (tx) => {
      const newSurvey = await tx.survey.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          triggerType: finalTriggerType,
          triggerConfig: triggerConfig ? JSON.stringify(triggerConfig) : null,
          isActive: isActive !== false,
        },
      })

      // Add questions if provided
      if (questions && Array.isArray(questions) && questions.length > 0) {
        await tx.surveyQuestion.createMany({
          data: questions.map((q: any, index: number) => ({
            surveyId: newSurvey.id,
            type: q.type || 'TEXT',
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            isRequired: q.isRequired !== false,
            order: q.order ?? index,
          })),
        })
      }

      // Fetch created survey with questions
      return tx.survey.findUnique({
        where: { id: newSurvey.id },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      })
    })

    return NextResponse.json({ survey }, { status: 201 })
  } catch (error: any) {
    console.error('Surveys POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create survey' }, { status: 500 })
  }
}
