'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Gem, Zap, Heart, Snowflake, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

interface MysteryBoxItem {
  id: string
  rewardType: string
  rewardAmount: number
  rewardName: string
  openedAt: string
}

interface OpenResult {
  type: string
  amount: number
  name: string
  isRare: boolean
}

const REWARD_ICONS: Record<string, React.ReactNode> = {
  GEMS: <Gem className="w-8 h-8 text-blue-500" />,
  XP: <Zap className="w-8 h-8 text-amber-500" />,
  HEARTS: <Heart className="w-8 h-8 text-red-500" />,
  STREAK_FREEZE: <Snowflake className="w-8 h-8 text-cyan-500" />,
  DOUBLE_XP: <Sparkles className="w-8 h-8 text-purple-500" />,
}

export function MysteryBoxPage() {
  const { user, updateGems, updateXP, updateUser } = useAuthStore()
  const { navigateTo } = useAppStore()
  const playMysteryBox = useSoundEffect('mysteryBox')
  const playGemCollect = useSoundEffect('gemCollect')
  const playXpGain = useSoundEffect('xpGain')
  const playClick = useSoundEffect('click')
  const [boxes, setBoxes] = useState<MysteryBoxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [opening, setOpening] = useState<string | null>(null)
  const [openingBox, setOpeningBox] = useState(false)
  const [result, setResult] = useState<OpenResult | null>(null)
  const [flipped, setFlipped] = useState(false)

  const fetchBoxes = useCallback(async () => {
    try {
      const res = await fetch('/api/spin/status')
      const data = await res.json()
      if (data.mysteryBoxesAvailable > 0) {
        // We show count from status, but boxes are opened one at a time via the open API
        setBoxes(Array.from({ length: data.mysteryBoxesAvailable }, (_, i) => ({
          id: `box-${i}-${Date.now()}`,
          rewardType: 'PENDING',
          rewardAmount: 0,
          rewardName: 'Unopened Mystery Box',
          openedAt: new Date().toISOString(),
        })))
      } else {
        setBoxes([])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoxes()
  }, [fetchBoxes])

  const handleOpen = async () => {
    if (openingBox) return

    setOpeningBox(true)
    setFlipped(false)
    setResult(null)
    playMysteryBox()

    try {
      const res = await fetch('/api/mystery-box/open', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to open box')
        setOpeningBox(false)
        return
      }

      if (data.user) {
        if (data.user.gems !== user?.gems) updateGems(data.user.gems - (user?.gems || 0))
        if (data.user.xp !== user?.xp) updateXP(data.user.xp - (user?.xp || 0))
      }

      setTimeout(() => {
        setResult(data.reward)
        setFlipped(true)
        setOpeningBox(false)
        if (data.reward?.type === 'GEMS') playGemCollect()
        if (data.reward?.type === 'XP') playXpGain()
      }, 800)
    } catch {
      toast.error('Failed to open box')
      setOpeningBox(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setFlipped(false)
    setBoxes((prev) => prev.slice(0, -1))
    fetchBoxes()
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
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
        className="relative rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl"
            >
              🎁
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Mystery Boxes</h1>
              <p className="text-white/80 text-sm">Open boxes for surprise rewards!</p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
            <p className="text-white/70 text-xs">Available</p>
            <p className="text-2xl font-bold">{boxes.length}</p>
          </div>
        </div>
      </motion.div>

      {/* Boxes Grid */}
      {boxes.length > 0 ? (
        <div className="space-y-6">
          {/* Current box to open */}
          <div className="flex justify-center">
            <div className="relative w-64 h-72">
              <AnimatePresence mode="wait">
                {!flipped ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: openingBox ? 90 : 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleOpen}
                      className="w-full h-full rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-xl flex flex-col items-center justify-center gap-4 border-4 border-[#F59E0B]/30 hover:border-[#F59E0B]"
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-7xl"
                      >
                        🎁
                      </motion.div>
                      <p className="text-white font-bold text-lg">Tap to Open!</p>
                      {openingBox && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RotateCcw className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -90 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                      className={`w-full h-full rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 p-6 text-center ${
                        result?.isRare
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-4 border-yellow-300'
                          : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {/* Glow effect for rare */}
                      {result?.isRare && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl bg-yellow-400/20 pointer-events-none"
                        />
                      )}

                      <div className="relative z-10">
                        {result?.type && REWARD_ICONS[result.type]}
                        <h3 className="text-2xl font-bold mt-2">
                          {result?.isRare && '⭐ '} {result?.name}
                        </h3>
                        {result?.isRare && (
                          <Badge className="mt-2 bg-yellow-200 text-yellow-800 border-0">
                            RARE!
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Remaining boxes preview */}
          {boxes.length > 1 && (
            <div className="flex justify-center gap-3">
              {boxes.slice(0, 5).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F59E0B]/30 to-[#D97706]/30 border-2 border-[#F59E0B]/20 flex items-center justify-center text-2xl"
                >
                  🎁
                </motion.div>
              ))}
              {boxes.length > 5 && (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  +{boxes.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Close button */}
          {flipped && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <Button onClick={() => { playClick(); handleClose() }} className="rounded-full bg-[#008751] hover:bg-[#006B40] text-white">
                Continue
              </Button>
            </motion.div>
          )}
        </div>
      ) : (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            📦
          </motion.div>
          <h3 className="text-xl font-bold mb-2">No mystery boxes yet!</h3>
          <p className="text-muted-foreground mb-6">
            Spin the wheel to win mystery boxes, or check daily rewards!
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => navigateTo('spin-wheel')}
              className="rounded-full bg-gradient-to-r from-[#008751] to-[#006B40] text-white"
            >
              🎰 Spin the Wheel
            </Button>
            <Button
              onClick={() => navigateTo('login-rewards')}
              variant="outline"
              className="rounded-full"
            >
              📅 Daily Rewards
            </Button>
          </div>
        </motion.div>
      )}

      {/* Possible rewards info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-muted/50 rounded-2xl p-4"
      >
        <h3 className="font-bold text-sm mb-3 text-center text-muted-foreground">Possible Rewards</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: '💎', label: 'Gems', desc: '10-100' },
            { icon: '⚡', label: 'XP', desc: '25-200' },
            { icon: '❤️', label: 'Hearts', desc: '1-3' },
            { icon: '❄️', label: 'Freeze', desc: 'Rare!' },
            { icon: '✨', label: 'Double XP', desc: 'Rare!' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 text-sm bg-background rounded-xl p-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
