'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { useSoundEffect } from '@/hooks/use-sound'

interface QuestionFeedbackProps {
  showFeedback: boolean
  isCorrect: boolean | null
  explanation?: string | null
}

export function QuestionFeedback({ showFeedback, isCorrect, explanation }: QuestionFeedbackProps) {
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')

  // Play sound when feedback first appears
  const hasPlayedRef = useRef(false)
  useEffect(() => {
    if (showFeedback && isCorrect !== null && !hasPlayedRef.current) {
      hasPlayedRef.current = true
      if (isCorrect) playCorrect()
      else playWrong()
    }
    if (!showFeedback) hasPlayedRef.current = false
  }, [showFeedback, isCorrect, playCorrect, playWrong])

  if (!showFeedback || isCorrect === null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: 10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <div
          className={`rounded-xl p-4 border-2 ${
            isCorrect
              ? 'bg-green-50 border-green-300 dark:bg-green-500/10 dark:border-green-500/30'
              : 'bg-red-50 border-red-300 dark:bg-red-500/10 dark:border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Correct! Well done!
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-700 dark:text-red-300">
                  Not quite right
                </span>
              </>
            )}
          </div>

          {!isCorrect && explanation && (
            <div className="flex items-start gap-2 mt-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
