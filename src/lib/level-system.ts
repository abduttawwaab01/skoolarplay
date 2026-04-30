// Level System for SkoolarPlay
// Progressive XP thresholds and level-up rewards

// Level XP thresholds (cumulative XP needed for each level)
// Index 0 = Level 1 needs 0 XP, Index 1 = Level 2 needs 50 XP, etc.
const LEVEL_THRESHOLDS = [
  0, 50, 120, 200, 300, 450, 650, 900, 1200, 1600,       // Levels 1-10
  2100, 2700, 3400, 4300, 5400, 6800, 8500, 10500, 13000, 16000, // Levels 11-20
  19500, 24000, 29000, 35000, 42000, 50000, 60000, 72000, 86000, 100000, // Levels 21-30
]

export interface LevelInfo {
  level: number
  currentLevelXp: number // XP at the start of current level
  nextLevelXp: number | null    // XP needed for next level (null if max level)
  progress: number       // Progress percentage to next level (0-100)
  xpToNext: number       // XP remaining to next level
  totalXp: number        // User's total XP
}

export interface LevelUpResult {
  leveledUp: boolean
  oldLevel: number
  newLevel: number
  rewards: {
    gems: number
    xp: number
    bonusMessage: string
  }
}

/**
 * Get level information for a given XP amount
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1

  // Find the highest level the user has reached
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] || 0
  const nextLevelXp = level < LEVEL_THRESHOLDS.length
    ? LEVEL_THRESHOLDS[level]
    : null

  const xpToNext = nextLevelXp !== null
    ? nextLevelXp - totalXp
    : 0

  const xpForLevel = nextLevelXp !== null
    ? nextLevelXp - currentLevelXp
    : 1

  const xpProgress = totalXp - currentLevelXp
  const progress = nextLevelXp !== null
    ? Math.min(100, Math.round((xpProgress / xpForLevel) * 100))
    : 100

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progress,
    xpToNext,
    totalXp,
  }
}

/**
 * Check if a level up occurred given previous and current XP
 */
export function checkLevelUp(previousXp: number, currentXp: number): LevelUpResult | null {
  const oldLevel = getLevelInfo(previousXp).level
  const newLevel = getLevelInfo(currentXp).level

  if (newLevel <= oldLevel) {
    return null
  }

  // Calculate rewards for the new level(s)
  // Gems: level * 10
  const gemReward = newLevel * 10

  // XP bonus: level * 5
  const xpReward = newLevel * 5

  let bonusMessage = ''
  if (newLevel >= 20) {
    bonusMessage = 'Legendary achievement! You are a true learning master!'
  } else if (newLevel >= 15) {
    bonusMessage = 'Outstanding! You are in the top tier of learners!'
  } else if (newLevel >= 10) {
    bonusMessage = 'Amazing milestone! Double digits!'
  } else if (newLevel >= 5) {
    bonusMessage = 'Great progress! Keep up the momentum!'
  } else {
    bonusMessage = `Welcome to Level ${newLevel}! Keep learning!`
  }

  return {
    leveledUp: true,
    oldLevel,
    newLevel,
    rewards: {
      gems: gemReward,
      xp: xpReward,
      bonusMessage,
    },
  }
}

/**
 * Get the level title/name based on level number
 */
export function getLevelTitle(level: number): string {
  if (level >= 30) return 'Grandmaster'
  if (level >= 25) return 'Legend'
  if (level >= 20) return 'Master'
  if (level >= 15) return 'Expert'
  if (level >= 10) return 'Scholar'
  if (level >= 7) return 'Apprentice'
  if (level >= 4) return 'Learner'
  if (level >= 2) return 'Beginner'
  return 'Newcomer'
}

/**
 * Get the total number of defined levels
 */
export function getMaxLevel(): number {
  return LEVEL_THRESHOLDS.length
}
