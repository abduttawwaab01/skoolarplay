'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface WordMatchGameProps {
  onComplete: (score: number, timeSpent: number) => void
  timeLimit?: number
  difficulty: string
}

interface WordPair {
  word: string
  definition: string
}

const EASY_WORDS: WordPair[] = [
  { word: 'Apple', definition: 'A fruit that keeps the doctor away' },
  { word: 'Book', definition: 'Contains pages with text or images' },
  { word: 'Sun', definition: 'Provides light and warmth to Earth' },
  { word: 'Water', definition: 'Essential liquid for all life' },
  { word: 'Tree', definition: 'Has branches, leaves, and provides oxygen' },
  { word: 'Car', definition: 'Vehicle with four wheels for transport' },
  { word: 'House', definition: 'A place where people live' },
  { word: 'Friend', definition: 'Someone you trust and enjoy being with' },
]

const MEDIUM_WORDS: WordPair[] = [
  { word: 'Eloquent', definition: 'Fluent and persuasive in speaking' },
  { word: 'Benevolent', definition: 'Well-meaning and kindly' },
  { word: 'Ephemeral', definition: 'Lasting for a very short time' },
  { word: 'Ubiquitous', definition: 'Present everywhere at once' },
  { word: 'Serendipity', definition: 'Pleasant surprise or happy accident' },
  { word: 'Resilience', definition: 'Ability to recover quickly from difficulties' },
  { word: 'Meticulous', definition: 'Showing great attention to detail' },
  { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically' },
]

export function WordMatchGame({ onComplete, timeLimit = 120, difficulty }: WordMatchGameProps) {
  const words = difficulty === 'HARD' ? MEDIUM_WORDS : EASY_WORDS
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([])
  const [shuffledDefs, setShuffledDefs] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<number | null>(null)
  const [selectedDef, setSelectedDef] = useState<number | null>(null)
  const [matches, setMatches] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [gameOver, setGameOver] = useState(false)
  const [correctPair, setCorrectPair] = useState<{ word: string; def: string } | null>(null)
  const [wrongPair, setWrongPair] = useState<{ word: string; def: string } | null>(null)

  const shuffle = (array: any[]) => [...array].sort(() => Math.random() - 0.5)

  const initGame = useCallback(() => {
    const shuffled = shuffle(words)
    setShuffledWords(shuffled)
    setShuffledDefs(shuffle(shuffled.map(w => w.definition)))
    setSelectedWord(null)
    setSelectedDef(null)
    setMatches([])
    setScore(0)
    setTimeLeft(timeLimit)
    setGameOver(false)
    setCorrectPair(null)
    setWrongPair(null)
  }, [words, timeLimit])

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    if (gameOver || timeLeft <= 0) return
    if (matches.length === words.length) {
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
  }, [gameOver, timeLeft, score, timeLimit, matches, words.length, onComplete])

  const handleWordClick = (index: number) => {
    if (matches.includes(index) || gameOver) return
    setSelectedWord(index)
    checkMatch(index, selectedDef)
  }

  const handleDefClick = (index: number) => {
    if (matches.includes(index) || gameOver) return
    setSelectedDef(index)
    checkMatch(selectedWord, index)
  }

  const checkMatch = (wordIdx: number | null, defIdx: number | null) => {
    if (wordIdx === null || defIdx === null) return

    const wordPair = shuffledWords[wordIdx]
    const def = shuffledDefs[defIdx]

    if (wordPair.definition === def) {
      const newMatches = [...matches, wordIdx, defIdx]
      setMatches(newMatches)
      setScore(prev => prev + 10)
      setCorrectPair({ word: wordPair.word, def })
      setTimeout(() => setCorrectPair(null), 1000)
      toast.success('Correct match!')
    } else {
      setWrongPair({ word: wordPair.word, def })
      setTimeout(() => setWrongPair(null), 1000)
      toast.error('Wrong match!')
    }

    setTimeout(() => {
      setSelectedWord(null)
      setSelectedDef(null)
    }, 500)
  }

  const progress = (matches.length / 2 / words.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">
            Score: <span className="text-primary font-bold">{score}</span>
          </div>
          <div className="text-sm font-medium">
            Matches: <span className="text-green-600 font-bold">{matches.length / 2}/{words.length}</span>
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
        {correctPair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-700 text-center"
          >
            <Check className="w-4 h-4 inline mr-2" />
            Correct! "{correctPair.word}" matches that definition.
          </motion.div>
        )}

        {wrongPair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-700 text-center"
          >
            <X className="w-4 h-4 inline mr-2" />
            "{wrongPair.word}" doesn't match that definition.
          </motion.div>
        )}
      </AnimatePresence>

      {gameOver ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-muted-foreground mb-4">
              You matched {matches.length / 2} out of {words.length} words
            </p>
            <p className="text-2xl font-bold text-primary mb-6">Final Score: {score}</p>
            <Button onClick={initGame}>
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
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
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
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
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
