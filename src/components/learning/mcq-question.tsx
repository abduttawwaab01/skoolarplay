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

export function McqQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  
  let options: string[] = []
  try {
    if (question.options) {
      const parsed = JSON.parse(question.options)
      options = Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    options = []
  }
  
  let correctAnswer: string = ''
  try {
    if (question.correctAnswer) {
      const raw = question.correctAnswer
      try {
        const parsed = JSON.parse(raw)
        if (typeof parsed === 'string') {
          correctAnswer = parsed
        } else if (typeof parsed === 'number' && !isNaN(parsed) && parsed >= 0 && parsed < options.length) {
          correctAnswer = options[parsed]
        } else {
          correctAnswer = String(parsed)
        }
      } catch {
        if (typeof raw === 'string') {
          correctAnswer = raw
        } else {
          correctAnswer = String(raw)
        }
      }
    }
  } catch (e) {
    correctAnswer = question.correctAnswer || ''
  }

  const isCorrectOption = (option: string) => {
    if (!correctAnswer) return false
    return option.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  const handleSelect = (option: string) => {
    if (showFeedback) return
    setSelected(option)
    const correct = isCorrectOption(option)
    onAnswer(option, correct)
  }

  const getOptionStyle = (option: string) => {
    if (!showFeedback) {
      return selected === option
        ? 'border-2 border-primary bg-primary/5'
        : 'border-2 border-border hover:border-primary/30 hover:bg-muted/50'
    }

    if (isCorrectOption(option)) {
      return 'border-2 border-green-500 bg-green-50 dark:bg-green-500/10'
    }

    if (option === selected && !isCorrect) {
      return 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10'
    }

    return 'border-2 border-border opacity-50'
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg md:text-xl font-semibold">{question.question}</h3>
          <AudioPlayButton text={question.question} size="sm" />
        </div>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic">Hint: {question.hint}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {options.map((option, i) => (
          <motion.button
            key={i}
            onClick={() => handleSelect(option)}
            whileHover={!showFeedback ? { scale: 1.02 } : undefined}
            whileTap={!showFeedback ? { scale: 0.98 } : undefined}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 ${getOptionStyle(option)}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm md:text-base">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
