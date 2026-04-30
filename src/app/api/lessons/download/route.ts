import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function isPremiumActive(isPremium: boolean, premiumExpiresAt: string | null | undefined): boolean {
  if (!isPremium) return false
  if (!premiumExpiresAt) return true // Lifetime
  return new Date(premiumExpiresAt) > new Date()
}

async function buildLessonData(lessonId: string) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              category: { select: { name: true } },
              teacher: { select: { name: true } },
            },
          },
        },
      },
      questions: {
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          correctAnswer: true,
          hint: true,
          explanation: true,
          points: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      videoContent: {
        select: {
          title: true,
          url: true,
          duration: true,
          order: true,
        },
        orderBy: { order: 'asc' },
      },
      storyLesson: {
        select: {
          title: true,
          narrative: true,
          character: true,
          setting: true,
          mood: true,
          choices: true,
        },
      },
    },
  })

  if (!lesson) return null

  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    order: lesson.order,
    xpReward: lesson.xpReward,
    gemReward: lesson.gemReward,
    module: {
      title: lesson.module.title,
      order: lesson.module.order,
      course: {
        title: lesson.module.course.title,
        description: lesson.module.course.description,
        difficulty: lesson.module.course.difficulty,
        category: lesson.module.course.category?.name || null,
        teacher: lesson.module.course.teacher?.name || null,
      },
    },
    questions: lesson.questions.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswer: JSON.parse(q.correctAnswer),
    })),
    videoContent: lesson.videoContent,
    storyLesson: lesson.storyLesson ? {
      ...lesson.storyLesson,
      choices: lesson.storyLesson.choices ? JSON.parse(lesson.storyLesson.choices) : null,
    } : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const isPremium = isPremiumActive(user.isPremium, user.premiumExpiresAt)

    if (!isPremium) {
      // Check if DOWNLOAD_LESSONS is in unlocked features
      let features: string[] = []
      try {
        features = JSON.parse(user.unlockedFeatures || '[]')
      } catch {}

      if (!features.includes('DOWNLOAD_LESSONS')) {
        return NextResponse.json(
          { error: 'Premium subscription required for downloads. Upgrade to SkoolarPlay+ to download lessons.' },
          { status: 403 }
        )
      }
    }

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get('lessonId')

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    const lessonData = await buildLessonData(lessonId)
    if (!lessonData) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const jsonStr = JSON.stringify(lessonData, null, 2)
    const filename = `${lessonData.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`

    return new NextResponse(jsonStr, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Lesson download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download lesson' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    const isPremium = isPremiumActive(user.isPremium, user.premiumExpiresAt)

    if (!isPremium) {
      let features: string[] = []
      try {
        features = JSON.parse(user.unlockedFeatures || '[]')
      } catch {}

      if (!features.includes('DOWNLOAD_LESSONS')) {
        return NextResponse.json(
          { error: 'Premium subscription required for downloads. Upgrade to SkoolarPlay+ to download lessons.' },
          { status: 403 }
        )
      }
    }

    const body = await req.json()
    const { lessonIds } = body

    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return NextResponse.json({ error: 'lessonIds must be a non-empty array' }, { status: 400 })
    }

    if (lessonIds.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 lessons per download' }, { status: 400 })
    }

    const lessons: any[] = []
    for (const lessonId of lessonIds) {
      const data = await buildLessonData(lessonId)
      if (data) lessons.push(data)
    }

    if (lessons.length === 0) {
      return NextResponse.json({ error: 'No valid lessons found' }, { status: 404 })
    }

    const jsonStr = JSON.stringify({ lessons, downloadedAt: new Date().toISOString(), totalLessons: lessons.length }, null, 2)
    const filename = `skoolarplay_lessons_${Date.now()}.json`

    return new NextResponse(jsonStr, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Bulk lesson download error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to download lessons' },
      { status: 500 }
    )
  }
}
