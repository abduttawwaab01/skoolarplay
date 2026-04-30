'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface AnagramsGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

const WORDS = {
  EASY: ['CAT', 'DOG', 'RUN', 'BIG', 'SUN', 'MAP'],
  MEDIUM: ['APPLE', 'HOUSE', 'WATER', 'BIRD', 'CLOUD', 'TREE'],
  HARD: ['ELEPHANT', 'COMPUTER', 'BUTTERFLY', 'KITCHEN', 'AIRPORT', 'MOUNTAIN'],
}

function generateAnagram(word: string): string {
  const letters = word.split('')
  let result = word
  while (result === word) {
    result = letters.sort(() => Math.random() - 0.5).join('')
  }
  return result
}

export function AnagramsGame({ onComplete, timeLimit = 120, difficulty }: AnagramsGameProps) {
  const words = WORDS[difficulty as keyof typeof WORDS] || WORDS.EASY
  const [currentWord, setCurrentWord] = useState('')
  const [anagram, setAnagram] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const TOTAL = 6

  const pickWord = () => {
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    setAnagram(generateAnagram(word))
    setInput('')
  }

  useEffect(() => {
    pickWord()
  }, [])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (solved >= TOTAL) {
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
  }, [gameOver, timeLeft, score, timeLimit, solved, onComplete])

  const handleSubmit = () => {
    if (!currentWord || gameOver) return

    if (input.toUpperCase() === currentWord) {
      const points = 20
      setScore(prev => prev + points)
      setSolved(prev => prev + 1)
      setFeedback('correct')
      toast.success(`Correct! +${points} points`)
      setTimeout(() => {
        setFeedback(null)
        pickWord()
      }, 800)
    } else {
      setFeedback('wrong')
      toast.error('Wrong! Try again')
      setTimeout(() => {
        setFeedback(null)
        setInput('')
      }, 800)
    }
  }

  const progress = (solved / TOTAL) * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium">
            Solved: <span className="text-green-600 font-bold">{solved}/{TOTAL}</span>
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
              <><Check className="w-4 h-4 inline mr-2" />Correct! +20 points</>
            ) : (
              <><X className="w-4 h-4 inline mr-2" />Wrong! Try rearranging the letters</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-6">You solved {solved} anagrams</p>
            <Button onClick={() => {
              setScore(0)
              setSolved(0)
              setTimeLeft(timeLimit)
              setGameOver(false)
              pickWord()
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
              <p className="text-sm text-muted-foreground mb-2">Rearrange to form a word:</p>
              <motion.div
                key={anagram}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex justify-center flex-wrap gap-2 mb-4"
              >
                {anagram.split('').map((letter, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-12 h-12 rounded-lg bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary"
                  >
                    {letter}
                  </motion.div>
                ))}
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnagram(generateAnagram(currentWord))}
              >
                <Shuffle className="w-3 h-3 mr-1" />
                Shuffle Again
              </Button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 p-4 text-lg border-2 rounded-lg focus:outline-none focus:border-primary font-mono text-center tracking-widest"
                placeholder="Type the word..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
