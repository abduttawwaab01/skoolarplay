import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')
    const readingLevel = searchParams.get('readingLevel')

    const where: any = {}
    if (readingLevel) where.readingLevel = readingLevel
    if (courseId) {
      where.lesson = {
        module: { courseId },
      }
    }

    const stories = await db.storyLesson.findMany({
      where,
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
      orderBy: { id: 'desc' },
    })

    return NextResponse.json({ stories })
  } catch (error: any) {
    console.error('Stories GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const {
      lessonId,
      title,
      narrative,
      character,
      setting,
      mood,
      languageCode,
      readingLevel,
      estimatedReadingTime,
      ttsVoice,
      ttsSpeed,
      ttsLanguage,
      chapters,
      hasBranching,
      branchingPaths,
      totalQuestions,
      passingScore,
      xpReward,
      gemReward,
    } = body

    if (!title || !narrative) {
      return NextResponse.json({ error: 'Title and narrative are required' }, { status: 400 })
    }

    let storyLesson
    if (lessonId) {
      storyLesson = await db.storyLesson.create({
        data: {
          lessonId,
          title,
          narrative,
          character,
          setting,
          mood,
          languageCode,
          readingLevel: readingLevel || 'BEGINNER',
          estimatedReadingTime: estimatedReadingTime || 5,
          ttsVoice,
          ttsSpeed: ttsSpeed || 1.0,
          ttsLanguage,
          chapters,
          hasBranching: hasBranching || false,
          branchingPaths,
          totalQuestions: totalQuestions || 0,
          passingScore: passingScore || 60,
          xpReward: xpReward || 25,
          gemReward: gemReward || 5,
        },
      })
    } else {
      // Create lesson and story together
      const lesson = await db.lesson.create({
        data: {
          title: `Story: ${title}`,
          moduleId: '',
          type: 'READING',
          order: 0,
          xpReward: xpReward || 25,
          gemReward: gemReward || 5,
          isActive: true,
        },
      })

      storyLesson = await db.storyLesson.create({
        data: {
          lessonId: lesson.id,
          title,
          narrative,
          character,
          setting,
          mood,
          languageCode,
          readingLevel: readingLevel || 'BEGINNER',
          estimatedReadingTime: estimatedReadingTime || 5,
          ttsVoice,
          ttsSpeed: ttsSpeed || 1.0,
          ttsLanguage,
          chapters,
          hasBranching: hasBranching || false,
          branchingPaths,
          totalQuestions: totalQuestions || 0,
          passingScore: passingScore || 60,
          xpReward: xpReward || 25,
          gemReward: gemReward || 5,
        },
      })
    }

    return NextResponse.json({ storyLesson }, { status: 201 })
  } catch (error: any) {
    console.error('Stories POST error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create story' }, { status: 500 })
  }
}
