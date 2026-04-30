'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface SpellingBeeGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

const WORDS = {
  EASY: [
    { word: 'CAT', hint: 'A pet that meows' },
    { word: 'DOG', hint: 'A pet that barks' },
    { word: 'SUN', hint: 'Provides light' },
    { word: 'RUN', hint: 'Move fast' },
    { word: 'BIG', hint: 'Large size' },
  ],
  MEDIUM: [
    { word: 'APPLE', hint: 'A fruit' },
    { word: 'HOUSE', hint: 'Place to live' },
    { word: 'WATER', hint: 'Drink this' },
    { word: 'SCHOOL', hint: 'Place for learning' },
    { word: 'FRIEND', hint: 'Someone close' },
  ],
  HARD: [
    { word: 'ELEPHANT', hint: 'Large gray animal' },
    { word: 'COMPUTER', hint: 'Electronic device' },
    { word: 'BUTTERFLY', hint: 'Insect with wings' },
    { word: 'ADVENTURE', hint: 'Exciting journey' },
    { word: 'MOUNTAIN', hint: 'Very tall landform' },
  ],
}

export function SpellingBeeGame({ onComplete, timeLimit = 120, difficulty }: SpellingBeeGameProps) {
  const words = WORDS[difficulty as keyof typeof WORDS] || WORDS.EASY
  const [currentWord, setCurrentWord] = useState<typeof WORDS.EASY[0] | null>(null)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)

  const TOTAL = 5

  const pickWord = () => {
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    setInput('')
    setShowHint(false)
  }

  useEffect(() => {
    pickWord()
  }, [])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (correct >= TOTAL) {
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
  }, [gameOver, timeLeft, score, timeLimit, correct, onComplete])

  const handleSubmit = () => {
    if (!currentWord || gameOver) return

    if (input.toUpperCase() === currentWord.word) {
      const points = 15
      setScore(prev => prev + points)
      setCorrect(prev => prev + 1)
      setFeedback('correct')
      toast.success(`Correct! +${points} points`)
      setTimeout(() => {
        setFeedback(null)
        pickWord()
      }, 800)
    } else {
      setFeedback('wrong')
      toast.error('Wrong spelling!')
      setTimeout(() => {
        setFeedback(null)
        setInput('')
      }, 800)
    }
  }

  const progress = (correct / TOTAL) * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium">
            Correct: <span className="text-green-600 font-bold">{correct}/{TOTAL}</span>
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-center font-medium ${
              feedback === 'correct' ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}
          >
            {feedback === 'correct' ? (
              <><Check className="w-4 h-4 inline mr-2" />Correct! +15 points</>
            ) : (
              <><X className="w-4 h-4 inline mr-2" />Wrong! The word was {currentWord?.word}</>
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
              setCorrect(0)
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
              <p className="text-sm text-muted-foreground mb-2">Spell this word:</p>
              <div className="flex justify-center gap-2 mb-4">
                {currentWord?.word.split('').map((letter, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl font-bold"
                  >
                    ?
                  </motion.div>
                ))}
              </div>

              {showHint && currentWord && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Hint: {currentWord.hint}
                </motion.p>
              )}
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
                maxLength={currentWord?.word.length || 10}
              />
              <Button onClick={handleSubmit}>Submit</Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                <Volume2 className="w-3 h-3 mr-1" />
                Show Hint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
