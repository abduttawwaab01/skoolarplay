'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  RotateCcw,
  Zap,
  Gem,
  Star,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface LessonNoteQuizResultsProps {
  score: number
  total: number
  xpEarned: number
  gemsEarned: number
  passed: boolean
  lessonTitle: string
  passingScore: number
  onContinue: () => void
  onRetry: () => void
}

export function LessonNoteQuizResults({
  score,
  total,
  xpEarned,
  gemsEarned,
  passed,
  lessonTitle,
  passingScore,
  onContinue,
  onRetry,
}: LessonNoteQuizResultsProps) {
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
    if (!passed) return
    
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
  }, [xpEarned, gemsEarned, passed])

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
              <h2 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Quiz Results
              </h2>
              <span className="text-sm text-muted-foreground">{lessonTitle}</span>
            </div>

            {/* Score Display */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 mb-6 text-center">
              <div className="text-5xl font-bold mb-2">
                <span className={passed ? 'text-green-500' : 'text-amber-500'}>{percentage}%</span>
              </div>
              <p className="text-muted-foreground">
                {correctCount}/{total} questions correct
              </p>
              {!passed && (
                <div className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                  Passing score: {passingScore}%
                </div>
              )}
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
                  <Trophy className="w-5 h-5 text-primary" />
                  Rewards Earned
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* XP */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-4 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Zap className="w-6 h-6 text-amber-500" />
                      <span className="text-3xl font-bold">+{animatedXp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">XP Earned</p>
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
                    <p className="text-sm text-muted-foreground">Gems Earned</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: passed ? 1.6 : 1 }}
          className="flex gap-3"
        >
          <Button
            onClick={passed ? onContinue : onRetry}
            className={`flex-1 h-14 rounded-xl font-semibold text-base ${
              passed 
                ? 'bg-gradient-to-r from-[#008751] to-[#005E38] hover:shadow-lg' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {passed ? (
              <>
                Continue Learning
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </>
            )}
          </Button>
          
          {passed && (
            <Button
              onClick={onContinue}
              variant="outline"
              className="h-14 rounded-xl font-semibold text-base"
            >
              Back to Course
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
