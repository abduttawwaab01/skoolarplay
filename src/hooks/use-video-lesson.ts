'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

export interface VideoQuizQuestion {
  id: string
  type: string
  question: string
  hint: string | null
  explanation: string | null
  options: string | null
  correctAnswer: string
  order: number
  points: number
}

export interface VideoQuizData {
  id: string
  title: string
  passingScore: number
  timeLimit: number | null
  xpReward: number
  gemReward: number
  requireFullscreen: boolean
  preventTabSwitch: boolean
  preventCopyPaste: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  questions: VideoQuizQuestion[]
  hasQuiz: boolean
}

export interface VideoContentData {
  id: string
  title: string
  url: string
  duration: number
  lesson: {
    id: string
    title: string
    type: string
    module: {
      id: string
      title: string
      course: {
        id: string
        title: string
      }
    }
  }
}

export interface VideoQuizAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
}

export interface VideoLessonData {
  video: VideoContentData
  quiz: VideoQuizData | null
  progress: {
    attempts: number
    bestScore: number | null
    completed: boolean
  } | null
}

interface VideoLessonSessionState {
  videoId: string
  currentQuestion: number
  score: number
  answers: VideoQuizAnswer[]
  hearts: number
  videoEnded: boolean
  savedAt: number
}

interface UseVideoLessonReturn {
  currentQuestion: number
  questions: VideoQuizQuestion[]
  score: number
  answers: VideoQuizAnswer[]
  isLoading: boolean
  isComplete: boolean
  hearts: number
  maxHearts: number
  showFeedback: boolean
  currentIsCorrect: boolean | null
  videoLessonData: VideoLessonData | null
  error: string | null
  videoEnded: boolean
  hasRecoveredSession: boolean
  startVideoLesson: (videoId: string) => Promise<void>
  setVideoEnded: (ended: boolean) => void
  answerQuestion: (answer: string, isCorrect: boolean) => void
  nextQuestion: () => void
  skipQuestion: () => void
  completeVideoQuiz: () => Promise<{
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    passed: boolean
    score: number
  }>
  resetVideoLesson: () => void
  clearSession: () => void
}

const SESSION_KEY_PREFIX = 'skoolar_video_lesson_session_'

function getSessionKey(videoId: string): string {
  return `${SESSION_KEY_PREFIX}${videoId}`
}

function saveSession(state: VideoLessonSessionState): void {
  try {
    sessionStorage.setItem(getSessionKey(state.videoId), JSON.stringify(state))
    sessionStorage.setItem('video-lesson-session-active', JSON.stringify({
      videoId: state.videoId,
      startedAt: Date.now()
    }))
  } catch (e) {
    console.error('Failed to save video lesson session:', e)
  }
}

function loadSession(videoId: string): VideoLessonSessionState | null {
  try {
    const saved = sessionStorage.getItem(getSessionKey(videoId))
    if (saved) {
      return JSON.parse(saved) as VideoLessonSessionState
    }
  } catch (e) {
    console.error('Failed to load video lesson session:', e)
  }
  return null
}

