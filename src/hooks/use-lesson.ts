'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

export interface Question {
  id: string
  type: string
  question: string
  hint: string | null
  explanation: string | null
  options: string | null
  correctAnswer: string
  order: number
  points: number
  language?: string // Language code for SPEECH questions (yo, ig, ha, sw, en, etc.)
}

export interface Answer {
  questionId: string
  answer: string
  isCorrect: boolean
}

export interface LessonData {
  id: string
  title: string
  type: string
  xpReward: number
  gemReward: number
  questions: Question[]
  videoContent: VideoContentData[]
  previousAttempts: number
  bestScore: number | null
  module?: {
    id: string
    title: string
    isPremium: boolean
    course: {
      id: string
      title: string
      isPremium: boolean
    }
  } | null
  lessonNote?: {
    id: string
    title: string
    content: string
    audioUrl: string | null
    hasQuiz: boolean
    quizTitle: string | null
    quizQuestions: any[] | null
    quizPassingScore: number
    quizTimeLimit: number | null
    quizRequireFullscreen: boolean
    quizPreventTabSwitch: boolean
    quizPreventCopyPaste: boolean
    quizShuffleQuestions: boolean
    quizShuffleOptions: boolean
    quizXpReward: number
    quizGemReward: number
  } | null
  storyLesson?: {
    id: string
    title: string
    narrative: string
    character: string | null
    setting: string | null
    mood: string | null
    choices: any | null
    languageCode?: string
    readingLevel?: string
    estimatedReadingTime?: number
    ttsVoice?: string
    ttsSpeed?: number
    ttsLanguage?: string
    chapters?: any[] | null
    hasBranching?: boolean
    branchingPaths?: any | null
    totalQuestions?: number
    passingScore?: number
    xpReward?: number
    gemReward?: number
  } | null
}

export interface VideoContentData {
  id: string
  title: string
  url: string
  duration: number
  order: number
}

interface LessonSessionState {
  lessonId: string
  currentQuestion: number
  score: number
  answers: Answer[]
  hearts: number
  savedAt: number
}

interface UseLessonReturn {
  currentQuestion: number
  questions: Question[]
  score: number
  answers: Answer[]
  isLoading: boolean
  isComplete: boolean
  hearts: number
  maxHearts: number
  showFeedback: boolean
  currentIsCorrect: boolean | null
  lessonData: LessonData | null
  error: string | null
  requiresPremium: boolean
  premiumLevel: string | null
  hasRecoveredSession: boolean
  startLesson: (lessonId: string) => Promise<void>
  answerQuestion: (answer: string, isCorrect: boolean) => void
  nextQuestion: () => void
  skipQuestion: () => void
  completeLesson: () => Promise<{ xpEarned: number; gemsEarned: number; leveledUp: boolean; newLevel: number; lessonReport?: any }>
  resetLesson: () => void
  clearSession: () => void
}

const SESSION_KEY_PREFIX = 'skoolar_lesson_session_'

function getSessionKey(lessonId: string): string {
  return `${SESSION_KEY_PREFIX}${lessonId}`
}

function saveSession(state: LessonSessionState): void {
  try {
    sessionStorage.setItem(getSessionKey(state.lessonId), JSON.stringify(state))
    sessionStorage.setItem('lesson-session-active', JSON.stringify({
      lessonId: state.lessonId,
      startedAt: Date.now()
    }))
  } catch (e) {
    console.error('Failed to save lesson session:', e)
  }
}

function loadSession(lessonId: string): LessonSessionState | null {
  try {
    const saved = sessionStorage.getItem(getSessionKey(lessonId))
    if (saved) {
      return JSON.parse(saved) as LessonSessionState
    }
  } catch (e) {
    console.error('Failed to load lesson session:', e)
  }
  return null
}

export function removeLessonSession(lessonId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(lessonId))
    sessionStorage.removeItem('lesson-session-active')
  } catch (e) {
    console.error('Failed to clear lesson session:', e)
  }
}

