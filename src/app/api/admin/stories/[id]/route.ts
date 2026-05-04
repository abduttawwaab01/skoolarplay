import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const story = await db.storyLesson.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    })

    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    return NextResponse.json({ story })
  } catch (error: any) {
    console.error('Stories GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await req.json()

    const existingStory = await db.storyLesson.findUnique({
      where: { id },
      include: { lesson: true },
    })

    if (!existingStory) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    // Handle isActive toggle (goes through lesson)
    if (body.isActive !== undefined && existingStory.lesson) {
      await db.lesson.update({
        where: { id: existingStory.lesson.id },
        data: { isActive: body.isActive },
      })
    }

    // Handle full update
    if (body.title !== undefined) {
      const updateData: any = {}

      if (body.title !== undefined) updateData.title = body.title
      if (body.narrative !== undefined) updateData.narrative = body.narrative
      if (body.character !== undefined) updateData.character = body.character
      if (body.setting !== undefined) updateData.setting = body.setting
      if (body.mood !== undefined) updateData.mood = body.mood
      if (body.languageCode !== undefined) updateData.languageCode = body.languageCode
      if (body.readingLevel !== undefined) updateData.readingLevel = body.readingLevel
      if (body.estimatedReadingTime !== undefined) updateData.estimatedReadingTime = body.estimatedReadingTime
      if (body.ttsVoice !== undefined) updateData.ttsVoice = body.ttsVoice
      if (body.ttsSpeed !== undefined) updateData.ttsSpeed = body.ttsSpeed
      if (body.ttsLanguage !== undefined) updateData.ttsLanguage = body.ttsLanguage
      if (body.chapters !== undefined) updateData.chapters = body.chapters
      if (body.hasBranching !== undefined) updateData.hasBranching = body.hasBranching
      if (body.branchingPaths !== undefined) updateData.branchingPaths = body.branchingPaths
      if (body.totalQuestions !== undefined) updateData.totalQuestions = body.totalQuestions
      if (body.passingScore !== undefined) updateData.passingScore = body.passingScore
      if (body.xpReward !== undefined) updateData.xpReward = body.xpReward
      if (body.gemReward !== undefined) updateData.gemReward = body.gemReward

      // Also update the lesson if title or rewards changed
      if (existingStory.lesson && (body.title || body.xpReward || body.gemReward)) {
        await db.lesson.update({
          where: { id: existingStory.lesson.id },
          data: {
            ...(body.title ? { title: `Story: ${body.title}` } : {}),
            ...(body.xpReward !== undefined ? { xpReward: body.xpReward } : {}),
            ...(body.gemReward !== undefined ? { gemReward: body.gemReward } : {}),
          },
        })
      }

      const updatedStory = await db.storyLesson.update({
        where: { id },
        data: updateData,
        include: {
          lesson: {
            include: {
              module: {
                include: {
                  course: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ story: updatedStory })
    }

    return NextResponse.json({ story: existingStory })
  } catch (error: any) {
    console.error('Stories PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update story' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params

    const existingStory = await db.storyLesson.findUnique({
      where: { id },
      include: { lesson: true },
    })

    if (!existingStory) return NextResponse.json({ error: 'Story not found' }, { status: 404 })

    // Delete story first (lessonId is unique, so story must be deleted before lesson)
    await db.storyLesson.delete({ where: { id } })

    // Delete the associated lesson
    if (existingStory.lesson) {
      await db.lesson.delete({ where: { id: existingStory.lesson.id } })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Stories DELETE error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete story' }, { status: 500 })
  }
}
