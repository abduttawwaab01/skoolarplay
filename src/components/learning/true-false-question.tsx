'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

export function TrueFalseQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  
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

  const normalizeAnswer = (val: string) => val.toLowerCase().trim()
  const correctAnswerNorm = normalizeAnswer(correctAnswer)

  const handleSelect = (value: string) => {
    if (showFeedback) return
    setSelected(value)
    const correct = normalizeAnswer(value) === correctAnswerNorm
    onAnswer(value, correct)
  }

  const getButtonStyle = (value: string) => {
    if (!showFeedback) {
      return selected === value
        ? 'border-2 border-primary bg-primary/5'
        : 'border-2 border-border hover:border-primary/30 hover:bg-muted/50'
    }

    if (normalizeAnswer(value) === correctAnswerNorm) {
      return 'border-2 border-green-500 bg-green-50 dark:bg-green-500/10'
    }

    if (value === selected && !isCorrect) {
      return 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10'
    }

    return 'border-2 border-border opacity-50'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg md:text-xl font-semibold">{question.question}</h3>
          <AudioPlayButton text={question.question} size="sm" />
        </div>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic">Hint: {question.hint}</p>
        )}
      </div>

      <div className="flex gap-4 max-w-md mx-auto">
        <motion.button
          onClick={() => handleSelect('true')}
          whileHover={!showFeedback ? { scale: 1.03 } : undefined}
          whileTap={!showFeedback ? { scale: 0.97 } : undefined}
          className={`flex-1 p-6 rounded-xl font-semibold text-lg transition-all duration-200 ${getButtonStyle('true')}`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">✅</span>
            <span>True</span>
          </div>
        </motion.button>

        <motion.button
          onClick={() => handleSelect('false')}
          whileHover={!showFeedback ? { scale: 1.03 } : undefined}
          whileTap={!showFeedback ? { scale: 0.97 } : undefined}
          className={`flex-1 p-6 rounded-xl font-semibold text-lg transition-all duration-200 ${getButtonStyle('false')}`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">❌</span>
            <span>False</span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
