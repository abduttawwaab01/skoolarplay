'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Zap,
  Gem,
  Play,
  Star,
  Clock,
  CheckCircle2,
  Timer,
  Target,
  Brain,
  Gauge,
  Trophy,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'

interface Challenge {
  id: string
  title: string
  description: string | null
  type: string
  xpReward: number
  gemReward: number
  date: string
  completed: boolean
  score: number | null
  completedAt: string | null
}

interface PreviousChallenge {
  id: string
  title: string
  description: string | null
  type: string
  xpReward: number
  gemReward: number
  date: string
  completed: boolean
  score: number | null
  completedAt: string | null
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; emoji: string; color: string }> = {
  QUIZ: { icon: Brain, label: 'Quiz Challenge', emoji: '🧠', color: 'from-blue-500 to-indigo-500' },
  SPEED: { icon: Gauge, label: 'Speed Challenge', emoji: '⚡', color: 'from-orange-500 to-red-500' },
  ACCURACY: { icon: Target, label: 'Accuracy Challenge', emoji: '🎯', color: 'from-green-500 to-emerald-500' },
}

function ChallengeSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-6 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const now = new Date()
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const updateTimer = () => {
      const current = new Date()
      const diff = endOfDay.getTime() - current.getTime()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Timer className="w-4 h-4 text-red-500" />
      <span className="font-mono font-bold tabular-nums text-red-600">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

export function DailyChallengePage() {
  const { user, updateXP, updateGems } = useAuthStore()
  const { goBack } = useAppStore()
  const playTimer = useSoundEffect('timer')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [previousChallenges, setPreviousChallenges] = useState<PreviousChallenge[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  const fetchChallenge = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/daily-challenge')
      const data = await res.json()
      setChallenge(data.challenge)
      setPreviousChallenges(data.previousChallenges || [])
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChallenge()
  }, [fetchChallenge])

  const handleCompleteChallenge = async () => {
    if (!challenge || completing) return

    setCompleting(true)
    playTimer()

    // Simulate a challenge completion with a random score
    const score = Math.floor(Math.random() * 30) + 70 // 70-100

    try {
      const res = await fetch('/api/daily-challenge/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, score }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to complete challenge')
        setCompleting(false)
        return
      }

      // Update local state
      updateXP(data.xpEarned)
      updateGems(data.gemsEarned)

      setShowCompletion(true)

      toast.success('Challenge completed! 🎉', {
        description: `+${data.xpEarned} XP, +${data.gemsEarned} Gems`,
      })

      // Refresh data
      fetchChallenge()
    } catch (error) {
      toast.error('Failed to complete challenge')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <ChallengeSkeleton />

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const config = challenge ? typeConfig[challenge.type] || typeConfig.QUIZ : typeConfig.QUIZ

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-yellow-400/10 translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Calendar className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Daily Challenge</h1>
              <p className="text-white/80 text-sm">{today}</p>
            </div>
          </div>

          {!challenge?.completed && (
            <CountdownTimer />
          )}
        </div>
      </motion.div>

      {/* Today's Challenge */}
      {challenge ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className={`relative overflow-hidden rounded-2xl border-0 shadow-lg ${
              challenge.completed ? '' : 'hover:shadow-xl'
            }`}
          >
            {/* Completion overlay */}
            <AnimatePresence>
              {showCompletion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                  >
                    <Trophy className="w-20 h-20 text-yellow-300 mb-4" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold mb-2"
                  >
                    Challenge Complete! 🎉
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80"
                  >
                    +{challenge.xpReward} XP & +{challenge.gemReward} Gems earned
                  </motion.p>
                  <Button
                    onClick={() => setShowCompletion(false)}
                    variant="ghost"
                    className="mt-6 text-white hover:bg-white/20 rounded-full"
                  >
                    Continue
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Challenge gradient top bar */}
            <div className={`h-2 bg-gradient-to-r ${challenge.completed ? 'from-green-400 to-emerald-400' : config.color}`} />

            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Challenge Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className={`rounded-full text-xs font-semibold ${
                        challenge.completed
                          ? 'bg-green-100 text-green-700 border-0'
                          : `${config.color} text-white border-0`
                      }`}
                    >
                      {config.emoji} {config.label}
                    </Badge>
                    {challenge.completed && (
                      <Badge variant="secondary" className="rounded-full text-xs bg-green-50 text-green-700 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold mb-2">{challenge.title}</h2>
                  <p className="text-muted-foreground mb-6">
                    {challenge.description || 'Test your knowledge and earn bonus rewards!'}
                  </p>

                  {/* Rewards */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                      <Zap className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">XP Reward</p>
                        <p className="font-bold text-amber-600">+{challenge.xpReward}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                      <Gem className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Gem Reward</p>
                        <p className="font-bold text-blue-600">+{challenge.gemReward}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {challenge.completed ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/20">
                        <Star className="w-5 h-5 text-green-500 fill-current" />
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="font-bold text-green-600">{challenge.score || 'Completed'}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Come back tomorrow for a new challenge!
                      </p>
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleCompleteChallenge}
                        disabled={completing}
                        size="lg"
                      className={`rounded-2xl bg-gradient-to-r ${config.color} hover:opacity-90 text-white shadow-lg px-8 h-12 text-base font-semibold`}
                      >
                        {completing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="w-5 h-5 mr-2" />
                            </motion.div>
                            Completing...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Start Challenge
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Challenge Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="hidden md:flex items-center justify-center"
                >
                  <motion.div
                    animate={challenge.completed ? {} : { y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-xl`}
                  >
                    <span className="text-6xl">
                      {challenge.completed ? '✅' : config.emoji}
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card className="border-dashed rounded-2xl">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No challenge today</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for today&apos;s daily challenge!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Previous Challenges */}
      {previousChallenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Previous Challenges
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {previousChallenges.map((ch, i) => {
              const chConfig = typeConfig[ch.type] || typeConfig.QUIZ
              const dateObj = new Date(ch.date + 'T00:00:00')
              const dateStr = dateObj.toLocaleDateString('en-NG', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

              return (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Card className={`rounded-xl border-0 shadow-sm ${ch.completed ? '' : 'opacity-60'}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chConfig.color} flex items-center justify-center shrink-0`}>
                        <span className="text-2xl">{chConfig.emoji}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">{ch.title}</h3>
                          {ch.completed && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{dateStr}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="font-semibold">{ch.xpReward}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Gem className="w-3 h-3 text-blue-500" />
                          <span className="font-semibold">{ch.gemReward}</span>
                        </div>
                        {ch.completed && ch.score !== null && (
                          <Badge variant="secondary" className="rounded-full text-[10px]">
                            {ch.score}%
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
