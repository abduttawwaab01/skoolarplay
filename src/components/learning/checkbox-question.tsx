'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'
import { Button } from '@/components/ui/button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

export function CheckboxQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  const [selected, setSelected] = useState<string[]>([])
  
  let options: string[] = []
  try {
    if (question.options) {
      const parsed = JSON.parse(question.options)
      options = Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    options = []
  }
  
  let correctAnswers: string[] = []
  try {
    if (question.correctAnswer) {
      const raw = question.correctAnswer
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const firstItem = parsed[0]
          if (typeof firstItem === 'number') {
            correctAnswers = parsed.filter((n): n is number => typeof n === 'number' && !isNaN(n) && n >= 0 && n < options.length).map(i => options[i])
          } else {
            correctAnswers = parsed.filter((n): n is string => typeof n === 'string')
          }
        } else if (typeof parsed === 'string') {
          correctAnswers = [parsed]
        }
      } catch {
        if (typeof raw === 'string') {
          correctAnswers = [raw]
        }
      }
    }
  } catch (e) {
    correctAnswers = []
  }

  const isCorrectOption = (option: string) => {
    return correctAnswers.some(ca => ca.toLowerCase().trim() === option.toLowerCase().trim())
  }

  const handleToggle = (option: string) => {
    if (showFeedback) return
    setSelected(prev => {
      if (prev.includes(option)) {
        return prev.filter(o => o !== option)
      }
      return [...prev, option]
    })
  }

  const handleSubmit = () => {
    const selectedLower = selected.map(s => s.toLowerCase().trim())
    const correctLower = correctAnswers.map(c => c.toLowerCase().trim())
    const isCorrectAnswer = selectedLower.length === correctLower.length && 
      selectedLower.every(a => correctLower.includes(a))
    onAnswer(JSON.stringify(selected), isCorrectAnswer)
  }

  const getOptionStyle = (option: string) => {
    const isSelected = selected.includes(option)
    const isCorrectOptionFlag = isCorrectOption(option)

    if (!showFeedback) {
      return isSelected
        ? 'border-2 border-primary bg-primary/5'
        : 'border-2 border-border hover:border-primary/30 hover:bg-muted/50'
    }

    if (isCorrectOptionFlag) {
      return 'border-2 border-green-500 bg-green-50 dark:bg-green-500/10'
    }

    if (isSelected && !isCorrectOptionFlag) {
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
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic mt-2">Hint: {question.hint}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {options.map((option, i) => (
          <motion.button
            key={i}
            onClick={() => handleToggle(option)}
            whileHover={!showFeedback ? { scale: 1.02 } : undefined}
            whileTap={!showFeedback ? { scale: 0.98 } : undefined}
            className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 flex items-center gap-3 ${getOptionStyle(option)}`}
            disabled={showFeedback}
          >
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              selected.includes(option)
                ? 'bg-primary border-primary'
                : 'border-border'
            }`}>
              {selected.includes(option) && (
                <CheckCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-sm md:text-base">{option}</span>
            {showFeedback && isCorrectOption(option) && (
              <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
            )}
          </motion.button>
        ))}
      </div>

      {!showFeedback && selected.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={handleSubmit} className="mt-4">
            Submit ({selected.length} selected)
          </Button>
        </div>
      )}

      {showFeedback && (
        <div className={`text-center p-4 rounded-lg ${
          isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          {!isCorrect && (
            <p className="text-sm text-muted-foreground mt-2">
              Correct answer(s): {correctAnswers.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
