// XP Boost System for SkoolarPlay
// Calculates XP multipliers based on streak, time of day, and premium status

export interface XpBoostResult {
  totalXp: number
  boostReason: string[]
  multiplier: number
  streakBonus: number
  timeBonus: number
  premiumBonus: number
}

// Streak-based multipliers
const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.2,
  7: 1.5,
  14: 2.0,
  30: 2.5,
  60: 3.0,
  100: 5.0,
}

// Time-of-day and day-of-week multipliers
const TIME_MULTIPLIERS: Record<string, { multiplier: number; label: string }> = {
  morning_6_9: { multiplier: 1.1, label: 'Early Bird Bonus' },
  evening_18_21: { multiplier: 1.2, label: 'Evening Prime Bonus' },
  weekend: { multiplier: 1.15, label: 'Weekend Warrior Bonus' },
}

// Premium users get 1.5x XP
const PREMIUM_MULTIPLIER = 1.5

/**
 * Get the time-based multiplier for the current moment
 */
export function getTimeMultiplier(now?: Date): { multiplier: number; label: string } | null {
  const date = now || new Date()
  const hour = date.getHours()
  const day = date.getDay() // 0 = Sunday, 6 = Saturday

  // Weekend bonus (Saturday or Sunday)
  if (day === 0 || day === 6) {
    return TIME_MULTIPLIERS.weekend
  }

  // Morning bonus (6 AM - 9 AM)
  if (hour >= 6 && hour < 9) {
    return TIME_MULTIPLIERS.morning_6_9
  }

  // Evening prime (6 PM - 9 PM)
  if (hour >= 18 && hour < 21) {
    return TIME_MULTIPLIERS.evening_18_21
  }

  return null
}

/**
 * Get the streak-based multiplier
 */
export function getStreakMultiplier(streak: number): { multiplier: number; label: string } | null {
  // Find the highest applicable multiplier
  const applicableStreaks = Object.keys(STREAK_MULTIPLIERS)
    .map(Number)
    .filter(s => streak >= s)
    .sort((a, b) => b - a) // Descending

  if (applicableStreaks.length === 0) return null

  const bestStreak = applicableStreaks[0]
  const mult = STREAK_MULTIPLIERS[bestStreak]

  let label = ''
  if (bestStreak >= 100) label = 'Century Streak Bonus (100+ days!)'
  else if (bestStreak >= 60) label = '2-Month Streak Bonus (60+ days!)'
  else if (bestStreak >= 30) label = 'Monthly Streak Bonus (30+ days!)'
  else if (bestStreak >= 14) label = '2-Week Streak Bonus (14+ days!)'
  else if (bestStreak >= 7) label = 'Weekly Streak Bonus (7+ days!)'
  else if (bestStreak >= 3) label = '3-Day Streak Bonus'

  return { multiplier: mult, label }
}

/**
 * Calculate the total XP with all active boosts applied
 */
export function calculateXpBoost(
  baseXp: number,
  options: {
    streak?: number
    isPremium?: boolean
    now?: Date
    xpMultiplier?: number
  } = {}
): XpBoostResult {
  const { streak = 0, isPremium = false, now, xpMultiplier = 1.0 } = options
  const boostReasons: string[] = []

  let streakBonus = 1
  let timeBonus = 1
  let premiumBonus = 1
  let purchaseBonus = 1

  // 1. Check streak multiplier
  const streakMult = getStreakMultiplier(streak)
  if (streakMult) {
    streakBonus = streakMult.multiplier
    boostReasons.push(`${streakMult.label} (${streakMult.multiplier}x)`)
  }

  // 2. Check time multiplier
  const timeMult = getTimeMultiplier(now)
  if (timeMult) {
    timeBonus = timeMult.multiplier
    boostReasons.push(`${timeMult.label} (${timeMult.multiplier}x)`)
  }

  // 3. Check premium multiplier
  if (isPremium) {
    premiumBonus = PREMIUM_MULTIPLIER
    boostReasons.push(`Premium Bonus (${PREMIUM_MULTIPLIER}x)`)
  }

  // 4. Check purchased boost multiplier (from shop)
  if (xpMultiplier > 1.0) {
    purchaseBonus = xpMultiplier
    boostReasons.push(`XP Boost (${xpMultiplier}x)`)
  }

  // Calculate total multiplier (multiply all bonuses together)
  const totalMultiplier = streakBonus * timeBonus * premiumBonus * purchaseBonus
  const totalXp = Math.round(baseXp * totalMultiplier)

  return {
    totalXp,
    boostReason: boostReasons,
    multiplier: totalMultiplier,
    streakBonus,
    timeBonus,
    premiumBonus,
  }
}

/**
 * Get all active boost descriptions for a user (for UI display)
 */
export function getActiveBoosts(options: {
  streak?: number
  isPremium?: boolean
  now?: Date
}): Array<{ type: string; multiplier: number; label: string; active: boolean }> {
  const { streak = 0, isPremium = false, now } = options

  const boosts: Array<{ type: string; multiplier: number; label: string; active: boolean }> = []

  // Streak boosts - show next milestone if not reached
  const streakMult = getStreakMultiplier(streak)
  if (streakMult) {
    boosts.push({ type: 'streak', multiplier: streakMult.multiplier, label: streakMult.label, active: true })
  } else {
    // Show upcoming streak bonus
    const nextMilestone = Object.keys(STREAK_MULTIPLIERS)
      .map(Number)
      .filter(s => s > streak)
      .sort((a, b) => a - b)[0]
    if (nextMilestone) {
      boosts.push({
        type: 'streak',
        multiplier: STREAK_MULTIPLIERS[nextMilestone],
        label: `${nextMilestone}-day streak (${STREAK_MULTIPLIERS[nextMilestone]}x)`,
        active: false,
      })
    }
  }

  // Time boost
  const timeMult = getTimeMultiplier(now)
  if (timeMult) {
    boosts.push({ type: 'time', multiplier: timeMult.multiplier, label: timeMult.label, active: true })
  }

  // Premium boost
  boosts.push({
    type: 'premium',
    multiplier: PREMIUM_MULTIPLIER,
    label: 'Premium XP Boost',
    active: isPremium,
  })

  return boosts
}
