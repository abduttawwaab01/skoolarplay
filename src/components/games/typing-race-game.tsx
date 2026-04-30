'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface TypingRaceGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

const EASY_SENTENCES = [
  'The cat sat on the mat.',
  'I love to learn new things.',
  'Practice makes perfect every day.',
  'Coding is fun and rewarding.',
  'Keep going and never give up.',
]

const MEDIUM_SENTENCES = [
  'The quick brown fox jumps over the lazy dog near the river.',
  'Education is the passport to the future for tomorrow belongs to those who prepare today.',
  'Success is not final, failure is not fatal: it is the courage to continue that counts.',
  'The greatest glory in living lies not in never falling, but in rising every time we fall.',
]

export function TypingRaceGame({ onComplete, timeLimit = 60, difficulty }: TypingRaceGameProps) {
  const sentences = difficulty === 'HARD' ? MEDIUM_SENTENCES : EASY_SENTENCES
  const [currentSentence, setCurrentSentence] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const TOTAL = 5

  const initGame = () => {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)]
    setCurrentSentence(sentence)
    setInput('')
    setStartTime(Date.now())
  }

  useEffect(() => {
    initGame()
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (completed >= TOTAL) {
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
  }, [gameOver, timeLeft, score, timeLimit, completed, onComplete])

  const handleInput = (value: string) => {
    setInput(value)
    if (!startTime) setStartTime(Date.now())

    if (value === currentSentence) {
      const timeTaken = (Date.now() - startTime!) / 1000
      const wpm = Math.round((currentSentence.length / 5) / (timeTaken / 60))
      const points = Math.max(10, Math.round(wpm / 2))
      setScore(prev => prev + points)
      setCompleted(prev => prev + 1)
      setInput('')
      initGame()
    }
  }

  const progress = (completed / TOTAL) * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium">
            Completed: <span className="text-green-600 font-bold">{completed}/{TOTAL}</span>
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

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-6">You completed {completed} sentences</p>
            <Button onClick={() => {
              setScore(0)
              setCompleted(0)
              setTimeLeft(timeLimit)
              setGameOver(false)
              initGame()
            }}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Type this sentence:</p>
              <p className="text-xl font-mono bg-muted p-4 rounded-lg">{currentSentence}</p>
            </div>

            <div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => handleInput(e.target.value)}
                className="w-full p-4 text-lg border-2 rounded-lg focus:outline-none focus:border-primary font-mono"
                placeholder="Start typing here..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div className="mt-2">
                <Progress
                  value={(input.length / currentSentence.length) * 100}
                  className="h-1"
                />
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {input.length}/{currentSentence.length} characters
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
