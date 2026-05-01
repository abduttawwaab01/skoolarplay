'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, RotateCcw, Trophy, Brain, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { MEMORY_EMOJIS_EASY, MEMORY_EMOJIS_MEDIUM, MEMORY_EMOJIS_HARD, MEMORY_EMOJIS_EXPERT } from '@/lib/game-word-bank'

interface MemoryFlipGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

interface CardItem {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJI_MAP: Record<string, string[]> = {
  EASY: MEMORY_EMOJIS_EASY,
  MEDIUM: MEMORY_EMOJIS_MEDIUM,
  HARD: MEMORY_EMOJIS_HARD,
  EXPERT: MEMORY_EMOJIS_EXPERT,
}

function createCards(emojis: string[]): CardItem[] {
  const cards = [...emojis, ...emojis].map((emoji, idx) => ({
    id: idx,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
  return cards.sort(() => Math.random() - 0.5)
}

function getGridClass(count: number): string {
  if (count <= 6) return 'grid-cols-3 max-w-xs'
  if (count <= 10) return 'grid-cols-5 max-w-md'
  if (count <= 16) return 'grid-cols-4 sm:grid-cols-4 md:grid-cols-4 max-w-lg'
  if (count <= 24) return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-6 max-w-xl'
  if (count <= 32) return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 max-w-3xl'
  return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 max-w-5xl'
}

function getCardSize(count: number): string {
  if (count <= 10) return 'w-16 h-16 text-3xl'
  if (count <= 16) return 'w-14 h-14 text-2xl'
  if (count <= 24) return 'w-12 h-12 text-xl'
  if (count <= 32) return 'w-10 h-10 text-lg'
  return 'w-9 h-9 text-base'
}

function getNextTierPool(difficulty: string, round: number): string[] {
  const tiers = ['EASY', 'MEDIUM', 'HARD', 'EXPERT']
  const baseIdx = tiers.indexOf(difficulty)
  const tierIdx = Math.min(baseIdx + Math.floor(round / 2), tiers.length - 1)
  return EMOJI_MAP[tiers[tierIdx]] ?? MEMORY_EMOJIS_EASY
}

export function MemoryFlipGame({ onComplete, timeLimit = 120, difficulty }: MemoryFlipGameProps) {
  const [round, setRound] = useState(1)
  const [cards, setCards] = useState<CardItem[]>([])
  const [flippedIdx, setFlippedIdx] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [moves, setMoves] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalPairs, setTotalPairs] = useState(0)
  const [totalWrong, setTotalWrong] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const startTimeRef = useRef(Date.now())

  const getPairCount = (r: number) => {
    const base = difficulty === 'EXPERT' ? 12 : difficulty === 'HARD' ? 8 : difficulty === 'MEDIUM' ? 6 : 4
    return Math.min(base + Math.floor(r / 2), 32)
  }

  const initRound = useCallback((r: number, keepScore = true) => {
    const emojis = getNextTierPool(difficulty, r)
    const pairCount = getPairCount(r)
    const selectedEmojis = emojis.slice(0, Math.min(pairCount, emojis.length))
    setCards(createCards(selectedEmojis))
    setFlippedIdx([])
    setMatchedPairs([])
    setMoves(0)
    setTotalPairs(selectedEmojis.length)
    setCurrentStreak(0)
    if (!keepScore) {
      setScore(0)
      setTotalWrong(0)
      setBestStreak(0)
      setTimeLeft(timeLimit)
      setGameOver(false)
      startTimeRef.current = Date.now()
    } else {
      setTimeLeft(timeLimit)
    }
    setRound(r)
    setIsProcessing(false)
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
    if (totalPairs > 0 && matchedPairs.length === totalPairs * 2 && !gameOver && !isProcessing) {
      setTimeout(() => {
        toast.success(`Round ${round} complete! Starting next round...`)
        const nextRound = round + 1
        const keepScore = true
        const nextScore = score
        const nextTotalWrong = totalWrong
        const nextBestStreak = bestStreak
        initRound(nextRound, keepScore)
        setScore(nextScore)
        setTotalWrong(nextTotalWrong)
        setBestStreak(nextBestStreak)
      }, 1200)
    }
  }, [matchedPairs.length, totalPairs, gameOver, isProcessing, round, score, totalWrong, bestStreak, initRound, onComplete, timeLeft])

  const handleCardClick = (idx: number) => {
    if (gameOver || cards[idx]?.isMatched || flippedIdx.includes(idx) || flippedIdx.length >= 2 || isProcessing) return

    const newFlipped = [...flippedIdx, idx]
    setFlippedIdx(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      const [first, second] = newFlipped

      if (cards[first].emoji === cards[second].emoji) {
        setIsProcessing(true)
        setTimeout(() => {
          setCards(prev => prev.map((card, i) =>
            i === first || i === second ? { ...card, isMatched: true } : card
          ))
          setFlippedIdx([])
          setIsProcessing(false)
          const difficultyMultiplier = difficulty === 'EXPERT' ? 4 : difficulty === 'HARD' ? 2.5 : difficulty === 'MEDIUM' ? 1.5 : 1
          const newStreak = currentStreak + 1
          setCurrentStreak(newStreak)
          if (newStreak > bestStreak) setBestStreak(newStreak)
          const points = Math.round(15 * difficultyMultiplier * (1 + Math.min(newStreak, 10) * 0.1))
          setScore(prev => prev + points)
          toast.success(`+${points} points`)
        }, 500)
      } else {
        setIsProcessing(true)
        setTimeout(() => {
          setFlippedIdx([])
          setIsProcessing(false)
          setCurrentStreak(0)
          setTotalWrong(prev => prev + 1)
        }, 800)
      }
    }
  }

  const progress = totalPairs > 0 ? (matchedPairs.length / (totalPairs * 2)) * 100 : 0

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
            Pairs: <span className="text-green-600 font-bold">{matchedPairs.length / 2}/{totalPairs}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 20 ? 'text-red-500' : ''}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Moves: {moves}</span>
        <span>Best Streak: {bestStreak}</span>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-muted-foreground">Rounds completed: <span className="font-bold">{round - 1}</span></p>
              <p className="text-muted-foreground">Total pairs matched: <span className="font-bold text-green-600">{matchedPairs.length / 2}</span></p>
              <p className="text-muted-foreground">Total moves: <span className="font-bold">{moves}</span></p>
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
        <div>
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{totalPairs} pairs - Round {round}</span>
          </div>
          <div className={`grid gap-2 mx-auto ${getGridClass(totalPairs)}`}>
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
              >
                <button
                  className={`${getCardSize(totalPairs)} rounded-xl flex items-center justify-center transition-all border-2 ${
                    card.isMatched
                      ? 'bg-green-500/20 border-green-500 cursor-default'
                      : flippedIdx.includes(idx)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-muted hover:bg-muted/80 border-muted-foreground/20'
                  }`}
                  onClick={() => handleCardClick(idx)}
                  disabled={card.isMatched || flippedIdx.includes(idx) || isProcessing}
                >
                  {(flippedIdx.includes(idx) || card.isMatched) ? card.emoji : '?'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