export function useLesson(): UseLessonReturn {
  const { user, updateXP, updateGems, updateUser, updateHearts } = useAuthStore()

  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hearts, setHearts] = useState(user?.hearts ?? 5)
  const [maxHearts, setMaxHearts] = useState(user?.maxHearts ?? 5)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requiresPremium, setRequiresPremium] = useState(false)
  const [premiumLevel, setPremiumLevel] = useState<string | null>(null)
  const [hasRecoveredSession, setHasRecoveredSession] = useState(false)

  const lessonIdRef = useRef<string | null>(null)

  // Auto-save session on state changes
  useEffect(() => {
    if (!lessonIdRef.current || isComplete) return
    
    const state: LessonSessionState = {
      lessonId: lessonIdRef.current,
      currentQuestion,
      score,
      answers,
      hearts,
      savedAt: Date.now()
    }
    
    saveSession(state)
  }, [currentQuestion, score, answers, hearts, isComplete])

  const startLesson = useCallback(async (lessonId: string) => {
    setIsLoading(true)
    setError(null)
    setRequiresPremium(false)
    setPremiumLevel(null)
    setHasRecoveredSession(false)
    
    try {
      // Check for existing session
      const savedSession = loadSession(lessonId)
      
      const res = await fetch(`/api/lessons/${lessonId}`)
      const data = await res.json()
      
      if (res.status === 403 && data.requiresPremium) {
        setRequiresPremium(true)
        setPremiumLevel(data.premiumLevel || 'content')
        setError(data.error || 'Premium subscription required')
        setIsLoading(false)
        return
      }
      
      if (!res.ok || !data.lesson) {
        setError(data.error || 'Lesson not found')
        setIsLoading(false)
        return
      }
      
      setLessonData(data.lesson)
      lessonIdRef.current = lessonId
      
      // Guard against missing lesson data
      if (!data.lesson) {
        setError('Lesson not found')
        setIsLoading(false)
        return
      }
      
      // Combine lesson questions with note quiz questions
      const rawLessonQs = data.lesson?.questions || []
      const rawNoteQs = data.lesson?.lessonNote?.quizQuestions || []
      const lessonQs = Array.isArray(rawLessonQs) ? rawLessonQs : []
      const noteQs = Array.isArray(rawNoteQs) ? rawNoteQs : []
      const allQuestions = [...lessonQs, ...noteQs]
      setQuestions(allQuestions)
      
      // Mark session as active
      sessionStorage.setItem('lesson-session-active', JSON.stringify({
        lessonId,
        startedAt: Date.now()
      }))
      
      // If we have a saved session, try to restore it
      if (savedSession && savedSession.lessonId === lessonId) {
        // Check if session is valid (within reasonable time)
        const savedAge = Date.now() - savedSession.savedAt
        const maxAge = 2 * 60 * 60 * 1000 // 2 hours
        
        if (savedAge < maxAge) {
          // Validate questions haven't changed
          const sessionQuestionIds = new Set(savedSession.answers.map(a => a.questionId))
          const currentQuestionIds = new Set(allQuestions.map(q => q.id))
          const questionsMatch = savedSession.answers.every(a => currentQuestionIds.has(a.questionId))
          
          if (questionsMatch && allQuestions.length > 0) {
            setCurrentQuestion(Math.min(savedSession.currentQuestion, allQuestions.length - 1))
            setScore(savedSession.score)
            setAnswers(savedSession.answers)
            setHearts(savedSession.hearts)
            setHasRecoveredSession(true)
            setIsComplete(false)
            setShowFeedback(false)
            setCurrentIsCorrect(null)
            setMaxHearts(user?.maxHearts ?? 5)
            setIsLoading(false)
            return
          }
        }
      }
      
      // No valid session, start fresh
      setCurrentQuestion(0)
      setScore(0)
      setAnswers([])
      setIsComplete(false)
      setShowFeedback(false)
      setCurrentIsCorrect(null)
      setHearts(user?.hearts ?? 5)
      setMaxHearts(user?.maxHearts ?? 5)
      
    } catch (err) {
      setError('Failed to load lesson')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const answerQuestion = useCallback(
    (answer: string, isCorrect: boolean) => {
      setShowFeedback(true)
      setCurrentIsCorrect(isCorrect)

      if (isCorrect) {
        const points = questions[currentQuestion]?.points || 10
        setScore((prev) => prev + 1)
        setAnswers((prev) => [
          ...prev,
          {
            questionId: questions[currentQuestion]?.id || '',
            answer,
            isCorrect: true,
          },
        ])
      } else {
        const newHearts = Math.max(0, hearts - 1)
        setHearts(newHearts)
        setAnswers((prev) => [
          ...prev,
          {
            questionId: questions[currentQuestion]?.id || '',
            answer,
            isCorrect: false,
          },
        ])
        // Track heart loss on server for cooldown
        fetch('/api/user/heart-loss', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hearts: newHearts }),
        }).catch(() => {})
      }
    },
    [currentQuestion, questions, hearts]
  )

  const nextQuestion = useCallback(() => {
    if (hearts <= 0) {
      setIsComplete(true)
      return
    }

    const next = currentQuestion + 1
    if (next >= questions.length) {
      setIsComplete(true)
    } else {
      setCurrentQuestion(next)
      setShowFeedback(false)
      setCurrentIsCorrect(null)
    }
  }, [currentQuestion, questions.length, hearts])

  const skipQuestion = useCallback(() => {
    const next = currentQuestion + 1
    
    // Add empty answer for skipped question
    const currentAnswer = answers[currentQuestion]
    if (!currentAnswer) {
      setAnswers((prev) => {
        const newAnswers = [...prev]
        // Ensure array is long enough
        while (newAnswers.length <= currentQuestion) {
          newAnswers.push({ questionId: '', answer: '', isCorrect: false })
        }
        newAnswers[currentQuestion] = {
          questionId: questions[currentQuestion]?.id || '',
          answer: '',
          isCorrect: false,
        }
        return newAnswers
      })
    }
    
    if (next >= questions.length) {
      // Last question - set complete
      setIsComplete(true)
    } else {
      setCurrentQuestion(next)
      setShowFeedback(false)
      setCurrentIsCorrect(null)
    }
  }, [currentQuestion, questions, answers])

  const completeLesson = useCallback(async (): Promise<{
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    lessonReport?: any
  }> => {
    if (!lessonData) return { xpEarned: 0, gemsEarned: 0, leveledUp: false, newLevel: 0, lessonReport: undefined }

    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
    const isPassed = percentage >= 60

    let xpEarned = 0
    let gemsEarned = 0

    if (isPassed) {
      xpEarned = lessonData.xpReward
      gemsEarned = lessonData.gemReward

      // Bonus XP for perfect score
      if (percentage === 100) {
        xpEarned = Math.round(xpEarned * 1.5)
        gemsEarned = Math.round(gemsEarned * 1.5)
      }
    }

    try {
      const res = await fetch(`/api/lessons/${lessonData.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          percentage,
          answers,
          xpEarned,
          gemsEarned,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        // Update local state with rewards from server
        if (data.xpEarned) {
          updateXP(data.xpEarned)
          xpEarned = data.xpEarned
        }
        if (data.gemsEarned) {
          updateGems(data.gemsEarned)
          gemsEarned = data.gemsEarned
        }
         if (data.leveledUp && data.newLevel) {
           updateUser({ level: data.newLevel })
         }
         if (data.newHearts !== undefined) {
           setHearts(data.newHearts)
           updateHearts(data.newHearts)
         }

        // Clear session on successful completion
        removeLessonSession(lessonData.id)

        return {
          xpEarned,
          gemsEarned,
          leveledUp: data.leveledUp || false,
          newLevel: data.newLevel || 0,
          lessonReport: data.lessonReport || undefined,
        }
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err)
    }

    // Fallback: update locally even if API fails
    if (isPassed) {
      updateXP(xpEarned)
      updateGems(gemsEarned)
    }

    // Clear session
    removeLessonSession(lessonData.id)

    return { xpEarned, gemsEarned, leveledUp: false, newLevel: 0, lessonReport: undefined }
  }, [lessonData, questions, score, answers, updateXP, updateGems, updateUser, updateHearts])

  const resetLesson = useCallback(() => {
    if (lessonIdRef.current) {
      removeLessonSession(lessonIdRef.current)
    }
    if (!lessonData) return
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setIsComplete(false)
    setShowFeedback(false)
    setCurrentIsCorrect(null)
    setHearts(user?.hearts ?? 5)
  }, [lessonData, user])

  const clearSession = useCallback(() => {
    if (lessonIdRef.current) {
      removeLessonSession(lessonIdRef.current)
    }
  }, [])

  return {
    currentQuestion,
    questions,
    score,
    answers,
    isLoading,
    isComplete,
    hearts,
    maxHearts,
    showFeedback,
    currentIsCorrect,
    lessonData,
    error,
    requiresPremium,
    premiumLevel,
    hasRecoveredSession,
    startLesson,
    answerQuestion,
    nextQuestion,
    skipQuestion,
    completeLesson,
    resetLesson,
    clearSession,
  }
}
