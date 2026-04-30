'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  RotateCcw,
  Zap,
  Gem,
  Star,
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface VideoQuizResultsProps {
  score: number
  total: number
  xpEarned: number
  gemsEarned: number
  leveledUp: boolean
  newLevel: number
  passed: boolean
  videoTitle: string
  onContinue: () => void
  onRetry: () => void
}

export function VideoQuizResults({
  score,
  total,
  xpEarned,
  gemsEarned,
  leveledUp,
  newLevel,
  passed,
  videoTitle,
  onContinue,
  onRetry,
}: VideoQuizResultsProps) {
  const [animatedXp, setAnimatedXp] = useState(0)
  const [animatedGems, setAnimatedGems] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const correctCount = score
  const incorrectCount = total - score

  // Calculate star rating (1-3 stars)
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : 1

  // Performance message
  const getPerformanceMessage = () => {
    if (percentage >= 90) return { emoji: '🎉', title: 'Outstanding!', subtitle: 'You nailed it!' }
    if (percentage >= 80) return { emoji: '👏', title: 'Great Job!', subtitle: 'Almost perfect!' }
    if (percentage >= 70) return { emoji: '💪', title: 'Good Work!', subtitle: 'Keep it up!' }
    if (percentage >= 60) return { emoji: '👍', title: 'Not Bad!', subtitle: 'You passed!' }
    return { emoji: '📚', title: 'Keep Learning!', subtitle: 'Practice makes perfect' }
  }

  const performance = getPerformanceMessage()

  // Animate XP and Gems
  useEffect(() => {
    const duration = 1500
    const steps = 60
    const xpIncrement = xpEarned / steps
    const gemIncrement = gemsEarned / steps
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      setAnimatedXp(Math.min(Math.round(xpIncrement * currentStep), xpEarned))
      setAnimatedGems(Math.min(Math.round(gemIncrement * currentStep), gemsEarned))

      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedXp(xpEarned)
        setAnimatedGems(gemsEarned)
        setShowConfetti(true)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [xpEarned, gemsEarned])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && passed && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * 100 + 'vw',
                y: -20,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: '100vh',
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: 'easeIn',
              }}
              className={`absolute w-3 h-3 rounded-sm ${
                ['bg-primary', 'bg-amber-500', 'bg-green-500', 'bg-pink-500', 'bg-blue-500'][
                  Math.floor(Math.random() * 5)
                ]
              }`}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Header Section */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
            passed 
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30' 
              : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30'
          }`}>
            {passed ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <Target className="w-12 h-12 text-white" />
            )}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-5xl mb-2 block">{performance.emoji}</span>
            <h1 className="text-3xl font-bold mb-1">{performance.title}</h1>
            <p className="text-muted-foreground">{performance.subtitle}</p>
          </motion.div>
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2 mb-6"
        >
          {[1, 2, 3].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6 + star * 0.1, type: 'spring', stiffness: 200 }}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= stars
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                }`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Score Card */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Quiz Results</h2>
              <span className="text-sm text-muted-foreground">{videoTitle}</span>
            </div>

            {/* Score Circle */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="12"
                  stroke="currentColor"
                  className="text-muted"
                  fill="none"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  strokeWidth="12"
                  stroke="currentColor"
                  className={passed ? 'text-green-500' : 'text-amber-500'}
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0, 440' }}
                  animate={{ strokeDasharray: `${(percentage / 100) * 440}, 440` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-bold"
                >
                  {percentage}%
                </motion.span>
                <span className="text-sm text-muted-foreground">
                  {correctCount}/{total} correct
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-4 text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{incorrectCount}</p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Card */}
        {passed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="mb-6 overflow-hidden border-2 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Rewards Earned
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* XP */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-6 h-6 text-primary" />
                      <span className="text-3xl font-bold">+{animatedXp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Experience Points</p>
                  </motion.div>

                  {/* Gems */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: 'spring' }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Gem className="w-6 h-6 text-blue-500" />
                      <span className="text-3xl font-bold">+{animatedGems}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Skoolar Gems</p>
                  </motion.div>
                </div>

                {/* Level Up Badge */}
                {leveledUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 }}
                    className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-white">
                      <TrendingUp className="w-6 h-6" />
                      <span className="text-lg font-bold">Level Up!</span>
                    </div>
                    <p className="text-white/80 text-sm mt-1">
                      You reached Level {newLevel}!
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Tip */}
        {passed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Keep the momentum going!</p>
                  <p className="text-xs text-muted-foreground">Watch more videos to improve your skills</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="flex gap-3"
        >
          {passed ? (
            <Button
              onClick={onContinue}
              className="flex-1 h-14 rounded-xl font-semibold text-base bg-gradient-to-r from-[#008751] to-[#005E38] hover:shadow-lg"
            >
              Continue Learning
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <>
              <Button
                onClick={onRetry}
                variant="outline"
                className="flex-1 h-14 rounded-xl font-semibold text-base"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={onContinue}
                className="flex-1 h-14 rounded-xl font-semibold text-base"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
