'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Zap, Gem, Trophy, ChevronRight, ChevronLeft, RotateCcw,
  CheckCircle, XCircle, Volume2, BookOpen, Shuffle, Eye, HelpCircle, Mic
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSoundEffect } from '@/hooks/use-sound'
import { SpeechRecognition } from '@/components/shared/speech-recognition'

interface VocabularyWord {
  id: string
  word: string
  definition: string
  partOfSpeech: string | null
  pronunciation: string | null
  exampleSentence: string | null
  synonyms: string[]
  antonyms: string[]
  scrambledWord: string | null
  missingLetter: string | null
  audioUrl: string | null
  imageUrl: string | null
}

interface VocabularySet {
  id: string
  title: string
  description: string | null
  language: string
  difficulty: string
  xpReward: number
  gemReward: number
  totalWords: number
}

type ActivityType = 'MEANING_MATCH' | 'WORD_ASSEMBLY' | 'MISSING_LETTER' | 'SYNONYM' | 'ANTONYM' | 'FILL_BLANK' | 'SPEECH_RECOGNITION'

const activityTypes: { type: ActivityType; name: string; description: string; icon?: string }[] = [
  { type: 'MEANING_MATCH', name: 'Meaning Match', description: 'Match words to their meanings' },
  { type: 'WORD_ASSEMBLY', name: 'Word Assembly', description: 'Unscramble letters to form the word' },
  { type: 'MISSING_LETTER', name: 'Missing Letter', description: 'Fill in the missing letter' },
  { type: 'SYNONYM', name: 'Synonym Hunt', description: 'Find the synonym' },
  { type: 'ANTONYM', name: 'Antonym Hunt', description: 'Find the antonym' },
  { type: 'FILL_BLANK', name: 'Fill in Blank', description: 'Complete the sentence' },
  { type: 'SPEECH_RECOGNITION', name: 'Speak', description: 'Say the word aloud', icon: '🎤' },
]

