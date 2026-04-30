'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

export function FillBlankQuestion({ question, onAnswer, showFeedback }: QuestionProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  let correctAnswer: string = ''
  try {
    if (question.correctAnswer) {
      const raw = question.correctAnswer
      try {
        const parsed = JSON.parse(raw)
        correctAnswer = typeof parsed === 'string' ? parsed : String(parsed)
      } catch {
        correctAnswer = typeof raw === 'string' ? raw : String(raw)
      }
    }
  } catch (e) {
    correctAnswer = question.correctAnswer || ''
  }

  useEffect(() => {
    if (!showFeedback && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showFeedback])

  const handleSubmit = () => {
    if (!input.trim() || showFeedback) return
    const isCorrect = input.trim().toLowerCase() === correctAnswer.toLowerCase().trim()
    onAnswer(input.trim(), isCorrect)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  // Display question with blank
  const questionParts = question.question.split('______')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg md:text-xl font-semibold leading-relaxed">
            {questionParts[0]}
            {input || showFeedback ? (
              <span
                className={`inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-b-2 font-bold ${
                  showFeedback
                    ? 'border-b-green-500 text-green-700 dark:text-green-300'
                    : 'border-b-primary text-primary'
                }`}
              >
                {input || '______'}
              </span>
            ) : (
              <span className="inline-block min-w-[80px] mx-1 px-3 py-1 rounded-lg border-b-2 border-b-primary">
                ______
              </span>
            )}
            {questionParts[1]}
          </h3>
          <AudioPlayButton text={question.question} size="sm" />
        </div>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic mt-2">Hint: {question.hint}</p>
        )}
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={showFeedback}
            placeholder="Type your answer..."
            className={`w-full p-4 rounded-xl border-2 text-center text-lg font-medium outline-none transition-all ${
              showFeedback
                ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            }`}
            maxLength={100}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {input.length}/100
          </span>
        </div>

        {!showFeedback && (
          <motion.button
            onClick={handleSubmit}
            disabled={!input.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-3 rounded-xl font-semibold text-white transition-all ${
              input.trim()
                ? 'bg-[#008751] hover:bg-[#008751]/90'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            Submit
          </motion.button>
        )}

        {showFeedback && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            Correct answer: <span className="font-bold text-green-700 dark:text-green-300">{correctAnswer}</span>
          </motion.p>
        )}
      </div>
    </div>
  )
}
