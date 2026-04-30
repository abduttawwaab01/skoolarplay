'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/auth-store'

export interface ExamSection {
  id: string
  title: string
  instruction: string | null
  marks: number
  order: number
  questions: ExamQuestion[]
}

export interface ExamQuestion {
  id: string
  sectionId: string
  type: string
  question: string
  options: string | null
  marks: number
  order: number
}

export interface ExamData {
  id: string
  title: string
  description: string | null
  type: string
  subject: string
  year: number | null
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMark: number
  sections: ExamSection[]
  previousAttempts: {
    id: string
    score: number
    totalMarks: number
    percentage: number
    passed: boolean
    timeSpent: number
    completedAt: string | null
  }[]
}

export interface ExamResult {
  id: string
  score: number
  totalMarks: number
  percentage: number
  passed: boolean
  timeSpent: number
  sectionScores: Record<string, { score: number; total: number; percentage: number }>
  xpEarned: number
  gemsEarned: number
  questions: {
    id: string
    sectionId: string
    type: string
    question: string
    options: string | null
    correctAnswer: string
    marks: number
    explanation: string | null
  }[]
}

interface ExamSessionState {
  examId: string
  answers: Record<string, string>
  markedQuestions: string[]
  currentQuestionIndex: number
  currentSectionIndex: number
  timeRemaining: number
  startTime: number
  savedAt: number
}

interface UseExamReturn {
  exam: ExamData | null
  allQuestions: ExamQuestion[]
  currentQuestionIndex: number
  currentSectionIndex: number
  answers: Record<string, string>
  markedQuestions: Set<string>
  timeRemaining: number
  isStarted: boolean
  isComplete: boolean
  isSubmitted: boolean
  isLoading: boolean
  isSubmitting: boolean
  result: ExamResult | null
  error: string | null
  hasRecoveredSession: boolean
  clearSession: () => void
  startExam: (examId: string) => Promise<void>
  answerQuestion: (questionId: string, answer: string) => void
  markForReview: (questionId: string) => void
  goToQuestion: (index: number) => void
  goToSection: (sectionIndex: number) => void
  submitExam: () => Promise<void>
  calculateScore: () => { answered: number; total: number; percentage: number }
}

const SESSION_KEY_PREFIX = 'skoolar_exam_session_'

function getSessionKey(examId: string): string {
  return `${SESSION_KEY_PREFIX}${examId}`
}

