import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/surveys/[id]/respond - Submit survey response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: surveyId } = await params
    const userId = session.user.id

    // Check if survey exists and is active
    const survey = await db.survey.findUnique({
      where: { id: surveyId, isActive: true },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 })
    }

    const body = await req.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 })
    }

    // Validate required questions
    const missingRequired: string[] = []
    for (const question of survey.questions) {
      if (question.isRequired && !answers[question.id]) {
        missingRequired.push(question.question)
      }
    }

    if (missingRequired.length > 0) {
      return NextResponse.json({
        error: 'Please answer all required questions',
        missing: missingRequired,
      }, { status: 400 })
    }

    // Check if user already responded
    const existingResponse = await db.surveyResponse.findUnique({
      where: {
        surveyId_userId: { surveyId, userId },
      },
    })

    if (existingResponse) {
      return NextResponse.json({
        error: 'You have already responded to this survey',
        responseId: existingResponse.id,
      }, { status: 409 })
    }

    // Create response with answers in transaction
    const response = await db.$transaction(async (tx) => {
      // Create the response record
      const newResponse = await tx.surveyResponse.create({
        data: {
          surveyId,
          userId,
        },
      })

      // Create all answers
      const answerData = Object.entries(answers).map(([questionId, answer]) => {
        const question = survey.questions.find(q => q.id === questionId)
        const answerValue = answer as string | number | string[]
        
        return {
          responseId: newResponse.id,
          questionId,
          answer: JSON.stringify(answerValue),
          answerText: typeof answerValue === 'string' ? answerValue : null,
        }
      })

      await tx.surveyAnswer.createMany({
        data: answerData,
      })

      // Return complete response
      return tx.surveyResponse.findUnique({
        where: { id: newResponse.id },
        include: {
          answers: true,
          survey: {
            select: { title: true },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      response,
      message: 'Thank you for your feedback!',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Survey respond POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit response' }, { status: 500 })
  }
}

// GET /api/surveys/[id]/respond - Get user's response for this survey (if exists)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: surveyId } = await params
    const userId = session.user.id

    const response = await db.surveyResponse.findUnique({
      where: {
        surveyId_userId: { surveyId, userId },
      },
      include: {
        answers: true,
        survey: {
          select: { title: true },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ hasResponded: false })
    }

    return NextResponse.json({
      hasResponded: true,
      response,
    })
  } catch (error: any) {
    console.error('Survey respond GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to check response status' }, { status: 500 })
  }
}