export function removeVideoLessonSession(videoId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(videoId))
    sessionStorage.removeItem('video-lesson-session-active')
  } catch (e) {
    console.error('Failed to clear video lesson session:', e)
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function useVideoLesson(): UseVideoLessonReturn {
  const { user, updateXP, updateGems, updateUser } = useAuthStore()

  const [videoLessonData, setVideoLessonData] = useState<VideoLessonData | null>(null)
  const [questions, setQuestions] = useState<VideoQuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<VideoQuizAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hearts, setHearts] = useState(user?.hearts ?? 5)
  const [maxHearts, setMaxHearts] = useState(user?.maxHearts ?? 5)
  const [showFeedback, setShowFeedback] = useState(false)
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [hasRecoveredSession, setHasRecoveredSession] = useState(false)

  const videoIdRef = useRef<string | null>(null)

  // Auto-save session on state changes
  useEffect(() => {
    if (!videoIdRef.current || isComplete) return
    
    const state: VideoLessonSessionState = {
      videoId: videoIdRef.current,
      currentQuestion,
      score,
      answers,
      hearts,
      videoEnded,
      savedAt: Date.now()
    }
    
    saveSession(state)
  }, [currentQuestion, score, answers, hearts, videoEnded, isComplete])

  const startVideoLesson = useCallback(async (videoId: string) => {
    setIsLoading(true)
    setError(null)
    setHasRecoveredSession(false)
    
    try {
      // Check for existing session
      const savedSession = loadSession(videoId)
      
      const res = await fetch(`/api/videos/${videoId}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to load video lesson')
        return
      }
      const data = await res.json()
      setVideoLessonData(data)
      videoIdRef.current = videoId

      // Process questions
      let quizQuestions = data.quiz?.questions || []

      // Shuffle questions if enabled
      if (data.quiz?.shuffleQuestions) {
        quizQuestions = shuffleArray(quizQuestions)
      }

      // Shuffle options if enabled (for MCQ questions)
      if (data.quiz?.shuffleOptions) {
        quizQuestions = quizQuestions.map((q: VideoQuizQuestion) => {
          if ((q.type === 'MCQ' || q.type === 'TRUE_FALSE') && q.options) {
            try {
              const options = JSON.parse(q.options)
              if (Array.isArray(options)) {
                return { ...q, options: JSON.stringify(shuffleArray(options)) }
              }
            } catch {
              // Keep original options
            }
          }
          return q
        })
      }

      setQuestions(quizQuestions)
      
      // Mark session as active
      sessionStorage.setItem('video-lesson-session-active', JSON.stringify({
        videoId,
        startedAt: Date.now()
      }))
      
      // If we have a saved session, try to restore it
      if (savedSession && savedSession.videoId === videoId) {
        // Check if session is valid (within reasonable time)
        const savedAge = Date.now() - savedSession.savedAt
        const maxAge = 2 * 60 * 60 * 1000 // 2 hours
        
        if (savedAge < maxAge && quizQuestions.length > 0) {
          // Validate questions haven't changed significantly
          const sessionQuestionIds = new Set(savedSession.answers.map(a => a.questionId))
          const currentQuestionIds = new Set(quizQuestions.map(q => q.id))
          const questionsMatch = savedSession.answers.every(a => currentQuestionIds.has(a.questionId))
          
          if (questionsMatch) {
            setCurrentQuestion(Math.min(savedSession.currentQuestion, quizQuestions.length - 1))
            setScore(savedSession.score)
            setAnswers(savedSession.answers)
            setHearts(savedSession.hearts)
            setVideoEnded(savedSession.videoEnded)
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
      setVideoEnded(false)
    } catch (err) {
      setError('Failed to load video lesson')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const answerQuestion = useCallback(
    (answer: string, isCorrect: boolean) => {
      setShowFeedback(true)
      setCurrentIsCorrect(isCorrect)

      if (isCorrect) {
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
        setHearts((prev) => Math.max(0, prev - 1))
        setAnswers((prev) => [
          ...prev,
          {
            questionId: questions[currentQuestion]?.id || '',
            answer,
            isCorrect: false,
          },
        ])
      }
    },
    [currentQuestion, questions]
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
    
    const currentAnswer = answers[currentQuestion]
    if (!currentAnswer) {
      setAnswers((prev) => {
        const newAnswers = [...prev]
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
      setIsComplete(true)
    } else {
      setCurrentQuestion(next)
      setShowFeedback(false)
      setCurrentIsCorrect(null)
    }
  }, [currentQuestion, questions, answers])

  const completeVideoQuiz = useCallback(async (): Promise<{
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    passed: boolean
    score: number
  }> => {
    if (!videoLessonData?.video) {
      return { xpEarned: 0, gemsEarned: 0, leveledUp: false, newLevel: 0, passed: false, score: 0 }
    }

    const quiz = videoLessonData.quiz
    if (!quiz) {
      return { xpEarned: 0, gemsEarned: 0, leveledUp: false, newLevel: 0, passed: false, score: 0 }
    }

    // Build answers array for submission
    const submittedAnswers = answers.map((a, index) => ({
      questionId: a.questionId,
      answer: a.answer,
    }))

    try {
      const res = await fetch(`/api/videos/${videoLessonData.video.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: submittedAnswers,
        }),
      })

      if (res.ok) {
        const data = await res.json()

        // Update local state with rewards from server
        if (data.xpEarned) {
          updateXP(data.xpEarned)
        }
        if (data.gemsEarned) {
          updateGems(data.gemsEarned)
        }
        if (data.leveledUp && data.newLevel) {
          updateUser({ level: data.newLevel })
        }

        // Clear session on successful completion
        removeVideoLessonSession(videoLessonData.video.id)

        return {
          xpEarned: data.xpEarned || 0,
          gemsEarned: data.gemsEarned || 0,
          leveledUp: data.leveledUp || false,
          newLevel: data.newLevel || 0,
          passed: data.passed || false,
          score: data.score || 0,
        }
      }
    } catch (err) {
      console.error('Failed to complete video quiz:', err)
    }

    // Fallback calculation
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
    const isPassed = percentage >= quiz.passingScore

    // Clear session
    removeVideoLessonSession(videoLessonData.video.id)

    return {
      xpEarned: 0,
      gemsEarned: 0,
      leveledUp: false,
      newLevel: 0,
      passed: isPassed,
      score: percentage,
    }
  }, [videoLessonData, questions, score, answers, updateXP, updateGems, updateUser])

  const resetVideoLesson = useCallback(() => {
    if (videoIdRef.current) {
      removeVideoLessonSession(videoIdRef.current)
    }
    if (!videoLessonData) return
    setCurrentQuestion(0)
    setScore(0)
    setAnswers([])
    setIsComplete(false)
    setShowFeedback(false)
    setCurrentIsCorrect(null)
    setHearts(user?.hearts ?? 5)
    setVideoEnded(false)
  }, [videoLessonData, user])

  const clearSession = useCallback(() => {
    if (videoIdRef.current) {
      removeVideoLessonSession(videoIdRef.current)
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
    videoLessonData,
    error,
    videoEnded,
    hasRecoveredSession,
    startVideoLesson,
    setVideoEnded,
    answerQuestion,
    nextQuestion,
    skipQuestion,
    completeVideoQuiz,
    resetVideoLesson,
    clearSession,
  }
}
