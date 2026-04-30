'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useSoundEffect } from '@/hooks/use-sound'

interface HeartsDisplayProps {
  hearts: number
  maxHearts: number
}

export function HeartsDisplay({ hearts, maxHearts }: HeartsDisplayProps) {
  const playHeartsLost = useSoundEffect('heartsLost')
  const playOutOfHearts = useSoundEffect('outOfHearts')
  const prevHeartsRef = useRef(hearts)

  useEffect(() => {
    if (hearts < prevHeartsRef.current) {
      playHeartsLost()
      if (hearts === 0) playOutOfHearts()
    }
    prevHeartsRef.current = hearts
  }, [hearts, playHeartsLost, playOutOfHearts])
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxHearts }).map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            scale: i < hearts ? 1 : 0.85,
            opacity: i < hearts ? 1 : 0.3,
          }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-300 ${
              i < hearts ? 'fill-red-500 text-red-500' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </motion.div>
      ))}
    </div>
  )
}
