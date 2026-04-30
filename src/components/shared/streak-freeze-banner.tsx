'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Snowflake, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'

interface StreakFreezeData {
  streakProtected: boolean
  message: string
  streak: number
  freezeUsed: boolean
  remainingFreezes: number
}

export function StreakFreezeBanner() {
  const [data, setData] = useState<StreakFreezeData | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const { navigateTo } = useAppStore()

  useEffect(() => {
    // Check session storage to avoid repeated calls
    const sessionKey = 'skoolarplay_freeze_checked'
    const lastChecked = sessionStorage.getItem(sessionKey)

    if (lastChecked) return

    async function checkStreakFreeze() {
      try {
        const res = await fetch('/api/streak/freeze', { method: 'POST' })
        if (res.ok) {
          const json = await res.json()
          if (json.streakProtected) {
            setData(json)
            sessionStorage.setItem(sessionKey, 'true')
          }
        }
      } catch (error) {
        console.error('Failed to check streak freeze:', error)
      }
    }
    checkStreakFreeze()
  }, [])

  if (dismissed || !data) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Animated snowflake */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="w-12 h-12 rounded-xl bg-sky-500/15 flex items-center justify-center"
                >
                  <Snowflake className="w-6 h-6 text-sky-500" />
                </motion.div>
                {/* Snowflake particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -15, -30],
                      opacity: [1, 0.5, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * 10],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: i * 0.6,
                      delay: i * 0.4,
                    }}
                    className="absolute top-0 left-1/2 text-sky-400 text-[8px]"
                    style={{ left: `${40 + i * 8}%` }}
                  >
                    ❄
                  </motion.div>
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold text-sm text-sky-700">Streak Protected!</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.message}
                </p>

                {data.remainingFreezes === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDismissed(true)
                      navigateTo('shop')
                    }}
                    className="mt-2 rounded-full text-xs border-sky-200 text-sky-600 hover:bg-sky-50"
                  >
                    Get More Freezes
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-muted-foreground text-xs shrink-0"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
