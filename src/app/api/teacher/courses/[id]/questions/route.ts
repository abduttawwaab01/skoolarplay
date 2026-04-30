import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

async function verifyOwnership(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  const user = session.user as any
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { teacherId: true },
  })
  if (!course || course.teacherId !== user.id) {
    return { error: NextResponse.json({ error: 'Course not found or not yours' }, { status: 404 }), user }
  }
  return { error: null, user }
}

// GET - List questions for a lesson
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 })
    }

    // Verify lesson belongs to this course
    const lessonData = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    })
    if (!lessonData || lessonData.module.courseId !== id) {
      return NextResponse.json({ error: 'Lesson not found or does not belong to this course' }, { status: 404 })
    }

    const questions = await db.question.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

// POST - Create a single question (or bulk via array)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const body = await request.json()

    // Support bulk import (array of questions)
    if (Array.isArray(body.questions)) {
      const results: any[] = []
      for (const q of body.questions) {
        if (!q.lessonId || !q.question || !q.correctAnswer) {
          continue
        }
        // Verify lesson belongs to this course
        const lessonData = await db.lesson.findUnique({
          where: { id: q.lessonId },
          include: { module: { select: { courseId: true } } },
        })
        if (!lessonData || lessonData.module.courseId !== id) {
          continue
        }

        const created = await db.question.create({
          data: {
            lessonId: q.lessonId,
            type: q.type || 'MCQ',
            question: q.question,
            hint: q.hint || null,
            explanation: q.explanation || null,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer),
            points: q.points || 10,
            order: q.order || 0,
          },
        })
        results.push(created)
      }
      return NextResponse.json({ questions: results, created: results.length }, { status: 201 })
    }

    // Single question creation
    const { lessonId, type, question, hint, explanation, options, correctAnswer, points, order } = body

    if (!lessonId || !question || !correctAnswer) {
      return NextResponse.json(
        { error: 'Lesson ID, question text, and correct answer are required' },
        { status: 400 }
      )
    }

    // Verify lesson belongs to this course
    const lessonData = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    })
    if (!lessonData || lessonData.module.courseId !== id) {
      return NextResponse.json({ error: 'Lesson not found or does not belong to this course' }, { status: 404 })
    }

    const createdQuestion = await db.question.create({
      data: {
        lessonId,
        type: type || 'MCQ',
        question,
        hint: hint || null,
        explanation: explanation || null,
        options: options ? JSON.stringify(options) : null,
        correctAnswer: typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer),
        points: points || 10,
        order: order || 0,
      },
    })

    return NextResponse.json({ question: createdQuestion }, { status: 201 })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}

// DELETE - Delete a question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await verifyOwnership(id)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Verify question belongs to this course
    const questionData = await db.question.findUnique({
      where: { id: questionId },
      include: {
        lesson: {
          include: { module: { select: { courseId: true } } },
        },
      },
    })
    if (!questionData || questionData.lesson.module.courseId !== id) {
      return NextResponse.json({ error: 'Question not found or does not belong to this course' }, { status: 404 })
    }

    await db.question.delete({ where: { id: questionId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
