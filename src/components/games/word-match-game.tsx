'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { WORD_MATCH_EASY, WORD_MATCH_MEDIUM, WORD_MATCH_HARD, WORD_MATCH_EXPERT } from '@/lib/game-word-bank'

interface WordMatchGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

interface WordPair {
  word: string
  definition: string
}

const POOLS: Record<string, WordPair[]> = {
  EASY: WORD_MATCH_EASY,
  MEDIUM: WORD_MATCH_MEDIUM,
  HARD: WORD_MATCH_HARD,
  EXPERT: WORD_MATCH_EXPERT,
}

function getBasePool(difficulty: string): WordPair[] {
  return POOLS[difficulty] ?? WORD_MATCH_EASY
}

function getNextTierPool(difficulty: string, round: number): WordPair[] {
  const tiers = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  const baseIdx = tiers.indexOf(difficulty)
  const tierIdx = Math.min(baseIdx + Math.floor(round / 3), tiers.length - 1)
  return POOLS[tiers[tierIdx]] ?? WORD_MATCH_EASY
}

function getRandomWords(allWords: WordPair[], count: number): WordPair[] {
  const shuffled = [...allWords].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, allWords.length))
}

export function WordMatchGame({ onComplete, timeLimit = 120, difficulty }: WordMatchGameProps) {
  const [round, setRound] = useState(1)
  const [words, setWords] = useState<WordPair[]>([])
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([])
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [selectedDef, setSelectedDef] = useState<number | null>(null)
  const [matches, setMatches] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [correctPair, setCorrectPair] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalMatched, setTotalMatched] = useState(0)
  const [totalWrong, setTotalWrong] = useState(0)
  const startTimeRef = useRef(Date.now())

  const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5)

  const getWordCount = (r: number) => {
    const base = difficulty === 'EXPERT' ? 8 : difficulty === 'HARD' ? 6 : difficulty === 'MEDIUM' ? 5 : 4
    return Math.min(base + Math.floor(r / 2), 12)
  }

  const initRound = useCallback((r: number, keepScore = true) => {
    const pool = getNextTierPool(difficulty, r)
    const wordCount = getWordCount(r)
    const selectedWords = getRandomWords(pool, wordCount)
    setWords(selectedWords)
    setShuffledWords(shuffle(selectedWords))
    setShuffledDefs(shuffle(selectedWords.map(w => w.definition)))
    setSelectedWord(null)
    setSelectedDef(null)
    setMatches([])
    setCorrectPair(null)
    if (!keepScore) {
      setScore(0)
      setStreak(0)
      setBestStreak(0)
      setTotalMatched(0)
      setTotalWrong(0)
      setTimeLeft(timeLimit)
      setGameOver(false)
      startTimeRef.current = Date.now()
    } else {
      setTimeLeft(timeLimit)
    }
    setRound(r)
  }, [difficulty, timeLimit])

  useEffect(() => {
    initRound(1, false)
  }, [initRound])

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

  useEffect(() => {
    if (words.length > 0 && matches.length === words.length * 2 && !gameOver) {
      setTimeout(() => {
        toast.success(`Round ${round} complete! Starting next round...`)
        const nextScore = score
        const nextStreak = streak
        const nextBestStreak = bestStreak
        const nextTotalMatched = totalMatched
        const nextTotalWrong = totalWrong
        const nextRound = round + 1
        initRound(nextRound, true)
        setScore(nextScore)
        setStreak(nextStreak)
        setBestStreak(nextBestStreak)
        setTotalMatched(nextTotalMatched)
        setTotalWrong(nextTotalWrong)
      }, 1200)
    }
  }, [matches.length, words.length, gameOver, round, score, streak, bestStreak, totalMatched, totalWrong, initRound, onComplete, timeLeft])

  const handleWordClick = (index: number) => {
    if (matches.includes(index) || gameOver || selectedDef === null) {
      if (!matches.includes(index) && !gameOver) setSelectedWord(index)
      return
    }
    setSelectedWord(index)
    checkMatch(index, selectedDef)
  }

  const handleDefClick = (index: number) => {
    if (matches.includes(index + shuffledWords.length) || gameOver || selectedWord === null) {
      if (!matches.includes(index + shuffledWords.length) && !gameOver) setSelectedDef(index)
      return
    }
    setSelectedDef(index)
    checkMatch(selectedWord, index)
  }

  const checkMatch = (wordIdx: number | null, defIdx: number | null) => {
    if (wordIdx === null || defIdx === null) return

    const wordPair = shuffledWords[wordIdx]
    const def = shuffledDefs[defIdx]

    if (wordPair.definition === def) {
      setMatches(prev => [...prev, wordIdx, defIdx + shuffledWords.length])
      const difficultyMultiplier = difficulty === 'EXPERT' ? 3 : difficulty === 'HARD' ? 2 : difficulty === 'MEDIUM' ? 1.5 : 1
      const streakBonus = Math.min(streak, 10)
      const points = Math.round((10 + streakBonus * 2) * difficultyMultiplier)
      setScore(prev => prev + points)
      setStreak(prev => {
        const next = prev + 1
        setBestStreak(b => Math.max(b, next))
        return next
      })
      setTotalMatched(prev => prev + 1)
      setCorrectPair(wordPair.word)
      setTimeout(() => setCorrectPair(null), 1000)
      toast.success(`+${points} points`)
    } else {
      setStreak(0)
      setTotalWrong(prev => prev + 1)
      toast.error('Wrong match!')
    }

    setTimeout(() => {
      setSelectedWord(null)
      setSelectedDef(null)
    }, 500)
  }

  const progress = words.length > 0 ? (matches.length / (words.length * 2)) * 100 : 0
  const accuracy = totalMatched + totalWrong > 0 ? Math.round((totalMatched / (totalMatched + totalWrong)) * 100) : 100

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Round: <span className="text-blue-600 font-bold">{round}</span>
          </div>
          <div className="text-sm font-medium">
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

      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Matched: {totalMatched}</span>
        <span>Accuracy: {accuracy}%</span>
        <span>Words: {matches.length / 2}/{words.length}</span>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <AnimatePresence>
        {correctPair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-700 text-center"
          >
            <Check className="w-4 h-4 inline mr-2" />
            Correct! "{correctPair}" matched.
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">Rounds completed: <span className="font-bold">{round - 1}</span></p>
              <p className="text-muted-foreground">Total matched: <span className="font-bold text-green-600">{totalMatched}</span></p>
              <p className="text-muted-foreground">Accuracy: <span className="font-bold">{accuracy}%</span></p>
              <p className="text-muted-foreground">Best streak: <span className="font-bold text-amber-600">{bestStreak}</span></p>
              <p className="text-2xl font-bold text-primary mt-4">Score: {score}</p>
            </div>
            <Button onClick={() => initRound(1, false)}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3 text-center">Words</h3>
            <div className="space-y-2">
              {shuffledWords.map((pair, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all ${
                      matches.includes(idx)
                        ? 'bg-green-500/10 border-green-500'
                        : selectedWord === idx
                        ? 'bg-primary/10 border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleWordClick(idx)}
                  >
                    <CardContent className="p-3 text-center">
                      <span className={matches.includes(idx) ? 'line-through text-muted-foreground' : ''}>
                        {pair.word}
                      </span>
                      {matches.includes(idx) && <Check className="w-4 h-4 inline ml-2 text-green-500" />}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-center">Definitions</h3>
            <div className="space-y-2">
              {shuffledDefs.map((def, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card
                    className={`cursor-pointer transition-all ${
                      matches.includes(idx + shuffledWords.length)
                        ? 'bg-green-500/10 border-green-500'
                        : selectedDef === idx
                        ? 'bg-primary/10 border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleDefClick(idx)}
                  >
                    <CardContent className="p-3">
                      <span className={matches.includes(idx + shuffledWords.length) ? 'line-through text-muted-foreground' : ''}>
                        {def}
                      </span>
                      {matches.includes(idx + shuffledWords.length) && <Check className="w-4 h-4 inline ml-2 text-green-500" />}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
