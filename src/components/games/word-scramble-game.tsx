'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WordScrambleGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

const EASY_WORDS = [
  { word: 'APPLE', hint: 'A fruit' },
  { word: 'HOUSE', hint: 'A place to live' },
  { word: 'BOOK', hint: 'You read it' },
  { word: 'WATER', hint: 'Essential for life' },
  { word: 'SUN', hint: 'Bright star in our sky' },
  { word: 'TREE', hint: 'Has leaves and branches' },
  { word: 'FRIEND', hint: 'Someone you trust' },
  { word: 'SCHOOL', hint: 'Place for learning' },
]

const MEDIUM_WORDS = [
  { word: 'COMPUTER', hint: 'Electronic device for processing data' },
  { word: 'HELICOPTER', hint: 'Aircraft with rotating wings' },
  { word: 'UNIVERSE', hint: 'All of space and time' },
  { word: 'MOUNTAIN', hint: 'Very tall landform' },
  { word: 'ELEPHANT', hint: 'Large gray animal with trunk' },
  { word: 'BUTTERFLY', hint: 'Insect with colorful wings' },
  { word: 'ADVENTURE', hint: 'Exciting or unusual experience' },
  { word: 'KITCHEN', hint: 'Room where food is cooked' },
]

function scrambleWord(word: string): string {
  const letters = word.split('')
  let scrambled = word
  while (scrambled === word) {
    scrambled = letters.sort(() => Math.random() - 0.5).join('')
  }
  return scrambled
}

export function WordScrambleGame({ onComplete, timeLimit = 120, difficulty }: WordScrambleGameProps) {
  const words = difficulty === 'HARD' ? MEDIUM_WORDS : EASY_WORDS
  const [currentWord, setCurrentWord] = useState<typeof EASY_WORDS[0] | null>(null)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const TOTAL = 8

  const pickWord = () => {
    const word = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(word)
    setScrambled(scrambleWord(word.word))
    setInput('')
    setShowHint(false)
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

    if (input.toUpperCase() === currentWord.word) {
      const points = 15
      setScore(prev => prev + points)
      setSolved(prev => prev + 1)
      setFeedback('correct')
      setTimeout(() => {
        setFeedback(null)
        pickWord()
      }, 800)
    } else {
      setFeedback('wrong')
      setTimeout(() => setFeedback(null), 800)
    }
    setInput('')
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
              <><X className="w-4 h-4 inline mr-2" />Wrong! Try again</>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-6">You solved {solved} words</p>
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
              <p className="text-sm text-muted-foreground mb-2">Unscramble this word:</p>
              <motion.div
                key={scrambled}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold tracking-widest text-primary mb-4"
              >
                {scrambled}
              </motion.div>

              {showHint && currentWord && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  <Lightbulb className="w-3 h-3 inline mr-1" />
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
                className="flex-1 p-4 text-lg border-2 rounded-lg focus:outline-none focus:border-primary font-mono text-center"
                placeholder="Type the word..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
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
                <Lightbulb className="w-3 h-3 mr-1" />
                Show Hint
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
