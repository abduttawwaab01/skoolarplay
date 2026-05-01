'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { QUIZ_EASY, QUIZ_MEDIUM, QUIZ_HARD, QUIZ_EXPERT, QuizQuestion } from '@/lib/game-word-bank'

const POOLS: Record<string, QuizQuestion[]> = {
  EASY: QUIZ_EASY,
  MEDIUM: QUIZ_MEDIUM,
  HARD: QUIZ_HARD,
  EXPERT: QUIZ_EXPERT,
}

function getNextTierPool(difficulty: string, answered: number): QuizQuestion[] {
  const tiers = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  const baseIdx = tiers.indexOf(difficulty)
  const tierIdx = Math.min(baseIdx + Math.floor(answered / 20), tiers.length - 1)
  return POOLS[tiers[tierIdx]] ?? QUIZ_EASY
}

function getRandomQuestions(pool: QuizQuestion[], count: number, excludeIds: Set<number>): QuizQuestion[] {
  const available = pool.filter((_, idx) => !excludeIds.has(idx))
  if (available.length === 0) return pool.sort(() => Math.random() - 0.5).slice(0, count)
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, available.length))
}

export function QuizRaceGame({ onComplete, timeLimit = 90, difficulty }: {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [usedIds, setUsedIds] = useState<Set<number>>(new Set())
  const startTimeRef = useRef(Date.now())

  const loadQuestions = useCallback((currentAnswered: number, currentUsedIds: Set<number>) => {
    const pool = getNextTierPool(difficulty, currentAnswered)
    const newQs = getRandomQuestions(pool, 5, currentUsedIds)
    setQuestions(newQs)
    setCurrentQ(0)
  }, [difficulty])

  useEffect(() => {
    loadQuestions(0, new Set())
  }, [loadQuestions])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          onComplete(score, Math.floor((Date.now() - startTimeRef.current) / 1000))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, timeLeft, score, timeLimit, onComplete])

  const handleAnswer = (idx: number) => {
    if (gameOver || feedback) return

    const q = questions[currentQ]
    if (idx === q.correctAnswer) {
      const difficultyMultiplier = difficulty === 'EXPERT' ? 3 : difficulty === 'HARD' ? 2 : difficulty === 'MEDIUM' ? 1.5 : 1
      const streakBonus = Math.min(streak, 20)
      const points = Math.round((10 + streakBonus * 3) * difficultyMultiplier)
      setScore(prev => prev + points)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
      setFeedback({ correct: true, message: `+${points} points!` })
    } else {
      setStreak(0)
      setWrong(prev => prev + 1)
      setFeedback({ correct: false, message: `Answer: ${q.options[q.correctAnswer]}` })
    }

    const newAnswered = answered + 1
    setAnswered(newAnswered)
    setUsedIds(prev => new Set([...prev, ...questions.map((_, i) => i)]))

    setTimeout(() => {
      setFeedback(null)
      const nextQ = currentQ + 1
      if (nextQ >= questions.length) {
        loadQuestions(newAnswered, new Set([...usedIds, ...questions.map((_, i) => i)]))
      } else {
        setCurrentQ(nextQ)
      }
    }, 1200)
  }

  const restart = () => {
    setScore(0)
    setAnswered(0)
    setWrong(0)
    setCurrentQ(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    setUsedIds(new Set())
    startTimeRef.current = Date.now()
    loadQuestions(0, new Set())
  }

  const progress = Math.min((answered / 50) * 100, 100)
  const accuracy = answered > 0 ? Math.round(((answered - wrong) / answered) * 100) : 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Streak: <span className="text-amber-600 font-bold">{streak}</span>
          </div>
          <div className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Answered: <span className="text-green-600 font-bold">{answered}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 15 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Accuracy: {accuracy}%</span>
        <span>Best Streak: {bestStreak}</span>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-center font-medium ${
              feedback.correct ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}
          >
            {feedback.correct ? (
              <><Check className="w-4 h-4 inline mr-2" />{feedback.message}</>
            ) : (
              <><X className="w-4 h-4 inline mr-2" />{feedback.message}</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">Answered: <span className="font-bold text-green-600">{answered}</span></p>
              <p className="text-muted-foreground">Wrong: <span className="font-bold text-red-600">{wrong}</span></p>
              <p className="text-muted-foreground">Accuracy: <span className="font-bold">{accuracy}%</span></p>
              <p className="text-muted-foreground">Best Streak: <span className="font-bold text-amber-600">{bestStreak}</span></p>
              <p className="text-2xl font-bold text-primary mt-4">Score: {score}</p>
            </div>
            <Button onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">{questions[currentQ]?.question}</h2>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQ]?.options.map((option, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full h-14 text-lg"
                    variant="outline"
                    onClick={() => handleAnswer(idx)}
                    disabled={feedback !== null}
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
