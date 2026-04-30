'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

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

const EASY_EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍊', '🍋']
const MEDIUM_EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍊', '🍋', '🍍', '🥭']

function createCards(emojis: string[]): CardItem[] {
  const cards = [...emojis, ...emojis].map((emoji, idx) => ({
    id: idx,
    emoji,
    isFlipped: false,
    isMatched: false,
  }))
  return cards.sort(() => Math.random() - 0.5)
}

export function MemoryFlipGame({ onComplete, timeLimit = 90, difficulty }: MemoryFlipGameProps) {
  const emojis = difficulty === 'HARD' ? MEDIUM_EMOJIS : EASY_EMOJIS
  const [cards, setCards] = useState<CardItem[]>(createCards(emojis))
  const [flippedIdx, setFlippedIdx] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [moves, setMoves] = useState(0)

  const totalPairs = emojis.length

  const initGame = useCallback(() => {
    setCards(createCards(emojis))
    setFlippedIdx([])
    setMatchedPairs([])
    setScore(0)
    setMoves(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
  }, [emojis, timeLimit])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (matchedPairs.length === totalPairs) {
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
  }, [gameOver, timeLeft, score, timeLimit, matchedPairs, totalPairs, onComplete])

  const handleCardClick = (idx: number) => {
    if (gameOver || cards[idx].isMatched || flippedIdx.includes(idx) || flippedIdx.length >= 2) return

    const newFlipped = [...flippedIdx, idx]
    setFlippedIdx(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      const [first, second] = newFlipped
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first, second])
          setFlippedIdx([])
          setScore(prev => prev + 20)
          toast.success('Match found! +20 points')
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setFlippedIdx([])
        }, 1000)
      }
    }
  }

  const progress = (matchedPairs.length / totalPairs) * 100

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium">
            Moves: <span className="text-blue-600 font-bold">{moves}</span>
          </div>
          <div className="text-sm font-medium">
            Pairs: <span className="text-green-600 font-bold">{matchedPairs.length}/{totalPairs}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={`font-mono ${timeLeft < 20 ? 'text-red-500' : ''}`}>
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
            <p className="text-muted-foreground mb-2">You scored {score} points in {moves} moves</p>
            <p className="text-muted-foreground mb-6">
              Matched {matchedPairs.length} out of {totalPairs} pairs
            </p>
            <Button onClick={initGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-3 mx-auto ${
          totalPairs === 6 ? 'grid-cols-4 max-w-md' : 'grid-cols-4 max-w-lg'
        }`}>
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`w-16 h-16 rounded-xl text-3xl flex items-center justify-center transition-all ${
                  card.isMatched
                    ? 'bg-green-500/20 border-green-500 cursor-default'
                    : flippedIdx.includes(idx)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted hover:bg-muted/80 border-muted-foreground/20'
                } border-2`}
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched || flippedIdx.includes(idx)}
              >
                {(flippedIdx.includes(idx) || card.isMatched) ? card.emoji : '?'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
