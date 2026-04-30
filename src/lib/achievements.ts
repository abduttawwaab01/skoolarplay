import { db } from '@/lib/db'
import { sendAchievementEmail } from './email-helpers'

export type AchievementCondition = 
  | { type: 'LESSONS_COMPLETED'; count: number }
  | { type: 'LESSONS_IN_COURSE'; courseId: string; count: number }
  | { type: 'SCORE_ACHIEVED'; score: number }
  | { type: 'STREAK_DAYS'; days: number }
  | { type: 'GEM_AMOUNT'; amount: number }
  | { type: 'XP_AMOUNT'; amount: number }
  | { type: 'COURSE_COMPLETED'; courseId: string }
  | { type: 'Vocab_Set_COMPLETED'; vocabSetId: string }

export interface AchievementWithRewards {
  id: string
  key: string
  title: string
  description: string | null
  icon: string | null
  xpReward: number
  gemReward: number
  condition: string | null
}

export async function getAllAchievements(): Promise<AchievementWithRewards[]> {
  const achievements = await db.achievement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  })
  return achievements
}

export async function getUserAchievements(userId: string) {
  const achievements = await db.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
  })
  return achievements
}

export async function checkAndAwardAchievement(
  userId: string,
  achievementId: string
): Promise<{ awarded: boolean; xpReward: number; gemReward: number }> {
  const achievement = await db.achievement.findUnique({
    where: { id: achievementId },
  })
  
  if (!achievement) {
    return { awarded: false, xpReward: 0, gemReward: 0 }
  }
  
  return awardAchievement(userId, achievement)
}

export async function awardAchievement(
  userId: string,
  achievement: AchievementWithRewards
): Promise<{ awarded: boolean; xpReward: number; gemReward: number }> {
  const existing = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  })
  
  if (existing) {
    return { awarded: false, xpReward: 0, gemReward: 0 }
  }
  
  await db.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  })
  
  let xpAwarded = 0
  let gemsAwarded = 0
  
  if (achievement.xpReward > 0) {
    await db.user.update({
      where: { id: userId },
      data: { xp: { increment: achievement.xpReward } },
    })
    xpAwarded = achievement.xpReward
  }
  
  if (achievement.gemReward > 0) {
    await db.user.update({
      where: { id: userId },
      data: { gems: { increment: achievement.gemReward } },
    })
    
    await db.gemTransaction.create({
      data: {
        userId,
        amount: achievement.gemReward,
        type: 'ACHIEVEMENT',
        source: 'achievement',
        description: `Earned achievement: ${achievement.title}`,
        relatedId: achievement.id,
      },
    })
    gemsAwarded = achievement.gemReward
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  })

  if (user?.email) {
    sendAchievementEmail(userId, user.email, user.name, {
      title: achievement.title,
      description: achievement.description || '',
      xpReward: xpAwarded,
      gemReward: gemsAwarded,
    }).catch(err => console.error('[Achievement Email] Failed to send:', err))
  }
  
  return { awarded: true, xpReward: xpAwarded, gemReward: gemsAwarded }
}

export async function awardAchievementByKey(
  userId: string,
  achievementKey: string
): Promise<{ awarded: boolean; xpReward: number; gemReward: number }> {
  const achievement = await db.achievement.findUnique({
    where: { key: achievementKey },
  })
  
  if (!achievement) {
    return { awarded: false, xpReward: 0, gemReward: 0 }
  }
  
  return awardAchievement(userId, achievement)
}

export function parseCondition(conditionStr: string | null): AchievementCondition | null {
  if (!conditionStr) return null
  try {
    return JSON.parse(conditionStr) as AchievementCondition
  } catch {
    return null
  }
}

export async function evaluateCondition(
  userId: string,
  condition: AchievementCondition
): Promise<boolean> {
  switch (condition.type) {
    case 'LESSONS_COMPLETED': {
      const count = await db.lessonProgress.count({
        where: { userId, completed: true },
      })
      return count >= condition.count
    }
    
    case 'LESSONS_IN_COURSE': {
      const completed = await db.lessonProgress.count({
        where: {
          userId,
          lesson: { module: { courseId: condition.courseId } },
          completed: true,
        },
      })
      return completed >= condition.count
    }
    
    case 'COURSE_COMPLETED': {
      const cert = await db.certificate.findUnique({
        where: { userId_courseId: { userId, courseId: condition.courseId } },
      })
      return !!cert
    }
    
    case 'SCORE_ACHIEVED': {
      const best = await db.lessonProgress.findFirst({
        where: { userId },
        orderBy: { bestScore: 'desc' },
      })
      return (best?.bestScore || 0) >= condition.score
    }
    
    case 'STREAK_DAYS': {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      })
      return (user?.streak || 0) >= condition.days
    }
    
    case 'GEM_AMOUNT': {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { gems: true },
      })
      return (user?.gems || 0) >= condition.amount
    }
    
    case 'XP_AMOUNT': {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { xp: true },
      })
      return (user?.xp || 0) >= condition.amount
    }
    
    default:
      return false
  }
}

export async function checkAllAchievementsForUser(
  userId: string
): Promise<Array<{ achievement: AchievementWithRewards; awarded: boolean; xpReward: number; gemReward: number }>> {
  const achievements = await getAllAchievements()
  const results: Array<{ achievement: any, awarded: boolean, xpReward: number, gemReward: number }> = []
  
  for (const achievement of achievements) {
    const condition = parseCondition(achievement.condition)
    
    if (!condition) {
      results.push({ achievement, awarded: false, xpReward: 0, gemReward: 0 })
      continue
    }
    
    const met = await evaluateCondition(userId, condition)
    if (met) {
      const result = await awardAchievement(userId, achievement)
      results.push({ achievement, ...result })
    } else {
      results.push({ achievement, awarded: false, xpReward: 0, gemReward: 0 })
    }
  }
  
  return results
}
