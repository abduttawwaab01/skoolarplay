'use client'

import { useAuthStore } from '@/store/auth-store'
import { useCallback } from 'react'

interface AchievementCheck {
  type: string
  condition: (user: any) => boolean
}

const achievementChecks: AchievementCheck[] = [
  {
    type: 'FIRST_LESSON',
    condition: (user) => user.completedLessons >= 1,
  },
  {
    type: 'STREAK_7',
    condition: (user) => user.streak >= 7,
  },
  {
    type: 'STREAK_30',
    condition: (user) => user.streak >= 30,
  },
  {
    type: 'GEMS_100',
    condition: (user) => user.gems >= 100,
  },
  {
    type: 'GEMS_500',
    condition: (user) => user.gems >= 500,
  },
  {
    type: 'COURSE_COMPLETE',
    condition: (user) => user.coursesCompleted >= 1,
  },
  {
    type: 'PERFECT_SCORE',
    condition: (user) => user.perfectScores >= 1,
  },
  {
    type: 'ENROLL_5',
    condition: (user) => user.enrollments >= 5,
  },
  {
    type: 'XP_1000',
    condition: (user) => user.xp >= 1000,
  },
  {
    type: 'WEEKLY_CHAMPION',
    condition: (user) => user.weeklyRank === 1,
  },
]

export function useAchievements() {
  const { user } = useAuthStore()

  const checkAndAwardAchievements = useCallback(
    async (context: {
      completedLessons?: number
      perfectScores?: number
      coursesCompleted?: number
      enrollments?: number
      weeklyRank?: number
    }) => {
      if (!user) return []

      const userContext = {
        ...user,
        completedLessons: context.completedLessons || 0,
        perfectScores: context.perfectScores || 0,
        coursesCompleted: context.coursesCompleted || 0,
        enrollments: context.enrollments || 0,
        weeklyRank: context.weeklyRank || 0,
      }

      const newAchievements: string[] = []

      try {
        // Fetch existing achievements
        const achievementsRes = await fetch('/api/achievements')
        const achievementsData = await achievementsRes.json()

        const existingEarned = new Set(
          achievementsData.achievements
            ?.filter((a: any) => a.earned)
            .map((a: any) => a.title) || []
        )

        // Check which achievements should be awarded
        for (const check of achievementChecks) {
          if (check.condition(userContext)) {
            // Find matching achievement by condition/type
            const match = achievementsData.achievements?.find(
              (a: any) =>
                !a.earned &&
                a.condition?.toUpperCase().includes(check.type.toUpperCase())
            )
            if (match && !existingEarned.has(match.title)) {
              newAchievements.push(match.title)
            }
          }
        }
      } catch (error) {
        console.error('Achievement check error:', error)
      }

      return newAchievements
    },
    [user]
  )

  return { checkAndAwardAchievements }
}
