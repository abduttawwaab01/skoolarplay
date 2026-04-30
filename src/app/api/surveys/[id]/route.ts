import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT /api/surveys/[id] - Update a survey (admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: surveyId } = await params
    const body = await req.json()
    const { title, description, triggerType, triggerConfig, isActive, questions } = body

    const survey = await db.survey.findUnique({
      where: { id: surveyId },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    const updatedSurvey = await db.$transaction(async (tx) => {
      // Update survey basic info
      const updated = await tx.survey.update({
        where: { id: surveyId },
        data: {
          ...(title && { title: title.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(triggerType && { triggerType }),
          ...(triggerConfig && { triggerConfig: JSON.stringify(triggerConfig) }),
          ...(isActive !== undefined && { isActive }),
        },
      })

      // Update questions if provided
      if (questions && Array.isArray(questions)) {
        // Delete existing questions
        await tx.surveyQuestion.deleteMany({ where: { surveyId } })
        
        // Create new questions
        await tx.surveyQuestion.createMany({
          data: questions.map((q: any, index: number) => ({
            surveyId,
            type: q.type || 'TEXT',
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            isRequired: q.isRequired !== false,
            order: q.order ?? index,
          })),
        })
      }

      return tx.survey.findUnique({
        where: { id: surveyId },
        include: {
          questions: { orderBy: { order: 'asc' } },
        },
      })
    })

    return NextResponse.json({ survey: updatedSurvey })
  } catch (error: any) {
    console.error('Survey PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update survey' }, { status: 500 })
  }
}

// DELETE /api/surveys/[id] - Delete a survey (admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: surveyId } = await params

    const survey = await db.survey.findUnique({
      where: { id: surveyId },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    // Delete all related data (cascade should handle this)
    await db.survey.delete({
      where: { id: surveyId },
    })

    return NextResponse.json({ success: true, message: 'Survey deleted' })
  } catch (error: any) {
    console.error('Survey DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete survey' }, { status: 500 })
  }
}

// GET /api/surveys/[id] - Get a single survey
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params

    const survey = await db.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    })

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json({ survey })
  } catch (error: any) {
    console.error('Survey GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch survey' }, { status: 500 })
  }
}
