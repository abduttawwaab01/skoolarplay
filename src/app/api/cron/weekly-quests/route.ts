import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CRON_SECRET = process.env.CRON_SECRET

const weeklyQuestTemplates = [
  // Learning quests
  { title: 'Complete 5 Lessons', description: 'Complete 5 lessons this week', type: 'LESSONS', requirement: 'complete_lessons', targetCount: 5, xpReward: 100, gemReward: 20 },
  { title: 'Complete 10 Lessons', description: 'Complete 10 lessons this week', type: 'LESSONS', requirement: 'complete_lessons', targetCount: 10, xpReward: 250, gemReward: 50 },
  { title: 'Complete 20 Lessons', description: 'Complete 20 lessons this week', type: 'LESSONS', requirement: 'complete_lessons', targetCount: 20, xpReward: 500, gemReward: 100 },
  // XP quests
  { title: 'Earn 500 XP', description: 'Earn 500 XP this week', type: 'XP', requirement: 'earn_xp', targetCount: 500, xpReward: 150, gemReward: 30 },
  { title: 'Earn 1000 XP', description: 'Earn 1000 XP this week', type: 'XP', requirement: 'earn_xp', targetCount: 1000, xpReward: 350, gemReward: 75 },
  // Streak quests
  { title: '3-Day Streak', description: 'Maintain a 3-day learning streak', type: 'STREAK', requirement: 'maintain_streak', targetCount: 3, xpReward: 100, gemReward: 25 },
  { title: '7-Day Streak', description: 'Maintain a 7-day learning streak', type: 'STREAK', requirement: 'maintain_streak', targetCount: 7, xpReward: 300, gemReward: 75 },
  // Practice quests  
  { title: 'Answer 50 Questions', description: 'Answer 50 questions correctly', type: 'PRACTICE', requirement: 'answer_correctly', targetCount: 50, xpReward: 150, gemReward: 30 },
  { title: 'Perfect Score 3 Times', description: 'Get perfect score in 3 lessons', type: 'PERFECT', requirement: 'perfect_score', targetCount: 3, xpReward: 200, gemReward: 50 },
  // Vocabulary quests
  { title: 'Learn 20 Words', description: 'Learn 20 new vocabulary words', type: 'VOCABULARY', requirement: 'learn_words', targetCount: 20, xpReward: 100, gemReward: 20 },
]

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(now.setDate(diff))
}

function getWeekEnd() {
  const weekStart = getWeekStart()
  return new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')

  if (!CRON_SECRET) {
    console.error('[Weekly Quests] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || querySecret === CRON_SECRET
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const weekStart = getWeekStart()
    const weekEnd = getWeekEnd()
    
    // Check if quests already exist for this week
    const existingQuests = await db.quest.findMany({
      where: {
        type: 'WEEKLY',
        startDate: { gte: weekStart.toISOString().split('T')[0] },
      },
    })

    if (existingQuests.length > 0) {
      return NextResponse.json({
        message: 'Weekly quests already exist for this week',
        questsCreated: 0,
      })
    }

    // Select 5 random quest templates
    const shuffled = [...weeklyQuestTemplates].sort(() => Math.random() - 0.5)
    const selectedTemplates = shuffled.slice(0, 5)

    const createdQuests = await db.$transaction(
      selectedTemplates.map(template =>
        db.quest.create({
          data: {
            title: template.title,
            description: template.description,
            type: 'WEEKLY',
            requirement: template.requirement,
            targetCount: template.targetCount,
            xpReward: template.xpReward,
            gemReward: template.gemReward,
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString(),
            isActive: true,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Created ${createdQuests.length} weekly quests`,
      questsCreated: createdQuests.length,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    })
  } catch (error) {
    console.error('[Weekly Quests] Error:', error)
    return NextResponse.json({ error: 'Failed to generate weekly quests' }, { status: 500 })
  }
}