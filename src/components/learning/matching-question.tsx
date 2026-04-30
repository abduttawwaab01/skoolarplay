'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

interface MatchPair {
  left: string
  right: string
}

export function MatchingQuestion({ question, onAnswer, showFeedback }: QuestionProps) {
  let correctAnswer: MatchPair[] = []
  try {
    if (question.correctAnswer) {
      const parsed = JSON.parse(question.correctAnswer)
      correctAnswer = Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    correctAnswer = []
  }

  const leftItems = correctAnswer.map((p) => p.left)
  const shuffledRightItems = useMemo(() => 
    [...correctAnswer.map((p) => p.right)].sort(() => Math.random() - 0.5),
    [correctAnswer]
  )

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Map<number, number>>(new Map())
  const [matchedRights, setMatchedRights] = useState<Set<number>>(new Set())

  const handleLeftClick = (index: number) => {
    if (showFeedback) return
    setSelectedLeft(index === selectedLeft ? null : index)
  }

  const handleRightClick = (rightIndex: number) => {
    if (showFeedback || selectedLeft === null || matchedRights.has(rightIndex)) return

    const newMatches = new Map(matches)
    newMatches.set(selectedLeft, rightIndex)
    setMatches(newMatches)

    const newMatchedRights = new Set(matchedRights)
    newMatchedRights.add(rightIndex)
    setMatchedRights(newMatchedRights)

    const newSelected = selectedLeft
    
    // Find next unmatched left item
    let nextLeft: number | null = null
    for (let i = 0; i < leftItems.length; i++) {
      if (!newMatchedRights.has(i) && i !== selectedLeft) {
        nextLeft = i
        break
      }
    }
    setSelectedLeft(nextLeft)

    if (newMatches.size === correctAnswer.length) {
      const userAnswerPairs: MatchPair[] = []
      newMatches.forEach((rightIdx, leftIdx) => {
        userAnswerPairs.push({ left: leftItems[leftIdx], right: shuffledRightItems[rightIdx] })
      })
      const isCorrect = userAnswerPairs.every(
        (pair) =>
          correctAnswer.some(
            (ca) => ca.left?.toLowerCase().trim() === pair.left?.toLowerCase().trim() && 
                    ca.right?.toLowerCase().trim() === pair.right?.toLowerCase().trim()
          )
      )
      onAnswer(JSON.stringify(userAnswerPairs), isCorrect)
    }
  }

  const handleReset = () => {
    setSelectedLeft(null)
    setMatches(new Map())
    setMatchedRights(new Set())
  }

  const getMatchStatus = (leftIndex: number, rightIndex: number) => {
    if (!showFeedback) return null
    const isMatched = matches.get(leftIndex) === rightIndex
    const leftText = leftItems[leftIndex]?.toLowerCase().trim() || ''
    const rightText = shuffledRightItems[rightIndex]?.toLowerCase().trim() || ''
    const correctRight = correctAnswer.find((ca) => 
      ca.left?.toLowerCase().trim() === leftText && 
      ca.right?.toLowerCase().trim() === rightText
    )
    const isCorrectMatch = !!correctRight

    if (isMatched && isCorrectMatch) return 'correct'
    if (isMatched && !isCorrectMatch) return 'wrong'
    if (isCorrectMatch && !isMatched) return 'missed'
    return null
  }

  const isAllMatched = matches.size === correctAnswer.length

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{question.question}</h3>
          <AudioPlayButton text={question.question} size="sm" />
        </div>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic">
            Hint: {question.hint}
          </p>
        )}
        {!showFeedback && !isAllMatched && (
          <p className="text-sm text-muted-foreground mt-1">
            {selectedLeft !== null 
              ? `Tap the matching definition for "${leftItems[selectedLeft]}"`
              : 'Tap a term to select, then tap its match'
            }
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Column - Terms */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-1 uppercase tracking-wider">
              Terms ({matches.size}/{leftItems.length})
            </p>
            {leftItems.map((item, i) => {
              const isSelected = selectedLeft === i
              const isMatched = matches.has(i)

              return (
                <motion.button
                  key={`left-${i}`}
                  onClick={() => handleLeftClick(i)}
                  whileTap={!showFeedback ? { scale: 0.97 } : undefined}
                  className={`w-full min-h-[56px] p-3 sm:p-4 rounded-xl border-2 text-center font-medium transition-all touch-manipulation ${
                    isSelected
                      ? 'border-[#008751] bg-[#008751]/10 ring-2 ring-[#008751]/20 shadow-sm'
                      : isMatched
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10 opacity-60'
                      : 'border-border hover:border-primary/30 bg-card'
                  }`}
                  style={{ wordBreak: 'break-word', color: 'inherit' }}
                >
                  <span className="block text-foreground" style={{ color: 'inherit' }}>{item}</span>
                  {isMatched && (
                    <span className="text-xs text-green-600 block mt-1">
                      ✓ Matched
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Right Column - Definitions */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center mb-1 uppercase tracking-wider">
              Definitions
            </p>
            {shuffledRightItems.map((item, i) => {
              const isMatched = matchedRights.has(i)
              const isAvailable = selectedLeft !== null && !isMatched

              let matchedLeftIndex: number | null = null
              matches.forEach((rightIdx, leftIdx) => {
                if (rightIdx === i) matchedLeftIndex = leftIdx
              })

              return (
                <motion.button
                  key={`right-${i}`}
                  onClick={() => handleRightClick(i)}
                  whileTap={!showFeedback && isAvailable ? { scale: 0.97 } : undefined}
                  className={`w-full min-h-[56px] p-3 sm:p-4 rounded-xl border-2 text-center font-medium transition-all touch-manipulation ${
                    showFeedback
                      ? getMatchStatus(matchedLeftIndex ?? 0, i) === 'correct'
                        ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                        : getMatchStatus(matchedLeftIndex ?? 0, i) === 'wrong'
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                        : getMatchStatus(matchedLeftIndex ?? 0, i) === 'missed'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                        : 'border-border opacity-50'
                      : isMatched
                      ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                      : isAvailable
                      ? 'border-primary bg-primary/10 hover:bg-primary/20 cursor-pointer shadow-sm'
                      : 'border-border opacity-70 bg-card'
                  }`}
                  style={{ wordBreak: 'break-word', color: 'inherit' }}
                  disabled={showFeedback || isMatched}
                >
                  <span className="block text-foreground" style={{ color: 'inherit' }}>{item}</span>
                  {showFeedback && matchedLeftIndex !== null && (
                    <span className="text-xs block mt-1">
                      {getMatchStatus(matchedLeftIndex, i) === 'correct' && '✓ Correct'}
                      {getMatchStatus(matchedLeftIndex, i) === 'wrong' && '✗ Wrong'}
                      {getMatchStatus(matchedLeftIndex, i) === 'missed' && '⊕ Missed'}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Reset button */}
        {!showFeedback && matches.size > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset Matches
            </Button>
          </div>
        )}

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Correct matches:</p>
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {correctAnswer.map((pair, i) => (
                <div key={i} className="text-xs bg-muted/50 p-2 rounded-lg">
                  <span className="font-medium">{pair.left}</span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="text-green-600">{pair.right}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Button({ variant, size, onClick, children, className, disabled }: {
  variant?: 'outline' | 'default'
  size?: 'sm'
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'} ${size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4'} inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className || ''}`}
    >
      {children}
    </button>
  )
}
