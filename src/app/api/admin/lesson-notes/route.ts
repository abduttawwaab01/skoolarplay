import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// GET /api/admin/lesson-notes - Get all lesson notes
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const moduleId = searchParams.get('moduleId')
    const lessonId = searchParams.get('lessonId')
    const hasQuiz = searchParams.get('hasQuiz')

    const where: any = { isActive: true }

    if (lessonId) {
      where.lessonId = lessonId
    } else if (moduleId) {
      where.lesson = { moduleId }
    } else if (courseId) {
      where.lesson = { module: { courseId } }
    }

    if (hasQuiz === 'true') where.hasQuiz = true
    if (hasQuiz === 'false') where.hasQuiz = false

    const notes = await db.lessonNote.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        lesson: {
          select: { id: true, title: true, type: true },
          include: {
            module: {
              select: { id: true, title: true },
              include: {
                course: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson notes' },
      { status: 500 }
    )
  }
}

// POST /api/admin/lesson-notes - Create lesson note
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      lessonId,
      title,
      content,
      audioUrl,
      order,
      hasQuiz,
      quizTitle,
      quizQuestions,
      quizPassingScore,
      quizTimeLimit,
      quizRequireFullscreen,
      quizPreventTabSwitch,
      quizPreventCopyPaste,
      quizShuffleQuestions,
      quizShuffleOptions,
      quizXpReward,
      quizGemReward,
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const note = await db.lessonNote.create({
      data: {
        lessonId: lessonId || null,
        title,
        content,
        audioUrl: audioUrl || null,
        order: order || 0,
        hasQuiz: hasQuiz || false,
        quizTitle: quizTitle || null,
        quizQuestions: quizQuestions ? JSON.stringify(quizQuestions) : undefined,
        quizPassingScore: quizPassingScore || 50,
        quizTimeLimit: quizTimeLimit || null,
        quizRequireFullscreen: quizRequireFullscreen || false,
        quizPreventTabSwitch: quizPreventTabSwitch || false,
        quizPreventCopyPaste: quizPreventCopyPaste || false,
        quizShuffleQuestions: quizShuffleQuestions || false,
        quizShuffleOptions: quizShuffleOptions || false,
        quizXpReward: quizXpReward ?? 10,
        quizGemReward: quizGemReward ?? 1,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create lesson note' },
      { status: 500 }
    )
  }
}