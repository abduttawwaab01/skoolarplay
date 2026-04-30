'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem, Zap, Heart, Snowflake, Gift, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

const SEGMENTS = [
  { emoji: '💎', label: '10 Gems', type: 'GEMS', color: '#008751', textColor: '#fff' },
  { emoji: '⚡', label: '25 XP', type: 'XP', color: '#F59E0B', textColor: '#fff' },
  { emoji: '❤️', label: '1 Heart', type: 'HEARTS', color: '#fff', textColor: '#333' },
  { emoji: '❄️', label: 'Streak Freeze', type: 'STREAK_FREEZE', color: '#008751', textColor: '#fff' },
  { emoji: '🎁', label: 'Mystery Box', type: 'MYSTERY_BOX', color: '#F59E0B', textColor: '#fff' },
  { emoji: '💎', label: '50 Gems', type: 'GEMS', color: '#008751', textColor: '#fff' },
  { emoji: '⚡', label: '100 XP', type: 'XP', color: '#F59E0B', textColor: '#fff' },
  { emoji: '😅', label: 'Nothing!', type: 'NOTHING', color: '#fff', textColor: '#333' },
]

const SEGMENT_ANGLE = 360 / SEGMENTS.length

export function SpinWheelPage() {
  const { user, updateGems, updateXP, updateUser } = useAuthStore()
  const { navigateTo } = useAppStore()
  const playSpinWheel = useSoundEffect('spinWheel')
  const playGemCollect = useSoundEffect('gemCollect')
  const playMysteryBox = useSoundEffect('mysteryBox')
  const playClick = useSoundEffect('click')
  const playNotification = useSoundEffect('notification')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [freeSpins, setFreeSpins] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/spin/status')
      const data = await res.json()
      setFreeSpins(data.freeSpinsRemaining)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleSpin = async (useGems: boolean) => {
    if (spinning) return
    if (freeSpins === 0 && !useGems) {
      toast.error('No free spins today! Spin for 5 gems?')
      return
    }

    setSpinning(true)
    setShowResult(false)
    playSpinWheel()

    try {
      const res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useGems }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'NO_FREE_SPINS') {
          toast.error('No free spins left today!')
        } else {
          toast.error(data.error || 'Spin failed')
        }
        setSpinning(false)
        return
      }

      // Calculate rotation: spin multiple full turns + land on segment
      const segIndex = data.spin.segmentIndex
      const targetAngle = 360 - (segIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2)
      const fullSpins = 5 + Math.floor(Math.random() * 3) // 5-7 full spins
      const newRotation = rotation + fullSpins * 360 + targetAngle - (rotation % 360)

      setRotation(newRotation)

      // Update local state
      if (data.user) {
        if (data.user.gems !== user?.gems) updateGems(data.user.gems - (user?.gems || 0))
        if (data.user.xp !== user?.xp) updateXP(data.user.xp - (user?.xp || 0))
      }
      setFreeSpins(data.remainingFreeSpins)

      // Show result after spin completes
      setTimeout(() => {
        setResult(data.spin)
        setShowResult(true)
        setSpinning(false)
        playNotification()
        if (data.spin?.rewardType === 'GEMS') playGemCollect()
        if (data.spin?.rewardType === 'MYSTERY_BOX') playMysteryBox()
      }, 4500)
    } catch {
      toast.error('Failed to spin. Try again.')
      setSpinning(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="flex justify-center">
          <Skeleton className="h-72 w-72 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-[#008751] to-[#006B40] p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-[#F59E0B]/10 translate-y-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl"
            >
              🎰
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Daily Spin</h1>
              <p className="text-white/80 text-sm">Spin the wheel for rewards!</p>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Free Spins</p>
              <p className="text-2xl font-bold">{freeSpins}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Wheel */}
      <div className="flex flex-col items-center gap-8 py-4">
        <div className="relative">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[30px] border-l-transparent border-r-transparent border-t-[#F59E0B] drop-shadow-lg" />
          </div>

          {/* Wheel Container */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
            className="w-72 h-72 md:w-80 md:h-80 rounded-full border-4 border-[#F59E0B] shadow-2xl overflow-hidden relative"
          >
            {/* Outer ring glow */}
            <div className="absolute inset-0 rounded-full border-4 border-[#F59E0B]/30 animate-pulse" />

            {SEGMENTS.map((seg, i) => {
              const startAngle = i * SEGMENT_ANGLE
              const endAngle = (i + 1) * SEGMENT_ANGLE
              const midAngle = startAngle + SEGMENT_ANGLE / 2

              // Calculate path for SVG segment
              const radius = 144
              const x1 = radius + radius * Math.sin((startAngle * Math.PI) / 180)
              const y1 = radius - radius * Math.cos((startAngle * Math.PI) / 180)
              const x2 = radius + radius * Math.sin((endAngle * Math.PI) / 180)
              const y2 = radius - radius * Math.cos((endAngle * Math.PI) / 180)
              const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0

              return (
                <svg
                  key={i}
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                >
                  <path
                    d={`M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                  />
                  <text
                    x={radius + (radius * 0.62) * Math.sin((midAngle * Math.PI) / 180)}
                    y={radius - (radius * 0.62) * Math.cos((midAngle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="20"
                  >
                    {seg.emoji}
                  </text>
                  <text
                    x={radius + (radius * 0.42) * Math.sin((midAngle * Math.PI) / 180)}
                    y={radius - (radius * 0.42) * Math.cos((midAngle * Math.PI) / 180)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9"
                    fontWeight="bold"
                    fill={seg.textColor}
                  >
                    {seg.label}
                  </text>
                </svg>
              )
            })}
          </motion.div>

          {/* Center button (on top of wheel) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSpin(false)}
            disabled={spinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-bold text-sm shadow-xl border-4 border-white flex flex-col items-center justify-center disabled:opacity-50"
          >
            {spinning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RotateCcw className="w-6 h-6" />
              </motion.div>
            ) : (
              <>
                <span className="text-lg">🎰</span>
                <span className="text-[10px] font-bold">
                  {freeSpins > 0 ? 'SPIN!' : '5💎'}
                </span>
              </>
            )}
          </motion.button>
        </div>

        {/* Tick marks container (decorative) */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={spinning ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.15, repeat: spinning ? Infinity : 0 }}
            className="flex items-center gap-2"
          >
            {spinning && <span className="text-2xl animate-bounce">🎲</span>}
          </motion.div>
        </div>

        {/* Extra spin button */}
        {freeSpins === 0 && !spinning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => handleSpin(true)}
              disabled={(user?.gems || 0) < 5}
              className="rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white font-semibold shadow-lg hover:shadow-xl"
            >
              <Gem className="w-4 h-4 mr-2" />
              Extra Spin (5 Gems)
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your gems: {user?.gems || 0}
            </p>
          </motion.div>
        )}

        {/* Mystery box link */}
        <Button
          variant="outline"
          onClick={() => { playClick(); navigateTo('mystery-box') }}
          className="rounded-full"
        >
          <Gift className="w-4 h-4 mr-2" />
          Open Mystery Boxes
        </Button>
      </div>

      {/* Result Popup */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResult(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
            >
              {/* Confetti */}
              {result.rewardType !== 'NOTHING' && (
                <>
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: -Math.random() * 300,
                        opacity: 0,
                        rotate: Math.random() * 720,
                      }}
                      transition={{ duration: 1.5, delay: i * 0.05 }}
                      className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
                    >
                      {['🎉', '✨', '🌟', '💫', '🎊'][i % 5]}
                    </motion.div>
                  ))}
                </>
              )}

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-6xl mb-4"
                >
                  {result.rewardType === 'NOTHING' ? '😅' :
                   result.rewardType === 'GEMS' ? '💎' :
                   result.rewardType === 'XP' ? '⚡' :
                   result.rewardType === 'HEARTS' ? '❤️' :
                   result.rewardType === 'STREAK_FREEZE' ? '❄️' : '🎁'}
                </motion.div>

                <h3 className="text-2xl font-bold mb-2">
                  {result.rewardType === 'NOTHING' ? 'Better luck next time!' : 'Congratulations!'}
                </h3>

                <p className="text-lg text-muted-foreground mb-6">
                  {result.rewardName}
                </p>

                {result.rewardType !== 'NOTHING' && (
                  <div className="flex justify-center gap-4 mb-6">
                    {result.rewardType === 'GEMS' && (
                      <Badge className="bg-blue-100 text-blue-700 px-3 py-1 text-sm">
                        <Gem className="w-3.5 h-3.5 mr-1" />+{result.rewardAmount}
                      </Badge>
                    )}
                    {result.rewardType === 'XP' && (
                      <Badge className="bg-amber-100 text-amber-700 px-3 py-1 text-sm">
                        <Zap className="w-3.5 h-3.5 mr-1" />+{result.rewardAmount}
                      </Badge>
                    )}
                    {result.rewardType === 'HEARTS' && (
                      <Badge className="bg-red-100 text-red-700 px-3 py-1 text-sm">
                        <Heart className="w-3.5 h-3.5 mr-1" />+{result.rewardAmount}
                      </Badge>
                    )}
                    {result.rewardType === 'STREAK_FREEZE' && (
                      <Badge className="bg-cyan-100 text-cyan-700 px-3 py-1 text-sm">
                        <Snowflake className="w-3.5 h-3.5 mr-1" />Activated!
                      </Badge>
                    )}
                    {result.rewardType === 'MYSTERY_BOX' && (
                      <Badge className="bg-purple-100 text-purple-700 px-3 py-1 text-sm">
                        <Gift className="w-3.5 h-3.5 mr-1" />Unlocked!
                      </Badge>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => setShowResult(false)}
                  className="rounded-full bg-[#008751] hover:bg-[#006B40] text-white w-full"
                >
                  {result.rewardType === 'NOTHING' ? 'Try Again Tomorrow' : 'Awesome!'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prize list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-muted/50 rounded-2xl p-4"
      >
        <h3 className="font-bold text-sm mb-3 text-center text-muted-foreground">Prize Pool</h3>
        <div className="grid grid-cols-2 gap-2">
          {SEGMENTS.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-sm bg-background rounded-lg px-3 py-2">
              <span>{seg.emoji}</span>
              <span className="font-medium">{seg.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