export default function VocabularyPracticePage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.id as string
  
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const playGemCollect = useSoundEffect('gemCollect')
  const playLevelUp = useSoundEffect('levelUp')
  const playXPGain = useSoundEffect('xpGain')

  const [set, setSet] = useState<VocabularySet | null>(null)
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{ wordId: string; correct: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [currentActivity, setCurrentActivity] = useState<ActivityType>('MEANING_MATCH')
  const [inputAnswer, setInputAnswer] = useState('')
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<{
    correctCount: number
    totalAnswered: number
    percentage: number
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    completed: boolean
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [setId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/vocabulary/${setId}`)
      if (!res.ok) {
        setError('Unable to load vocabulary. Please try again.')
        setLoading(false)
        return
      }
      const data = await res.json()
      if (!data.set) {
        setError('This vocabulary set was not found.')
        setLoading(false)
        return
      }
      if (!data.words || data.words.length === 0) {
        setError('This vocabulary set has no words yet.')
        setLoading(false)
        return
      }
      setSet(data.set)
      setWords(data.words || [])
      if (data.words && data.words.length > 0) {
        generateOptions(data.words[0])
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateOptions = useCallback((word: VocabularyWord) => {
    let options: string[] = []
    let correctAnswer = ''

    switch (currentActivity) {
      case 'MEANING_MATCH':
        correctAnswer = word.definition
        options = [word.definition]
        const otherDefs = words
          .filter(w => w.id !== word.id)
          .map(w => w.definition)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        options = [...options, ...otherDefs].sort(() => Math.random() - 0.5)
        break

      case 'SYNONYM':
        correctAnswer = word.synonyms[0] || word.word
        options = word.synonyms.length > 0 ? [...word.synonyms] : [word.word]
        const synDistractors = words
          .filter(w => w.id !== word.id)
          .map(w => w.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        options = [...options, ...synDistractors].sort(() => Math.random() - 0.5)
        break

      case 'ANTONYM':
        correctAnswer = word.antonyms[0] || 'opposite'
        options = word.antonyms.length > 0 ? [...word.antonyms] : ['opposite']
        const antDistractors = words
          .filter(w => w.id !== word.id)
          .map(w => w.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        options = [...options, ...antDistractors].sort(() => Math.random() - 0.5)
        break

      case 'WORD_ASSEMBLY':
        correctAnswer = word.word
        const chars = word.scrambledWord ? word.scrambledWord.split('') : word.word.split('')
        let scrambled = chars.join('')
        let attempts = 0
        while (scrambled.toLowerCase() === word.word.toLowerCase() && attempts < 10) {
          for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]]
          }
          scrambled = chars.join('')
          attempts++
        }
        options = [scrambled]
        break

      case 'MISSING_LETTER':
        correctAnswer = word.missingLetter || word.word.charAt(Math.floor(Math.random() * word.word.length))
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        const distractors = letters
          .filter(l => l.toUpperCase() !== correctAnswer.toUpperCase())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        options = [correctAnswer.toUpperCase(), ...distractors].sort(() => Math.random() - 0.5)
        break

      case 'FILL_BLANK':
        correctAnswer = word.word
        const blankSentence = word.exampleSentence?.replace(new RegExp(word.word, 'gi'), '_____') || 'Complete the word: _____'
        const wordDistractors = words
          .filter(w => w.id !== word.id && w.word.length === word.word.length)
          .map(w => w.word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        if (wordDistractors.length < 3) {
          const allDistractors = words
            .filter(w => w.id !== word.id)
            .map(w => w.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - wordDistractors.length)
          wordDistractors.push(...allDistractors)
        }
        options = [...wordDistractors].sort(() => Math.random() - 0.5)
        break

      default:
        options = []
    }

    setShuffledOptions(options)
    return correctAnswer
  }, [currentActivity, words])

  const currentWord = words[currentIndex]

  const checkAnswer = useCallback((selectedAnswer: string) => {
    if (!currentWord || showFeedback) return

    let correct = false

    switch (currentActivity) {
      case 'MEANING_MATCH':
        correct = selectedAnswer === currentWord.definition
        break
      case 'SYNONYM':
        correct = currentWord.synonyms.includes(selectedAnswer) || selectedAnswer === currentWord.word
        break
      case 'ANTONYM':
        correct = currentWord.antonyms.includes(selectedAnswer)
        break
      case 'WORD_ASSEMBLY':
        correct = selectedAnswer.toLowerCase().trim() === currentWord.word.toLowerCase()
        break
      case 'MISSING_LETTER':
        correct = selectedAnswer.toUpperCase() === currentWord.missingLetter?.toUpperCase()
        break
      case 'FILL_BLANK':
        correct = selectedAnswer.toLowerCase().trim() === currentWord.word.toLowerCase()
        break
    }

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      playCorrect()
    } else {
      playWrong()
    }

    setAnswers(prev => [...prev, { wordId: currentWord.id, correct }])
  }, [currentWord, currentActivity, showFeedback, playCorrect, playWrong])

  const nextWord = useCallback(() => {
    if (currentIndex < words.length - 1) {
      const nextIdx = currentIndex + 1
      setCurrentIndex(nextIdx)
      generateOptions(words[nextIdx])
      setShowFeedback(false)
      setShowHint(false)
      setInputAnswer('')
    } else {
      handleComplete()
    }
  }, [currentIndex, words, generateOptions])

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/vocabulary/${setId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setCompleted(true)

        if (data.leveledUp) {
          playLevelUp()
          setTimeout(() => playXPGain(), 800)
        } else if (data.xpEarned > 0) {
          playXPGain()
        }
        if (data.gemsEarned > 0) {
          setTimeout(() => playGemCollect(), 1000)
        }
      }
    } catch (error) {
      console.error('Failed to complete vocabulary:', error)
    }
  }

  const shuffleWord = () => {
    if (!currentWord) return
    const chars = currentWord.scrambledWord ? currentWord.scrambledWord.split('') : currentWord.word.split('')
    let scrambled = chars.join('')
    let attempts = 0
    while (scrambled.toLowerCase() === currentWord.word.toLowerCase() && attempts < 10) {
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]]
      }
      scrambled = chars.join('')
      attempts++
    }
    setShuffledOptions([scrambled])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!set || !currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Set Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'This vocabulary set doesn\'t exist or has no words.'}</p>
            <Button onClick={() => router.push('/vocabulary')}>Back to Vocabulary</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results screen
  if (completed && result) {
    const passed = result.percentage >= 60

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              passed ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
            }`}>
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <RotateCcw className="w-10 h-10 text-red-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {passed ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {passed ? 'You passed the vocabulary practice!' : `You need 60% to pass`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-3xl font-bold text-primary">{result.percentage}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-3xl font-bold text-green-500">{result.correctCount}/{result.totalAnswered}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
            </div>

            {(result.xpEarned > 0 || result.gemsEarned > 0) && (
              <div className="flex items-center justify-center gap-4 mb-6">
                {result.xpEarned > 0 && (
                  <div className="flex items-center gap-1 text-primary">
                    <Zap className="w-5 h-5" />
                    <span className="font-semibold">+{result.xpEarned} XP</span>
                  </div>
                )}
                {result.gemsEarned > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Gem className="w-5 h-5" />
                    <span className="font-semibold">+{result.gemsEarned} 💎</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/vocabulary')} className="flex-1">
                Back to Vocabulary
              </Button>
              <Button onClick={() => {
                setCurrentIndex(0)
                setAnswers([])
                setShowFeedback(false)
                setCompleted(false)
                setResult(null)
                fetchData()
              }} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/vocabulary')}>
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{set.title}</p>
            <p className="font-semibold">Word {currentIndex + 1} of {words.length}</p>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">+{set.xpReward}</span>
          </div>
        </div>
        <Progress value={((currentIndex + 1) / words.length) * 100} className="h-1 rounded-none" />
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Activity Type Selector */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Activity Type</p>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map(activity => (
              <Button
                key={activity.type}
                variant={currentActivity === activity.type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCurrentActivity(activity.type)
                  setShowFeedback(false)
                  generateOptions(currentWord)
                }}
                className="text-xs"
              >
                {activity.icon && <span className="mr-1">{activity.icon}</span>}
                {activity.name}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Word Display */}
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold mb-2">{currentWord.word}</p>
                {currentWord.pronunciation && (
                  <p className="text-muted-foreground mb-2">/{currentWord.pronunciation}/</p>
                )}
                {currentWord.partOfSpeech && (
                  <Badge variant="outline">{currentWord.partOfSpeech}</Badge>
                )}
              </CardContent>
            </Card>

            {/* Activity Content */}
            {currentActivity === 'MEANING_MATCH' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What is the meaning of "{currentWord.word}"?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {shuffledOptions.map((option, i) => {
                    let optionClass = 'border-border hover:border-primary/50'
                    if (showFeedback) {
                      if (option === currentWord.definition) {
                        optionClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                      } else {
                        optionClass = 'border-border opacity-50'
                      }
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-3 px-4 ${optionClass}`}
                        onClick={() => checkAnswer(option)}
                        disabled={showFeedback}
                      >
                        {option}
                        {showFeedback && option === currentWord.definition && (
                          <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
                        )}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {currentActivity === 'SYNONYM' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find a synonym of "{currentWord.word}"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {shuffledOptions.map((option, i) => {
                    let optionClass = 'border-border hover:border-primary/50'
                    if (showFeedback) {
                      const isCorrectAnswer = currentWord.synonyms.includes(option) || option === currentWord.word
                      if (isCorrectAnswer) {
                        optionClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                      } else {
                        optionClass = 'border-border opacity-50'
                      }
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-3 px-4 ${optionClass}`}
                        onClick={() => checkAnswer(option)}
                        disabled={showFeedback}
                      >
                        {option}
                        {showFeedback && (currentWord.synonyms.includes(option) || option === currentWord.word) && (
                          <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
                        )}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {currentActivity === 'ANTONYM' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Find an antonym of "{currentWord.word}"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {shuffledOptions.map((option, i) => {
                    let optionClass = 'border-border hover:border-primary/50'
                    if (showFeedback) {
                      if (currentWord.antonyms.includes(option)) {
                        optionClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                      } else {
                        optionClass = 'border-border opacity-50'
                      }
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        className={`w-full justify-start text-left h-auto py-3 px-4 ${optionClass}`}
                        onClick={() => checkAnswer(option)}
                        disabled={showFeedback}
                      >
                        {option}
                        {showFeedback && currentWord.antonyms.includes(option) && (
                          <CheckCircle className="w-5 h-5 ml-auto text-green-500" />
                        )}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {currentActivity === 'WORD_ASSEMBLY' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Unscramble to form a word</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center gap-2">
                    {(currentWord.scrambledWord || currentWord.word).split('').map((letter, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center text-xl font-bold"
                      >
                        {letter.toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <Input
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    placeholder="Type the word..."
                    className="text-center text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputAnswer) {
                        checkAnswer(inputAnswer)
                      }
                    }}
                    disabled={showFeedback}
                  />
                  <Button
                    className="w-full"
                    onClick={() => checkAnswer(inputAnswer)}
                    disabled={!inputAnswer || showFeedback}
                  >
                    Check
                  </Button>
                  {showFeedback && (
                    <Button variant="outline" className="w-full" onClick={shuffleWord}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Shuffle Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {currentActivity === 'MISSING_LETTER' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Fill in the missing letter in "{currentWord.word.replace(/_/g, ' _ ')}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Missing letter: <span className="font-bold text-primary">_</span>
                  </p>
                  <Input
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value.slice(0, 1))}
                    placeholder="Type the missing letter..."
                    className="text-center text-lg uppercase"
                    maxLength={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputAnswer) {
                        checkAnswer(inputAnswer)
                      }
                    }}
                    disabled={showFeedback}
                  />
                  <Button
                    className="w-full"
                    onClick={() => checkAnswer(inputAnswer)}
                    disabled={!inputAnswer || showFeedback}
                  >
                    Check
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentActivity === 'FILL_BLANK' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete the word</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentWord.exampleSentence && (
                    <p className="text-center text-muted-foreground italic">
                      "{currentWord.exampleSentence.replace(new RegExp(currentWord.word, 'gi'), '_____')}"
                    </p>
                  )}
                  <Input
                    value={inputAnswer}
                    onChange={(e) => setInputAnswer(e.target.value)}
                    placeholder="Type the word..."
                    className="text-center text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputAnswer) {
                        checkAnswer(inputAnswer)
                      }
                    }}
                    disabled={showFeedback}
                  />
                  <Button
                    className="w-full"
                    onClick={() => checkAnswer(inputAnswer)}
                    disabled={!inputAnswer || showFeedback}
                  >
                    Check
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentActivity === 'SPEECH_RECOGNITION' && (
              <SpeechRecognition
                word={currentWord.word}
                expectedAnswer={currentWord.word}
                language={set?.language === 'yo' ? 'yo-NG' : set?.language === 'ig' ? 'ig-NG' : set?.language === 'ha' ? 'ha-NG' : 'en-US'}
                onComplete={(correct, spokenText) => {
                  setIsCorrect(correct)
                  setShowFeedback(true)
                  setAnswers(prev => [...prev, { wordId: currentWord.id, correct }])
                  if (correct) {
                    playCorrect()
                  } else {
                    playWrong()
                  }
                }}
                retryCount={2}
              />
            )}

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  isCorrect ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-muted-foreground">
                    The correct answer is: <span className="font-semibold">{currentWord.word}</span>
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-semibold">Definition:</span> {currentWord.definition}
                </p>
              </motion.div>
            )}

            {/* Hint Button */}
            {!showFeedback && (
              <Button variant="ghost" onClick={() => setShowHint(true)} className="w-full">
                <HelpCircle className="w-4 h-4 mr-2" />
                Show Hint
              </Button>
            )}

            {showHint && (
              <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <p className="text-sm">
                    <span className="font-semibold">Hint:</span> {currentWord.definition}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        {showFeedback && (
          <Button
            className="w-full mt-6"
            size="lg"
            onClick={nextWord}
          >
            {currentIndex < words.length - 1 ? (
              <>
                Next Word
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Finish'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
