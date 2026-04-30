'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSoundEffect } from '@/hooks/use-sound'

interface SpeechRecognitionProps {
  word: string
  expectedAnswer?: string
  onComplete: (correct: boolean, spokenText: string) => void
  language?: string
  retryCount?: number
}

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

export function SpeechRecognition({
  word,
  expectedAnswer,
  onComplete,
  language = 'en-US',
  retryCount = 2,
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  })
  const [spokenText, setSpokenText] = useState('')
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const spokenTextRef = useRef('')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const recognitionRef = useRef<any>(null)

  const checkPronunciation = useCallback((spoken: string) => {
    setIsProcessing(true)
    
    const normalizeText = (text: string) => 
      text.toLowerCase().trim()
        .replace(/[.,!?]/g, '')
        .replace(/\s+/g, ' ')
    
    const spokenNormalized = normalizeText(spoken)
    const expectedNormalized = normalizeText(expectedAnswer || word)
    
    const isCorrect = spokenNormalized === expectedNormalized ||
      calculateSimilarity(spokenNormalized, expectedNormalized) >= 0.7
    
    setResult(isCorrect ? 'correct' : 'incorrect')
    setAttempts(prev => prev + 1)
    
    if (isCorrect) {
      playCorrect()
    } else {
      playWrong()
    }
    
    setIsProcessing(false)
  }, [word, expectedAnswer, playCorrect, playWrong])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = language

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
        setSpokenText(transcript)
        spokenTextRef.current = transcript
      }

      recognition.onend = () => {
        setIsListening(false)
        if (spokenTextRef.current) {
          checkPronunciation(spokenTextRef.current)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access to use speech recognition.')
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.')
        } else {
          setError(`Speech recognition error: ${event.error}`)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [language, checkPronunciation])

  const startListening = () => {
    setError(null)
    setSpokenText('')
    setResult(null)
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const retry = () => {
    setSpokenText('')
    setResult(null)
    setError(null)
  }

  const handleComplete = () => {
    onComplete(result === 'correct', spokenText)
  }

  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = language
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200">
        <CardContent className="p-4 text-center">
          <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
            Speech Recognition Not Supported
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Your browser doesn't support speech recognition. Please try using Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">Say the word:</p>
          <p className="text-4xl font-bold mb-4">{word}</p>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={speakWord}>
              <Volume2 className="w-4 h-4 mr-2" />
              Listen
            </Button>
          </div>

          {/* Microphone Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={isListening ? stopListening : startListening}
              className={`rounded-full w-20 h-20 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={result === 'correct' || attempts >= retryCount}
            >
              {isListening ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>

          {/* Spoken Text Display */}
          {spokenText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted rounded-lg p-3 mb-4"
            >
              <p className="text-sm text-muted-foreground">You said:</p>
              <p className="text-lg font-medium">{spokenText}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-lg p-4 mb-4 ${
                  result === 'correct' 
                    ? 'bg-green-50 dark:bg-green-950 border border-green-200' 
                    : 'bg-red-50 dark:bg-red-950 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {result === 'correct' ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-green-700 dark:text-green-300 font-semibold">
                        Excellent Pronunciation!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-500" />
                      <span className="text-red-700 dark:text-red-300 font-semibold">
                        Not quite right
                      </span>
                    </>
                  )}
                </div>
                {result === 'incorrect' && attempts < retryCount && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try again! ({retryCount - attempts} attempts left)
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {(spokenText || error) && !result && (
              <Button variant="outline" onClick={retry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {result === 'incorrect' && attempts < retryCount && (
              <Button onClick={startListening}>
                <Mic className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {result && (
              <Button onClick={handleComplete}>
                Continue
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {attempts >= retryCount && result !== 'correct' && (
            <p className="text-sm text-muted-foreground mt-4">
              Out of attempts. The correct answer is: <span className="font-semibold">{expectedAnswer || word}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
