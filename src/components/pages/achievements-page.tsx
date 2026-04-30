'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Target,
  Lock,
  Star,
  Zap,
  Gem,
  CheckCircle2,
  Award,
  Sparkles,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useSoundEffect } from '@/hooks/use-sound'
import { useAppStore } from '@/store/app-store'

interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  condition: string | null
  xpReward: number
  gemReward: number
  earned: boolean
  earnedAt: string | null
}

function AchievementsSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-3 w-full max-w-xs rounded-full" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

const achievementEmojiFallbacks: Record<string, string> = {
  'First Steps': '👶',
  'Streak Master': '🔥',
  'Gem Collector': '💎',
  'Course Champion': '🏆',
  'Perfect Score': '💯',
  'Knowledge Seeker': '📚',
}

function getAchievementIcon(achievement: Achievement): string {
  if (achievement.icon) return achievement.icon
  return achievementEmojiFallbacks[achievement.title] || '🎖️'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AchievementsPage() {
  const { goBack } = useAppStore()
  const playAchievement = useSoundEffect('achievement')
  const playGemCollect = useSoundEffect('gemCollect')
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [earnedCount, setEarnedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newAchievement, setNewAchievement] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/achievements')
      const data = await res.json()
      setAchievements(data.achievements || [])
      setEarnedCount(data.earnedCount || 0)
      setTotalCount(data.totalCount || 0)

      // Show new achievement popup for the most recently earned
      const justEarned = (data.achievements || []).find(
        (a: Achievement) => a.earned && a.earnedAt && new Date(a.earnedAt).getTime() > Date.now() - 60000
      )
      if (justEarned) {
        setNewAchievement(justEarned.title)
        playAchievement()
        setTimeout(() => setNewAchievement(null), 4000)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  if (loading) return <AchievementsSkeleton />

  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* New Achievement Popup */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="border-2 border-yellow-400 shadow-xl shadow-yellow-400/20 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 rounded-2xl overflow-hidden">
              <CardContent className="p-4 text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                >
                  <span className="text-4xl block mb-2">🎉</span>
                </motion.div>
                <p className="text-xs text-yellow-600 font-semibold mb-1">NEW ACHIEVEMENT!</p>
                <p className="font-bold text-sm">{newAchievement}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-yellow-400/10 translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Target className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Achievements</h1>
              <p className="text-white/80 text-sm">Track your learning milestones!</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80 font-medium">
                {earnedCount} of {totalCount} earned
              </span>
              <span className="font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden rounded-2xl transition-all duration-300 h-full ${
                  achievement.earned
                    ? 'border-2 border-yellow-400/60 shadow-md shadow-yellow-400/10 hover:shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-1'
                    : 'border-0 shadow-sm opacity-75 grayscale-[30%]'
                }`}
              >
                {achievement.earned && (
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-400 to-amber-500 text-white px-2.5 py-1 rounded-bl-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                {!achievement.earned && (
                  <div className="absolute top-0 right-0 bg-muted px-2.5 py-1 rounded-bl-xl">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                <CardContent className="p-5 flex flex-col items-center text-center">
                  {/* Achievement Icon */}
                  <motion.div
                    whileHover={achievement.earned ? { scale: 1.15, rotate: 10 } : {}}
                    onClick={achievement.earned ? playGemCollect : undefined}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${
                      achievement.earned
                        ? 'bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
                        : 'bg-muted'
                    }`}
                  >
                    <span className={`text-3xl ${!achievement.earned ? 'grayscale opacity-50' : ''}`}>
                      {getAchievementIcon(achievement)}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {achievement.description || 'Complete this achievement to earn rewards'}
                  </p>

                  {/* Rewards */}
                  <div className="flex items-center gap-3 mb-3">
                    {achievement.xpReward > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold">{achievement.xpReward}</span>
                      </div>
                    )}
                    {achievement.gemReward > 0 && (
                      <div className="flex items-center gap-1 text-xs">
                        <Gem className="w-3 h-3 text-blue-500" />
                        <span className="font-semibold">{achievement.gemReward}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  {achievement.earned ? (
                    <div className="text-[10px] text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {achievement.earnedAt ? formatDate(achievement.earnedAt) : 'Earned'}
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground bg-muted rounded-full px-3 py-1">
                      {achievement.condition || 'Keep learning!'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {achievements.length === 0 && (
        <div className="text-center py-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-1">No achievements yet</h3>
          <p className="text-sm text-muted-foreground/70">
            Start learning to unlock achievements!
          </p>
        </div>
      )}
    </div>
  )
}
