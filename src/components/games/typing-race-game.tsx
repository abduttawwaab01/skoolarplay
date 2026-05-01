'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RotateCcw, Trophy, TrendingUp, Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TYPING_EASY, TYPING_MEDIUM, TYPING_HARD, TYPING_EXPERT } from '@/lib/game-word-bank'

interface TypingRaceGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

const POOLS: Record<string, string[]> = {
  EASY: TYPING_EASY,
  MEDIUM: TYPING_MEDIUM,
  HARD: TYPING_HARD,
  EXPERT: TYPING_EXPERT,
}

function getNextTierPool(difficulty: string, completed: number): string[] {
  const tiers = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  const baseIdx = tiers.indexOf(difficulty)
  const tierIdx = Math.min(baseIdx + Math.floor(completed / 10), tiers.length - 1)
  return POOLS[tiers[tierIdx]] ?? TYPING_EASY
}

function getRandomSentence(pool: string[], exclude?: string): string {
  const available = exclude ? pool.filter(s => s !== exclude) : pool
  return available[Math.floor(Math.random() * available.length)]
}

export function TypingRaceGame({ onComplete, timeLimit = 90, difficulty }: TypingRaceGameProps) {
  const [currentSentence, setCurrentSentence] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [errors, setErrors] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [bestWpm, setBestWpm] = useState(0)
  const [totalChars, setTotalChars] = useState(0)
  const [streak, setStreak] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef(Date.now())

  const pickSentence = useCallback((currentCompleted: number, prevSentence?: string) => {
    const pool = getNextTierPool(difficulty, currentCompleted)
    const sentence = getRandomSentence(pool, prevSentence)
    setCurrentSentence(sentence)
    setInput('')
    setStartTime(null)
  }, [difficulty])

  useEffect(() => {
    pickSentence(0)
    inputRef.current?.focus()
  }, [pickSentence])

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

  const handleInput = (value: string) => {
    if (gameOver) return
    setInput(value)

    if (!startTime) {
      setStartTime(Date.now())
    }

    // Track errors in real-time
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentSentence[i]) {
        setErrors(prev => prev + 1)
        break
      }
    }

    if (value === currentSentence) {
      const timeTaken = (Date.now() - startTime!) / 1000
      const sentenceWpm = Math.round((currentSentence.length / 5) / (timeTaken / 60))
      const newWpm = completed === 0 ? sentenceWpm : Math.round((wpm + sentenceWpm) / 2)
      setWpm(newWpm)
      if (sentenceWpm > bestWpm) setBestWpm(sentenceWpm)

      const difficultyMultiplier = difficulty === 'EXPERT' ? 3 : difficulty === 'HARD' ? 2 : difficulty === 'MEDIUM' ? 1.5 : 1
      const accuracyFactor = Math.max(0.1, 1 - (errors / Math.max(value.length, 1)))
      const points = Math.max(5, Math.round(sentenceWpm * difficultyMultiplier * accuracyFactor))

      setScore(prev => prev + points)
      setTotalChars(prev => prev + currentSentence.length)
      const newCompleted = completed + 1
      setCompleted(newCompleted)
      setStreak(prev => prev + 1)
      setErrors(0)

      pickSentence(newCompleted, currentSentence)
    }
  }

  const restart = () => {
    setScore(0)
    setCompleted(0)
    setErrors(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setWpm(0)
    setBestWpm(0)
    setTotalChars(0)
    setStreak(0)
    setStartTime(null)
    startTimeRef.current = Date.now()
    pickSentence(0)
    inputRef.current?.focus()
  }

  const accuracy = totalChars > 0 ? Math.round(((totalChars - errors) / Math.max(totalChars, 1)) * 100) : 100
  const charProgress = currentSentence.length > 0 ? (input.length / currentSentence.length) * 100 : 0

  // Character-level highlighting
  const renderSentence = () => {
    return currentSentence.split('').map((char, idx) => {
      if (idx < input.length) {
        return input[idx] === char ? (
          <span key={idx} className="text-green-600">{char}</span>
        ) : (
          <span key={idx} className="text-red-600 bg-red-100">{char}</span>
        )
      }
      if (idx === input.length) {
        return <span key={idx} className="bg-primary/20 border-b-2 border-primary">{char}</span>
      }
      return <span key={idx} className="text-muted-foreground">{char}</span>
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Done: <span className="text-green-600 font-bold">{completed}</span>
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
        <span className="flex items-center gap-1">
          <Gauge className="w-3 h-3" />
          WPM: {wpm}
        </span>
        <span>Accuracy: {accuracy}%</span>
        <span>Best WPM: {bestWpm}</span>
      </div>

      <Progress value={Math.min((completed / 30) * 100, 100)} className="mb-6 h-2" />

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">Sentences: <span className="font-bold text-green-600">{completed}</span></p>
              <p className="text-muted-foreground">Avg WPM: <span className="font-bold">{wpm}</span></p>
              <p className="text-muted-foreground">Best WPM: <span className="font-bold text-amber-600">{bestWpm}</span></p>
              <p className="text-muted-foreground">Accuracy: <span className="font-bold">{accuracy}%</span></p>
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
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Type this sentence:</p>
              <p className="text-xl font-mono bg-muted p-4 rounded-lg leading-relaxed">
                {renderSentence()}
              </p>
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
                <Progress value={charProgress} className="h-1" />
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
