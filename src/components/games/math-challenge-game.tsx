'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface MathChallengeGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

interface MathProblem {
  question: string
  answer: number
  options: number[]
}

function generateProblem(difficulty: string, solvedCount: number): MathProblem {
  let num1: number, num2: number, num3: number, operation: string, answer: number

  const tier = Math.floor(solvedCount / 10)
  const progressFactor = 1 + (solvedCount * 0.08)

  if (difficulty === 'EASY') {
    const maxNum = 20 + tier * 5
    num1 = Math.floor(Math.random() * maxNum) + 1
    num2 = Math.floor(Math.random() * maxNum) + 1
    operation = tier >= 2 ? ['+', '-'][Math.floor(Math.random() * 2)] : ['+', '-'][Math.floor(Math.random() * 2)]
  } else if (difficulty === 'MEDIUM') {
    const maxNum = 50 + tier * 20
    num1 = Math.floor(Math.random() * maxNum) + 10
    num2 = Math.floor(Math.random() * maxNum) + 10
    const ops = tier >= 3 ? ['+', '-', '*'] : ['+', '-', '*']
    operation = ops[Math.floor(Math.random() * ops.length)]
  } else if (difficulty === 'HARD') {
    const maxNum = 100 + tier * 50
    num1 = Math.floor(Math.random() * maxNum) + 50
    num2 = Math.floor(Math.random() * maxNum) + 50
    const ops = tier >= 2 ? ['+', '-', '*', '/'] : ['+', '-', '*', '/']
    operation = ops[Math.floor(Math.random() * ops.length)]
  } else {
    const maxNum = 200 + tier * 100
    num1 = Math.floor(Math.random() * maxNum) + 100
    num2 = Math.floor(Math.random() * maxNum) + 100
    const ops = tier >= 3 ? ['+', '-', '*', '/', '%'] : ['+', '-', '*', '/', '%']
    operation = ops[Math.floor(Math.random() * ops.length)]
  }

  switch (operation) {
    case '+': answer = num1 + num2; break
    case '-': answer = num1 - num2; break
    case '*':
      const maxMul = difficulty === 'MEDIUM' ? 15 + tier * 3 : difficulty === 'HARD' ? 25 + tier * 5 : 30 + tier * 5
      num1 = Math.floor(Math.random() * maxMul) + 2
      num2 = Math.floor(Math.random() * maxMul) + 2
      answer = num1 * num2
      break
    case '/':
      num2 = Math.floor(Math.random() * (12 + tier * 3)) + 2
      answer = Math.floor(Math.random() * (20 + tier * 5)) + 2
      num1 = num2 * answer
      break
    case '%':
      num2 = Math.floor(Math.random() * (15 + tier * 5)) + 3
      num1 = Math.floor(Math.random() * (200 + tier * 100)) + 100
      answer = num1 % num2
      break
    default: answer = num1 + num2
  }

  const options = [answer]
  while (options.length < 4) {
    const spread = Math.max(10, Math.abs(answer) * 0.3)
    const wrong = answer + Math.floor(Math.random() * spread * 2) - Math.floor(spread)
    if (!options.includes(wrong) && wrong !== answer) {
      options.push(wrong)
    }
  }

  let question: string
  switch (operation) {
    case '+': question = `${num1} + ${num2} = ?`; break
    case '-': question = `${num1} - ${num2} = ?`; break
    case '*': question = `${num1} × ${num2} = ?`; break
    case '/': question = `${num1} ÷ ${num2} = ?`; break
    case '%': question = `${num1} % ${num2} = ?`; break
    default: question = `${num1} + ${num2} = ?`
  }

  return { question, answer, options: options.sort(() => Math.random() - 0.5) }
}

export function MathChallengeGame({ onComplete, timeLimit = 120, difficulty }: MathChallengeGameProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => generateProblem(difficulty, 0))
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; answer?: number } | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const startTimeRef = useRef(Date.now())

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

  const handleAnswer = (selected: number) => {
    if (gameOver || feedback) return

    if (selected === currentProblem.answer) {
      const difficultyMultiplier = difficulty === 'EXPERT' ? 3 : difficulty === 'HARD' ? 2 : difficulty === 'MEDIUM' ? 1.5 : 1
      const streakBonus = Math.min(streak, 20)
      const points = Math.round((10 + streakBonus * 3) * difficultyMultiplier)
      setScore(prev => prev + points)
      setSolved(prev => prev + 1)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
      setFeedback({ correct: true })
    } else {
      setStreak(0)
      setWrong(prev => prev + 1)
      setFeedback({ correct: false, answer: currentProblem.answer })
    }

    setTimeout(() => {
      setFeedback(null)
      const next = solved + 1
      setCurrentProblem(generateProblem(difficulty, next))
    }, 800)
  }

  const restart = () => {
    setScore(0)
    setSolved(0)
    setWrong(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setCurrentProblem(generateProblem(difficulty, 0))
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    startTimeRef.current = Date.now()
  }

  const tier = Math.floor(solved / 10)
  const accuracy = solved + wrong > 0 ? Math.round((solved / (solved + wrong)) * 100) : 100

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
            Tier {tier + 1}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 30 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Solved: {solved}</span>
        <span>Accuracy: {accuracy}%</span>
        <span>Best Streak: {bestStreak}</span>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-center font-medium ${
              feedback.correct ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}
          >
            {feedback.correct ? (
              <><Check className="w-4 h-4 inline mr-2" />Correct!</>
            ) : (
              <><X className="w-4 h-4 inline mr-2" />Wrong! Answer: {feedback.answer}</>
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
              <p className="text-muted-foreground">Solved: <span className="font-bold text-green-600">{solved}</span></p>
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
            <h2 className="text-3xl font-bold text-center mb-8">{currentProblem.question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {currentProblem.options.map((option, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="w-full h-16 text-xl font-bold"
                    variant="outline"
                    onClick={() => handleAnswer(option)}
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