function saveSession(state: ExamSessionState): void {
  try {
    sessionStorage.setItem(getSessionKey(state.examId), JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save exam session:', e)
  }
}

function loadSession(examId: string): ExamSessionState | null {
  try {
    const saved = sessionStorage.getItem(getSessionKey(examId))
    if (saved) {
      return JSON.parse(saved) as ExamSessionState
    }
  } catch (e) {
    console.error('Failed to load exam session:', e)
  }
  return null
}

function removeExamSession(examId: string): void {
  try {
    sessionStorage.removeItem(getSessionKey(examId))
    sessionStorage.removeItem('exam-session-active')
  } catch (e) {
    console.error('Failed to clear exam session:', e)
  }
}

export function useExam(): UseExamReturn {
  const { user, updateXP, updateGems } = useAuthStore()
  const [exam, setExam] = useState<ExamData | null>(null)
  const [allQuestions, setAllQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasRecoveredSession, setHasRecoveredSession] = useState(false)
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const examIdRef = useRef<string | null>(null)
  const isInitializedRef = useRef(false)

  // Mark session as active when exam starts
  const markSessionActive = useCallback((examId: string) => {
    try {
      sessionStorage.setItem('exam-session-active', JSON.stringify({
        examId,
        startedAt: Date.now()
      }))
    } catch (e) {
      console.error('Failed to mark session active:', e)
    }
  }, [])

  // Timer with session persistence
  useEffect(() => {
    if (isStarted && !isComplete && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current)
            setTimeout(() => handleAutoSubmit(), 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [isStarted, isComplete])

  // Save session whenever state changes (debounced)
  useEffect(() => {
    if (!isStarted || !exam?.id || isComplete || isSubmitted) return
    
    const state: ExamSessionState = {
      examId: exam.id,
      answers,
      markedQuestions: Array.from(markedQuestions),
      currentQuestionIndex,
      currentSectionIndex,
      timeRemaining,
      startTime: startTimeRef.current,
      savedAt: Date.now()
    }
    
    saveSession(state)
  }, [exam?.id, answers, markedQuestions, currentQuestionIndex, currentSectionIndex, timeRemaining, isStarted, isComplete, isSubmitted])

  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitted || !exam?.id) return
    
    setIsComplete(true)
    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const res = await fetch(`/api/exams/${exam.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data.attempt)
        if (data.attempt.xpEarned) updateXP(data.attempt.xpEarned)
        if (data.attempt.gemsEarned) updateGems(data.attempt.gemsEarned)
        removeExamSession(exam.id)
      }
    } catch (err) {
      console.error('Auto-submit failed:', err)
    }
    setIsSubmitted(true)
  }, [isSubmitted, exam?.id, answers, updateXP, updateGems])

  const startExam = useCallback(async (examId: string) => {
    setIsLoading(true)
    setError(null)
    setHasRecoveredSession(false)
    
    try {
      // Check for existing session
      const savedSession = loadSession(examId)
      
      const res = await fetch(`/api/exams/${examId}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to load exam')
        return
      }
      const data = await res.json()
      const examData = data.exam as ExamData
      setExam(examData)
      examIdRef.current = examId

      // Flatten all questions
      const flat: ExamQuestion[] = []
      for (const section of examData.sections) {
        for (const q of section.questions) {
          flat.push({ ...q, sectionId: section.id })
        }
      }
      setAllQuestions(flat)

      // If we have a saved session, restore it
      if (savedSession && savedSession.examId === examId) {
        const savedAge = Date.now() - savedSession.savedAt
        const sessionValid = savedAge < (examData.duration * 60 * 1000 * 1.5) // 1.5x duration
        
        if (sessionValid) {
          // Restore session
          setAnswers(savedSession.answers || {})
          setMarkedQuestions(new Set(savedSession.markedQuestions || []))
          setCurrentQuestionIndex(savedSession.currentQuestionIndex || 0)
          setCurrentSectionIndex(savedSession.currentSectionIndex || 0)
          
          // Calculate adjusted time remaining
          const elapsed = Math.floor((Date.now() - savedSession.savedAt) / 1000)
          const adjustedTime = Math.max(0, savedSession.timeRemaining - elapsed)
          setTimeRemaining(adjustedTime)
          
          startTimeRef.current = savedSession.startTime || Date.now()
          setHasRecoveredSession(true)
        } else {
          // Session expired, start fresh
          setCurrentQuestionIndex(0)
          setCurrentSectionIndex(0)
          setAnswers({})
          setMarkedQuestions(new Set())
          setTimeRemaining(examData.duration * 60)
          startTimeRef.current = Date.now()
        }
      } else {
        // No session, start fresh
        setCurrentQuestionIndex(0)
        setCurrentSectionIndex(0)
        setAnswers({})
        setMarkedQuestions(new Set())
        setTimeRemaining(examData.duration * 60)
        startTimeRef.current = Date.now()
      }
      
      setIsStarted(true)
      setIsComplete(false)
      setIsSubmitted(false)
      setResult(null)
      
      // Mark session as active for service worker
      markSessionActive(examId)
      
    } catch (err) {
      setError('Failed to load exam')
    } finally {
      setIsLoading(false)
    }
  }, [markSessionActive])

  const answerQuestion = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }, [])

  const markForReview = useCallback((questionId: string) => {
    setMarkedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }, [])

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < allQuestions.length) {
      setCurrentQuestionIndex(index)
      const q = allQuestions[index]
      if (exam) {
        const sectionIndex = exam.sections.findIndex((s) => s.id === q.sectionId)
        if (sectionIndex >= 0) setCurrentSectionIndex(sectionIndex)
      }
    }
  }, [allQuestions, exam])

  const goToSection = useCallback((sectionIndex: number) => {
    if (!exam || sectionIndex < 0 || sectionIndex >= exam.sections.length) return
    setCurrentSectionIndex(sectionIndex)
    const section = exam.sections[sectionIndex]
    const firstQIndex = allQuestions.findIndex((q) => q.sectionId === section.id)
    if (firstQIndex >= 0) setCurrentQuestionIndex(firstQIndex)
  }, [exam, allQuestions])

  const submitExam = useCallback(async () => {
    if (!exam || isSubmitting || isSubmitted) return
    setIsSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const res = await fetch(`/api/exams/${exam.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, timeSpent }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data.attempt)
        if (data.attempt.xpEarned) updateXP(data.attempt.xpEarned)
        if (data.attempt.gemsEarned) updateGems(data.attempt.gemsEarned)
        removeExamSession(exam.id)
      } else {
        setError('Failed to submit exam')
      }
    } catch (err) {
      setError('Failed to submit exam')
    } finally {
      setIsSubmitting(false)
      setIsComplete(true)
      setIsSubmitted(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [exam, answers, isSubmitting, isSubmitted, updateXP, updateGems])

  const calculateScore = useCallback((): { answered: number; total: number; percentage: number } => {
    const answered = Object.keys(answers).filter((k) => answers[k].trim() !== '').length
    const total = allQuestions.length
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    }
  }, [answers, allQuestions])

  const clearSession = useCallback(() => {
    if (exam?.id) {
      removeExamSession(exam.id)
    }
  }, [exam?.id])

  return {
    exam,
    allQuestions,
    currentQuestionIndex,
    currentSectionIndex,
    answers,
    markedQuestions,
    timeRemaining,
    isStarted,
    isComplete,
    isSubmitted,
    isLoading,
    isSubmitting,
    result,
    error,
    hasRecoveredSession,
    clearSession,
    startExam,
    answerQuestion,
    markForReview,
    goToQuestion,
    goToSection,
    submitExam,
    calculateScore,
  }
}
