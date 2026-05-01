'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Shuffle, Lightbulb, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { SPELLING_EASY, SPELLING_MEDIUM, SPELLING_HARD, SPELLING_EXPERT } from '@/lib/game-word-bank'

interface AnagramsGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

interface WordWithHint {
  word: string
  hint: string
}

const POOLS: Record<string, WordWithHint[]> = {
  EASY: SPELLING_EASY,
  MEDIUM: SPELLING_MEDIUM,
  HARD: SPELLING_HARD,
  EXPERT: SPELLING_EXPERT,
}

function getNextTierPool(difficulty: string, solved: number): WordWithHint[] {
  const tiers = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  const baseIdx = tiers.indexOf(difficulty)
  const tierIdx = Math.min(baseIdx + Math.floor(solved / 15), tiers.length - 1)
  return POOLS[tiers[tierIdx]] ?? SPELLING_EASY
}

function getRandomWord(pool: WordWithHint[], exclude?: string): WordWithHint {
  const available = exclude ? pool.filter(w => w.word !== exclude) : pool
  return available[Math.floor(Math.random() * available.length)]
}

function generateAnagram(word: string): string {
  const letters = word.split('')
  let result = word
  let attempts = 0
  while (result === word && attempts < 100) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
    }
    result = letters.join('')
    attempts++
  }
  return result
}

export function AnagramsGame({ onComplete, timeLimit = 120, difficulty }: AnagramsGameProps) {
  const [currentWord, setCurrentWord] = useState<WordWithHint | null>(null)
  const [anagram, setAnagram] = useState('')
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [solved, setSolved] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [hintUsed, setHintUsed] = useState(false)
  const [shuffles, setShuffles] = useState(0)
  const startTimeRef = useRef(Date.now())

  const pickWord = useCallback((currentSolved: number, prevWord?: string) => {
    const pool = getNextTierPool(difficulty, currentSolved)
    const word = getRandomWord(pool, prevWord)
    setCurrentWord(word)
    setAnagram(generateAnagram(word.word))
    setInput('')
    setShowHint(false)
    setHintUsed(false)
    setShuffles(0)
  }, [difficulty])

  useEffect(() => {
    pickWord(0)
  }, [pickWord])

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

  const handleSubmit = () => {
    if (!currentWord || gameOver || feedback) return

    if (input.toUpperCase() === currentWord.word) {
      const difficultyMultiplier = difficulty === 'EXPERT' ? 4 : difficulty === 'HARD' ? 2.5 : difficulty === 'MEDIUM' ? 1.5 : 1
      const streakBonus = Math.min(streak, 15)
      const hintPenalty = hintUsed ? 0.6 : 1
      const shufflePenalty = Math.max(0.7, 1 - shuffles * 0.1)
      const points = Math.round(20 * difficultyMultiplier * (1 + streakBonus * 0.1) * hintPenalty * shufflePenalty)
      setScore(prev => prev + Math.max(5, points))
      const newSolved = solved + 1
      setSolved(newSolved)
      const newStreak = streak + 1
      setStreak(newStreak)
      if (newStreak > bestStreak) setBestStreak(newStreak)
      setFeedback('correct')
      toast.success(`+${Math.max(5, points)} points`)
      setTimeout(() => {
        setFeedback(null)
        pickWord(newSolved, currentWord.word)
      }, 600)
    } else {
      setStreak(0)
      setWrong(prev => prev + 1)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setInput('')
      }, 600)
    }
  }

  const restart = () => {
    setScore(0)
    setSolved(0)
    setWrong(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setStreak(0)
    setBestStreak(0)
    setFeedback(null)
    startTimeRef.current = Date.now()
    pickWord(0)
  }

  const accuracy = solved + wrong > 0 ? Math.round((solved / (solved + wrong)) * 100) : 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Solved: <span className="text-green-600 font-bold">{solved}</span>
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
        <span>Accuracy: {accuracy}%</span>
        <span>Best Streak: {bestStreak}</span>
      </div>

      <Progress value={Math.min((solved / 50) * 100, 100)} className="mb-6 h-2" />

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
              <><Check className="w-4 h-4 inline mr-2" />Correct!</>
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
                    transition={{ delay: idx * 0.05 }}
                    className="w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-xl font-bold text-primary"
                  >
                    {letter}
                  </motion.div>
                ))}
              </motion.div>

              {showHint && currentWord && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground mb-2"
                >
                  <Lightbulb className="w-3 h-3 inline mr-1" />
                  Hint: {currentWord.hint}
                </motion.p>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAnagram(generateAnagram(currentWord!.word)); setShuffles(prev => prev + 1) }}
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  Shuffle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setShowHint(true); setHintUsed(true) }}
                  disabled={showHint}
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Hint
                </Button>
              </div>
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
