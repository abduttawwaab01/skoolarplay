'use client'

import { motion } from 'framer-motion'

interface LessonProgressBarProps {
  current: number
  total: number
}

export function LessonProgressBar({ current, total }: LessonProgressBarProps) {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-[#008751] rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  )
}
