'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Zap, Heart, Gift, Snowflake, Calendar, Check, Lock, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

interface RewardDay {
  day: number
  gems: number
  xp: number
  label: string
  icon: string
}

const REWARD_CALENDAR: RewardDay[] = [
  { day: 1, gems: 5, xp: 0, label: '5 Gems', icon: '💎' },
  { day: 2, gems: 0, xp: 10, label: '10 XP', icon: '⚡' },
  { day: 3, gems: 10, xp: 0, label: '10 Gems', icon: '💎' },
  { day: 4, gems: 0, xp: 0, label: '1 Heart', icon: '❤️' },
  { day: 5, gems: 15, xp: 25, label: '15 Gems + 25 XP', icon: '🎁' },
  { day: 6, gems: 0, xp: 0, label: 'Mystery Box', icon: '🎁' },
  { day: 7, gems: 50, xp: 0, label: '50 Gems + Streak Freeze', icon: '👑' },
]

export function LoginRewardsPage() {
  const { user, updateGems, updateXP, updateUser } = useAuthStore()
  const { navigateTo } = useAppStore()
  const playLoginReward = useSoundEffect('loginReward')
  const playGemCollect = useSoundEffect('gemCollect')
  const playClick = useSoundEffect('click')
  const playWrong = useSoundEffect('wrong')
  const [currentDay, setCurrentDay] = useState(0)
  const [claimedDays, setClaimedDays] = useState<Set<number>>(new Set())
  const [todayClaimed, setTodayClaimed] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showClaimAnimation, setShowClaimAnimation] = useState(false)
  const [claimedReward, setClaimedReward] = useState<RewardDay | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/login-rewards')
      const data = await res.json()
      setCurrentDay(data.currentDay)
      setClaimedDays(new Set(data.claimedDays))
      setTodayClaimed(data.todayClaimed)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleClaim = async () => {
    if (claiming || todayClaimed) return
    const nextDay = currentDay >= 7 ? 7 : currentDay + 1

    // Check if already claimed
    if (claimedDays.has(nextDay)) {
      playWrong()
      toast.error('Already claimed today!')
      return
    }

    setClaiming(true)

    try {
      const res = await fetch('/api/login-rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber: nextDay }),
      })

      const data = await res.json()

      if (!res.ok) {
        playWrong()
        toast.error(data.error || 'Failed to claim reward')
        setClaiming(false)
        return
      }

      if (data.user) {
        if (data.reward.gems > 0) updateGems(data.reward.gems)
        if (data.reward.xp > 0) updateXP(data.reward.xp)
      }

      setClaimedReward(REWARD_CALENDAR[nextDay - 1])
      setShowClaimAnimation(true)
      setTodayClaimed(true)
      setCurrentDay(nextDay)
      setClaimedDays((prev) => new Set([...prev, nextDay]))
      playLoginReward()
      if (data.reward.gems > 0) playGemCollect()

      setTimeout(() => {
        setShowClaimAnimation(false)
        setClaimedReward(null)
      }, 3000)
    } catch {
      playWrong()
      toast.error('Failed to claim reward')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const nextDay = currentDay >= 7 ? 7 : currentDay + 1
  const canClaim = !todayClaimed && nextDay <= 7
  const isWeekComplete = claimedDays.has(7)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-[#008751] to-[#006B40] p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-[#F59E0B]/10 translate-y-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl"
            >
              📅
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Daily Login Rewards</h1>
              <p className="text-white/80 text-sm">Login daily for bonus rewards!</p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p className="text-white/70 text-xs">Day</p>
            <p className="text-2xl font-bold">{currentDay}/7</p>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Weekly Progress</span>
          <span className="font-semibold text-primary">{Math.round((claimedDays.size / 7) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(claimedDays.size / 7) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#008751] to-[#F59E0B] rounded-full"
          />
        </div>
      </motion.div>

      {/* 7-Day Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {REWARD_CALENDAR.map((reward, i) => {
            const day = reward.day
            const isClaimed = claimedDays.has(day)
            const isNext = day === nextDay && !todayClaimed
            const isLocked = day > nextDay || (day > currentDay + 1 && !isClaimed)
            const isCurrentStreakDay = day === nextDay

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
                className={`relative flex flex-col items-center rounded-xl p-2 md:p-3 border-2 transition-all ${
                  isClaimed
                    ? 'bg-[#008751]/10 border-[#008751]/30'
                    : isNext
                    ? 'bg-[#F59E0B]/10 border-[#F59E0B] shadow-md shadow-[#F59E0B]/20'
                    : isLocked
                    ? 'bg-muted/50 border-muted opacity-60'
                    : 'bg-card border-border'
                }`}
              >
                {/* Day number */}
                <span className={`text-xs font-bold mb-1 ${
                  isClaimed ? 'text-[#008751]' : isNext ? 'text-[#F59E0B]' : 'text-muted-foreground'
                }`}>
                  Day {day}
                </span>

                {/* Icon */}
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-2xl mb-1 ${
                  isClaimed ? 'bg-[#008751]/20' : isNext ? 'bg-[#F59E0B]/20' : 'bg-muted'
                }`}>
                  {isClaimed ? '✅' : isLocked ? '🔒' : reward.icon}
                </div>

                {/* Reward label */}
                <span className="text-[9px] md:text-[10px] text-center font-medium leading-tight text-muted-foreground">
                  {reward.label}
                </span>

                {/* Checkmark for claimed */}
                {isClaimed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#008751] flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}

                {/* Pulse for current day */}
                {isNext && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl border-2 border-[#F59E0B] pointer-events-none"
                  />
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Claim Button */}
      {canClaim && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            disabled={claiming}
            className="relative w-full max-w-sm rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] p-4 text-white font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 overflow-hidden"
          >
            <motion.div
              animate={{ x: ['0%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <div className="relative z-10 flex items-center justify-center gap-2">
              {claiming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Gem className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <span>Claim Day {nextDay} Reward</span>
                  <span className="text-xl">{REWARD_CALENDAR[nextDay - 1].icon}</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      )}

      {isWeekComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/20"
        >
          <Crown className="w-8 h-8 text-[#F59E0B] mx-auto mb-2" />
          <h3 className="font-bold text-lg">Week Complete! 🎉</h3>
          <p className="text-sm text-muted-foreground">Come back tomorrow for a new week of rewards!</p>
        </motion.div>
      )}

      {/* Claim animation overlay */}
      <AnimatePresence>
        {showClaimAnimation && claimedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
              transition={{ type: 'spring', damping: 12 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-6xl mb-3"
              >
                {claimedReward.icon}
              </motion.div>
              <h3 className="text-xl font-bold mb-1">Reward Claimed!</h3>
              <p className="text-muted-foreground">{claimedReward.label}</p>
              <div className="flex justify-center gap-2 mt-3">
                {claimedReward.gems > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">
                    <Gem className="w-3 h-3 mr-1" />+{claimedReward.gems}
                  </Badge>
                )}
                {claimedReward.xp > 0 && (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Zap className="w-3 h-3 mr-1" />+{claimedReward.xp}
                  </Badge>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-muted/50 rounded-2xl p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Log in every day to keep your streak! Missing a day resets to Day 1.
        </p>
        {currentDay >= 6 && (
          <p className="text-xs text-[#F59E0B] mt-2 font-medium">
            👀 You&apos;re close to the grand prize! Keep it up!
          </p>
        )}
      </motion.div>
    </div>
  )
}
