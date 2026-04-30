// Game Center core logic
import { db } from './db'
import { getLevelInfo } from './level-system'

export interface GameCenterAccess {
  allowed: boolean
  reason?: string
  lessonsCompleted: number
  timeSpentMinutes: number
  requiredLessons: number
  requiredMinutes: number
  isPremium: boolean
  lessonsRemaining: number
  minutesRemaining: number
}

export interface GameWithAccess {
  id: string
  title: string
  description: string | null
  type: string
  difficulty: string
  icon: string | null
  color: string | null
  xpReward: number
  gemReward: number
  timeLimit: number | null
  minLevel: number
  userLevel: number
  hasAccess: boolean
  highScore: number
  timesPlayed: number
}

export async function checkGameCenterAccess(userId: string): Promise<GameCenterAccess> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      totalLessonsCompleted: true,
      isPremium: true,
      premiumExpiresAt: true,
      unlockedFeatures: true,
    },
  })

  if (!user) {
    return {
      allowed: false,
      lessonsCompleted: 0,
      timeSpentMinutes: 0,
      requiredLessons: 5,
      requiredMinutes: 30,
      isPremium: false,
      lessonsRemaining: 5,
      minutesRemaining: 30,
    }
  }

  const timeResult = await db.lessonProgress.aggregate({
    where: { userId },
    _sum: { timeSpent: true },
  })
  const totalSeconds = timeResult._sum.timeSpent || 0
  const totalMinutes = Math.floor(totalSeconds / 60)

  const settings = await db.gameCenterSettings.findFirst()
  const requiredLessons = settings?.minLessonsCompleted ?? 5
  const requiredMinutes = settings?.minTimeSpentMinutes ?? 30

  const isPremiumUser = user.isPremium &&
    (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())

  if (isPremiumUser && settings?.enablePremiumBypass !== false) {
    return {
      allowed: true,
      lessonsCompleted: user.totalLessonsCompleted,
      timeSpentMinutes: totalMinutes,
      requiredLessons,
      requiredMinutes,
      isPremium: true,
      lessonsRemaining: 0,
      minutesRemaining: 0,
    }
  }

  const meetsLessons = user.totalLessonsCompleted >= requiredLessons
  const meetsTime = totalMinutes >= requiredMinutes
  const lessonsRemaining = Math.max(0, requiredLessons - user.totalLessonsCompleted)
  const minutesRemaining = Math.max(0, requiredMinutes - totalMinutes)

  return {
    allowed: meetsLessons && meetsTime,
    reason: !meetsLessons
      ? `Complete ${lessonsRemaining} more lessons`
      : `Spend ${minutesRemaining} more minutes learning`,
    lessonsCompleted: user.totalLessonsCompleted,
    timeSpentMinutes: totalMinutes,
    requiredLessons,
    requiredMinutes,
    isPremium: isPremiumUser,
    lessonsRemaining,
    minutesRemaining,
  }
}

export async function getAvailableGames(userId: string): Promise<GameWithAccess[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { totalLessonsCompleted: true, isPremium: true, premiumExpiresAt: true },
  })

  if (!user) return []

  const levelInfo = getLevelInfo(user.totalLessonsCompleted * 10)
  const userLevel = levelInfo.level

  const games = await db.game.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  const userScores = await db.gameScore.groupBy({
    by: ['gameId'],
    where: { userId },
    _max: { score: true },
    _count: { id: true },
  })

  const scoreMap = new Map(
    userScores.map(s => [s.gameId, { highScore: s._max.score || 0, timesPlayed: s._count.id }])
  )

  return games.map(game => ({
    ...game,
    userLevel,
    hasAccess: userLevel >= game.minLevel,
    highScore: scoreMap.get(game.id)?.highScore || 0,
    timesPlayed: scoreMap.get(game.id)?.timesPlayed || 0,
  }))
}

export async function checkDailyCaps(userId: string): Promise<{ xpCap: number; gemCap: number; xpEarnedToday: number; gemsEarnedToday: number }> {
  const settings = await db.gameCenterSettings.findFirst()
  const xpCap = settings?.dailyXpCap ?? 100
  const gemCap = settings?.dailyGemCap ?? 50

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayScores = await db.gameScore.findMany({
    where: {
      userId,
      completedAt: { gte: today },
    },
    select: { xpEarned: true, gemsEarned: true },
  })

  const xpEarnedToday = todayScores.reduce((sum, s) => sum + s.xpEarned, 0)
  const gemsEarnedToday = todayScores.reduce((sum, s) => sum + s.gemsEarned, 0)

  return { xpCap, gemCap, xpEarnedToday, gemsEarnedToday }
}

export async function submitGameScore(
  userId: string,
  gameId: string,
  score: number,
  timeSpentSeconds: number
): Promise<{ xpEarned: number; gemsEarned: number; newHighScore: boolean }> {
  const game = await db.game.findUnique({
    where: { id: gameId, isActive: true },
  })

  if (!game) throw new Error('Game not found')

  const { xpEarnedToday, gemsEarnedToday, xpCap, gemCap } = await checkDailyCaps(userId)

  let xpEarned = Math.floor(game.xpReward * (score / 100))
  let gemsEarned = Math.floor(game.gemReward * (score / 100))

  // Apply daily caps
  const remainingXpCap = Math.max(0, xpCap - xpEarnedToday)
  const remainingGemCap = Math.max(0, gemCap - gemsEarnedToday)

  xpEarned = Math.min(xpEarned, remainingXpCap)
  gemsEarned = Math.min(gemsEarned, remainingGemCap)

  // Check for high score
  const highScore = await db.gameScore.findFirst({
    where: { userId, gameId },
    orderBy: { score: 'desc' },
  })

  const newHighScore = !highScore || score > highScore.score

  // Save score
  await db.gameScore.create({
    data: {
      userId,
      gameId,
      score,
      timeSpent: timeSpentSeconds,
      xpEarned,
      gemsEarned,
    },
  })

  // Award XP and gems
  if (xpEarned > 0) {
    await db.user.update({
      where: { id: userId },
      data: { xp: { increment: xpEarned } },
    })
  }

  if (gemsEarned > 0) {
    await db.user.update({
      where: { id: userId },
      data: { gems: { increment: gemsEarned } },
    })

    await db.gemTransaction.create({
      data: {
        userId,
        amount: gemsEarned,
        type: 'EARN',
        source: 'game',
        description: `Earned ${gemsEarned} gems from ${game.title}`,
        relatedId: gameId,
      },
    })
  }

  return { xpEarned, gemsEarned, newHighScore }
}
