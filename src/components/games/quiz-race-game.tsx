'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  hint?: string
}

const EASY_QUESTIONS: QuizQuestion[] = [
  { question: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], correctAnswer: 2, hint: 'City of Light' },
  { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1, hint: 'Named after Roman god of war' },
  { question: 'What is H2O?', options: ['Oxygen', 'Hydrogen', 'Water', 'Salt'], correctAnswer: 2, hint: 'Essential for life' },
  { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctAnswer: 2, hint: 'Includes Africa, Asia, Europe...' },
  { question: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2, hint: 'CO2' },
]

export function QuizRaceGame({ onComplete, timeLimit = 60, difficulty }: {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}) {
  const questions = EASY_QUESTIONS
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (currentQ >= questions.length) {
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
  }, [gameOver, timeLeft, score, timeLimit, currentQ, onComplete])

  const handleAnswer = (idx: number) => {
    if (gameOver || feedback) return

    const q = questions[currentQ]
    if (idx === q.correctAnswer) {
      const points = 10 + streak * 5
      setScore(prev => prev + points)
      setStreak(prev => prev + 1)
      setFeedback({ correct: true, message: `+${points} points!` })
    } else {
      setStreak(0)
      setFeedback({ correct: false, message: `Correct: ${q.options[q.correctAnswer]}` })
    }

    setTimeout(() => {
      setFeedback(null)
      setCurrentQ(prev => prev + 1)
    }, 1500)
  }

  const progress = (currentQ / questions.length) * 100

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
          <span className={`font-mono ${timeLeft < 15 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />
      <p className="text-center text-sm text-muted-foreground mb-4">Question {currentQ + 1}/{questions.length}</p>

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
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-6">You scored {score} points</p>
            <Button onClick={() => {
              setScore(0)
              setCurrentQ(0)
              setTimeLeft(timeLimit)
              setGameOver(false)
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
            <h2 className="text-2xl font-bold text-center mb-8">{questions[currentQ].question}</h2>
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQ].options.map((option, idx) => (
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
            {questions[currentQ].hint && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Hint: {questions[currentQ].hint}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
