'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Zap } from 'lucide-react'
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

function generateProblem(difficulty: string): MathProblem {
  let num1: number, num2: number, operation: string, answer: number

  if (difficulty === 'EASY') {
    num1 = Math.floor(Math.random() * 20) + 1
    num2 = Math.floor(Math.random() * 20) + 1
    operation = ['+', '-'][Math.floor(Math.random() * 2)]
  } else if (difficulty === 'MEDIUM') {
    num1 = Math.floor(Math.random() * 50) + 10
    num2 = Math.floor(Math.random() * 50) + 10
    operation = ['+', '-', '*'][Math.floor(Math.random() * 3)]
  } else {
    num1 = Math.floor(Math.random() * 100) + 50
    num2 = Math.floor(Math.random() * 100) + 50
    operation = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)]
  }

  switch (operation) {
    case '+': answer = num1 + num2; break
    case '-': answer = num1 - num2; break
    case '*': answer = num1 * num2; break
    case '/':
      while (num2 === 0 || num1 % num2 !== 0) {
        num1 = Math.floor(Math.random() * 100) + 50
        num2 = Math.floor(Math.random() * 12) + 2
      }
      answer = num1 / num2
      break
    default: answer = num1 + num2
  }

  const options = [answer]
  while (options.length < 4) {
    const wrong = answer + Math.floor(Math.random() * 20) - 10
    if (!options.includes(wrong) && wrong !== answer) {
      options.push(wrong)
    }
  }

  const question = difficulty === 'HARD' && operation === '/'
    ? `${num1} ÷ ${num2} = ?`
    : `${num1} ${operation} ${num2} = ?`

  return {
    question,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  }
}

export function MathChallengeGame({ onComplete, timeLimit = 120, difficulty }: MathChallengeGameProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(generateProblem(difficulty))
  const [score, setScore] = useState(0)
  const [questionNum, setQuestionNum] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)

  const TOTAL_QUESTIONS = 10

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (questionNum >= TOTAL_QUESTIONS) {
      setGameOver(true)
      onComplete(score, timeLimit - timeLeft)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          onComplete(score, timeLimit - 1)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver, timeLeft, score, timeLimit, questionNum, onComplete])

  const handleAnswer = (selected: number) => {
    if (gameOver) return

    if (selected === currentProblem.answer) {
      const points = 10 + streak * 2
      setScore(prev => prev + points)
      setStreak(prev => prev + 1)
      setFeedback('correct')
    } else {
      setStreak(0)
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setQuestionNum(prev => prev + 1)
      setCurrentProblem(generateProblem(difficulty))
    }, 1000)
  }

  const progress = (questionNum / TOTAL_QUESTIONS) * 100

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
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 30 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />
      <p className="text-center text-sm text-muted-foreground mb-4">Question {questionNum + 1}/{TOTAL_QUESTIONS}</p>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-center font-medium ${
              feedback === 'correct' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}
          >
            {feedback === 'correct' ? (
              <><Check className="w-4 h-4 inline mr-2" />Correct! +{10 + streak * 2} points</>
            ) : (
              <><X className="w-4 h-4 inline mr-2" />Wrong! The answer was {currentProblem.answer}</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-6">You scored {score} points</p>
            <Button onClick={() => {
              setScore(0)
              setQuestionNum(0)
              setTimeLeft(timeLimit)
              setGameOver(false)
              setCurrentProblem(generateProblem(difficulty))
              setStreak(0)
            }}>
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
