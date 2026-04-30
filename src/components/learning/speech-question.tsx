'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mic, Volume2 } from 'lucide-react'
import { Question } from '@/hooks/use-lesson'
import { SpeechRecognition } from '@/components/shared/speech-recognition'

const LANGUAGE_CODE_MAP: Record<string, string> = {
  'yo': 'yo-NG',
  'ig': 'ig-NG', 
  'ha': 'ha-NG',
  'sw': 'sw-KE',
  'zu': 'zu-ZA',
  'af': 'af-ZA',
  'en': 'en-US',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'pt': 'pt-BR',
}

function getSpeechLanguage(lang?: string): string {
  if (!lang) return 'en-US'
  return LANGUAGE_CODE_MAP[lang.toLowerCase()] || lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`
}

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

export function SpeechQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  const speechLang = getSpeechLanguage(question.language)
  
  let correctAnswer: string = question.question
  try {
    if (question.correctAnswer) {
      const parsed = JSON.parse(question.correctAnswer)
      if (typeof parsed === 'string' && parsed.trim()) {
        correctAnswer = parsed.trim()
      }
    }
  } catch {
    correctAnswer = question.question
  }

  const handleComplete = (correct: boolean, spokenText: string) => {
    onAnswer(spokenText, correct)
  }

  if (showFeedback) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h3 className="text-lg md:text-xl font-semibold">Pronunciation Check</h3>
          </div>
          <p className="text-muted-foreground">Speak the word or phrase aloud</p>
        </div>

        <div className="bg-muted rounded-xl p-6 text-center">
          <p className="text-3xl font-bold mb-4">{question.question}</p>
          
          <div className={`text-center p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-lg font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? 'Excellent!' : 'Try Again'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-sm text-muted-foreground mt-2">
                The correct answer is: <span className="font-semibold">{correctAnswer}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-semibold mb-2">Pronunciation Check</h3>
        <p className="text-muted-foreground">Tap the microphone and say the word below</p>
      </div>

      <SpeechRecognition
        word={correctAnswer}
        expectedAnswer={correctAnswer}
        onComplete={handleComplete}
        language={speechLang}
        retryCount={2}
      />
    </div>
  )
}
