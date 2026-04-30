import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    // Check if today's challenge already exists
    const existingChallenge = await db.dailyChallenge.findFirst({
      where: {
        date: today.toISOString().split('T')[0],
        isActive: true,
      },
    })

    if (existingChallenge) {
      return NextResponse.json({
        success: true,
        message: "Today's challenge already exists",
        challenge: {
          id: existingChallenge.id,
          title: existingChallenge.title,
          date: existingChallenge.date,
        },
      })
    }

    // Get a random lesson for today's challenge
    const lessons = await db.lesson.findMany({
      where: {
        isActive: true,
        questions: { some: {} },
      },
      select: {
        id: true,
        title: true,
        module: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
      take: 20,
    })

    if (lessons.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No lessons available for daily challenge',
      })
    }

    // Pick a random lesson
    const randomLesson = lessons[Math.floor(Math.random() * lessons.length)]

    // Get the questions for this lesson
    const questions = await db.question.findMany({
      where: { lessonId: randomLesson.id },
      select: {
        id: true,
        type: true,
      },
      take: 5,
    })

    // Generate the challenge
    const challenge = await db.dailyChallenge.create({
      data: {
        title: `Daily Challenge: ${randomLesson.module?.course?.title || 'General Knowledge'}`,
        description: `Test your knowledge with today's challenge! Complete 5 questions from ${randomLesson.title}.`,
        type: 'QUIZ',
        xpReward: 50,
        gemReward: 10,
        date: today.toISOString().split('T')[0],
        isActive: true,
      } as any,
    })

    // Deactivate old challenges
    await db.dailyChallenge.updateMany({
      where: {
        date: { lt: today.toISOString().split('T')[0] },
        isActive: true,
      },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      message: "Today's challenge created",
      challenge: {
        id: challenge.id,
        title: challenge.title,
        date: challenge.date,
        xpReward: challenge.xpReward,
        gemReward: challenge.gemReward,
      },
    })
  } catch (error) {
    console.error('Daily challenge cron error:', error)
    return NextResponse.json({ error: 'Failed to create daily challenge' }, { status: 500 })
  }
}
