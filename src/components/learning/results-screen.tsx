'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Zap, Gem, RotateCcw, Home, FileText, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSoundEffect } from '@/hooks/use-sound'
import { LessonReport } from '@/components/learning/lesson-report'
import { CelebrationOverlay } from '@/components/shared/celebration-overlay'

interface ResultsScreenProps {
  score: number
  total: number
  xpEarned: number
  gemsEarned: number
  onContinue: () => void
  onRetry: () => void
  lessonReport?: any
  lessonTitle?: string
  passed?: boolean
  cutoffScore?: number
}

function getStars(percentage: number): number {
  if (percentage >= 90) return 3
  if (percentage >= 60) return 2
  return 1
}

export function ResultsScreen({
  score,
  total,
  xpEarned,
  gemsEarned,
  onContinue,
  onRetry,
  lessonReport,
  lessonTitle,
  passed,
  cutoffScore,
}: ResultsScreenProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const stars = getStars(percentage)
  const isPassed = passed !== undefined ? passed : percentage >= 60
  const cutoff = cutoffScore || 60
  const [showReport, setShowReport] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const playAchievement = useSoundEffect('achievement')
  const playLevelUp = useSoundEffect('levelUp')
  const playGemCollect = useSoundEffect('gemCollect')
  const playXpGain = useSoundEffect('xpGain')

  // Play sounds and trigger celebration when results appear
  useEffect(() => {
    if (isPassed) {
      playAchievement()
      if (percentage >= 90) playLevelUp()
      playGemCollect()
      playXpGain()
      // Trigger celebration after a short delay
      const timer = setTimeout(() => setShowCelebration(true), 300)
      return () => clearTimeout(timer)
    }
  }, [score, total, xpEarned, gemsEarned, isPassed])

  const cutoffFailed = !isPassed && cutoff > 60

  return (
    <>
      {/* Celebration overlay */}
      {showCelebration && (
        <CelebrationOverlay
          onComplete={() => setShowCelebration(false)}
          duration={3500}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showReport && lessonReport ? (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg my-8"
            >
              <LessonReport
                report={lessonReport}
                lessonTitle={lessonTitle}
                xpEarned={xpEarned}
                gemsEarned={gemsEarned}
                onRetry={onRetry}
                onContinue={onContinue}
              />
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowReport(false)}
                >
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Back to Results
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
              className={`w-full max-w-sm rounded-3xl shadow-xl border-2 p-6 md:p-8 text-center relative overflow-hidden ${
                isPassed ? 'bg-card border-primary/20' : cutoffFailed ? 'bg-card border-red-500/40' : 'bg-card border-destructive/30'
              }`}
            >
              {/* Background decoration */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${
                isPassed ? 'from-[#008751]/10 to-transparent' : cutoffFailed ? 'from-red-500/10 to-transparent' : 'from-destructive/10 to-transparent'
              }`} />

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                  className="mx-auto mb-4"
                >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${
                    isPassed
                      ? 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]'
                      : cutoffFailed
                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                    {isPassed ? (
                      <Trophy className="w-10 h-10 text-white" />
                    ) : cutoffFailed ? (
                      <AlertTriangle className="w-10 h-10 text-white" />
                    ) : (
                      <RotateCcw className="w-10 h-10 text-white" />
                    )}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-1"
                >
                  {cutoffFailed ? 'RETAKE REQUIRED' : isPassed ? (lessonTitle?.toLowerCase().includes('review') ? 'Review Complete!' : 'Lesson Complete!') : 'Keep Trying!'}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-sm mb-4"
                >
                  {cutoffFailed
                    ? `You scored ${percentage}% but need ${cutoff}% to pass.`
                    : isPassed ? 'Great job on your progress!' : "Don't worry, practice makes perfect!"
                  }
                </motion.p>

                {/* Cutoff info banner */}
                {cutoffFailed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.5 }}
                    className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                  >
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Cutoff Score: {cutoff}%
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      Your score of {percentage}% did not meet the minimum required. Study the material and try again!
                    </p>
                  </motion.div>
                )}

                {/* Stars - only show when passed */}
                {isPassed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    {[1, 2, 3].map((s) => (
                      <motion.div
                        key={s}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{
                          scale: s <= stars ? 1 : 0.7,
                          rotate: 0,
                          opacity: s <= stars ? 1 : 0.3,
                        }}
                        transition={{ delay: 0.6 + s * 0.2, type: 'spring', bounce: 0.4 }}
                      >
                        <Star
                          className={`w-10 h-10 ${
                            s <= stars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-muted/50 rounded-2xl p-4 mb-4"
                >
                  <p className="text-3xl font-bold text-[#008751]">
                    {score}/{total}
                  </p>
                  <p className="text-sm text-muted-foreground">Questions correct</p>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isPassed ? 'bg-[#008751]' : cutoffFailed ? 'bg-red-500' : 'bg-destructive'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                    {cutoff > 60 && (
                      <p className="text-xs text-muted-foreground">Cutoff: {cutoff}%</p>
                    )}
                  </div>
                </motion.div>

                {/* Rewards - only show when passed */}
                {isPassed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex items-center justify-center gap-6 mb-6"
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        className="flex items-center gap-1 text-[#008751] font-bold text-lg"
                      >
                        <Zap className="w-5 h-5" />
                        +{xpEarned}
                      </motion.div>
                      <p className="text-xs text-muted-foreground">XP earned</p>
                    </div>

                    <div className="w-px h-10 bg-border" />

                    <div className="text-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                        className="flex items-center gap-1 text-[#F59E0B] font-bold text-lg"
                      >
                        <Gem className="w-5 h-5" />
                        +{gemsEarned}
                      </motion.div>
                      <p className="text-xs text-muted-foreground">Gems earned</p>
                    </div>
                  </motion.div>
                )}

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                  className="space-y-3"
                >
                  {!isPassed ? (
                    <>
                      <Button
                        onClick={onRetry}
                        className="w-full h-12 rounded-full text-base font-semibold bg-primary hover:bg-primary/90"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      <Button
                        onClick={onContinue}
                        variant="outline"
                        className="w-full h-12 rounded-full text-base font-semibold"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Back to Course
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={onContinue}
                        className="w-full h-12 rounded-full text-base font-semibold bg-[#008751] hover:bg-[#008751]/90"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </>
                  )}

                  {lessonReport && (
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => setShowReport(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Detailed Report
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
