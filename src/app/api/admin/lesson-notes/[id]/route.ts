import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { db } from '@/lib/db'

// PUT /api/admin/lesson-notes/[id] - Update lesson note
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const updateData: any = {}

    // Basic fields
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl || null
    if (body.order !== undefined) updateData.order = body.order
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    // Quiz fields
    if (body.hasQuiz !== undefined) updateData.hasQuiz = body.hasQuiz
    if (body.quizTitle !== undefined) updateData.quizTitle = body.quizTitle || null
    if (body.quizQuestions !== undefined) updateData.quizQuestions = body.quizQuestions ? JSON.stringify(body.quizQuestions) : null
    if (body.quizPassingScore !== undefined) updateData.quizPassingScore = body.quizPassingScore
    if (body.quizTimeLimit !== undefined) updateData.quizTimeLimit = body.quizTimeLimit || null
    if (body.quizRequireFullscreen !== undefined) updateData.quizRequireFullscreen = body.quizRequireFullscreen
    if (body.quizPreventTabSwitch !== undefined) updateData.quizPreventTabSwitch = body.quizPreventTabSwitch
    if (body.quizPreventCopyPaste !== undefined) updateData.quizPreventCopyPaste = body.quizPreventCopyPaste
    if (body.quizShuffleQuestions !== undefined) updateData.quizShuffleQuestions = body.quizShuffleQuestions
    if (body.quizShuffleOptions !== undefined) updateData.quizShuffleOptions = body.quizShuffleOptions
    if (body.quizXpReward !== undefined) updateData.quizXpReward = body.quizXpReward
    if (body.quizGemReward !== undefined) updateData.quizGemReward = body.quizGemReward

    const note = await db.lessonNote.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ note })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update lesson note' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/lesson-notes/[id] - Delete lesson note
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await db.lessonNote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete lesson note' },
      { status: 500 }
    )
  }
}