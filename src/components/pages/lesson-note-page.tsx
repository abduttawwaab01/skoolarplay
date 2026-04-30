'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Play, Volume2, Trophy, Star, Zap, Gem, ChevronRight, Lock, Unlock, CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { AudioPlayButton } from '@/components/shared/audio-play-button'
import { LessonNoteQuizResults } from '@/components/learning/lesson-note-quiz-results'

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  type: string
}

interface LessonNote {
  id: string
  title: string
  content: string
  audioUrl: string | null
  hasQuiz: boolean
  quizTitle: string
  quizQuestions: QuizQuestion[]
  quizPassingScore: number
  quizTimeLimit: number | null
  quizRequireFullscreen: boolean
  quizPreventTabSwitch: boolean
  quizPreventCopyPaste: boolean
  quizShuffleQuestions: boolean
  quizShuffleOptions: boolean
  quizXpReward: number
  quizGemReward: number
}

interface Lesson {
  id: string
  title: string
  type: string
  xpReward: number
  gemReward: number
  lessonNote: LessonNote | null
  module: {
    id: string
    title: string
    course: {
      id: string
      title: string
    }
  }
}

export default function LessonNotePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { navigateTo } = useAppStore()
  const { user } = useAuthStore()
  
  // Sound effects
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const playLevelUp = useSoundEffect('levelUp')
  const playGemCollect = useSoundEffect('gemCollect')
  const playXPGain = useSoundEffect('xpGain')
  const playOpen = useSoundEffect('open')
  const playClose = useSoundEffect('close')
  
  const courseId = searchParams.get('courseId')
  const lessonId = searchParams.get('lessonId')
  
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [view, setView] = useState<'note' | 'quiz' | 'results'>('note')
  
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  // Results state
  const [resultPassed, setResultPassed] = useState(false)
  const [resultPercentage, setResultPercentage] = useState(0)
  const [resultXpEarned, setResultXpEarned] = useState(0)
  const [resultGemsEarned, setResultGemsEarned] = useState(0)
  
  const contentRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!lessonId) return
    
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}`)
        if (res.ok) {
          const data = await res.json()
          setLesson(data.lesson)
          if (data.lesson.lessonNote?.hasQuiz && data.lesson.lessonNote.quizTimeLimit) {
            setTimeLeft(data.lesson.lessonNote.quizTimeLimit * 60)
          }
        } else {
          toast.error('Failed to load lesson')
          navigateTo('dashboard')
        }
      } catch {
        toast.error('Failed to load lesson')
        navigateTo('dashboard')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLesson()
  }, [lessonId])
  
  // Timer effect
  useEffect(() => {
    if (view !== 'quiz' || timeLeft === null || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [view, timeLeft])
  
  // Tab switch prevention
  useEffect(() => {
    if (view !== 'quiz' || !lesson?.lessonNote?.quizPreventTabSwitch) return
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.warning('Tab switch detected! This may affect your quiz.')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [view, lesson?.lessonNote?.quizPreventTabSwitch])
  
  // Copy paste prevention
  useEffect(() => {
    if (view !== 'quiz' || !lesson?.lessonNote?.quizPreventCopyPaste) return
    
    const preventCopy = (e: Event) => {
      e.preventDefault()
      toast.warning('Copy/paste is disabled during this quiz')
    }
    
    document.addEventListener('copy', preventCopy)
    document.addEventListener('cut', preventCopy)
    document.addEventListener('paste', preventCopy)
    
    return () => {
      document.removeEventListener('copy', preventCopy)
      document.removeEventListener('cut', preventCopy)
      document.removeEventListener('paste', preventCopy)
    }
  }, [view, lesson?.lessonNote?.quizPreventCopyPaste])
  
  const handleStartQuiz = () => {
    if (!lesson?.lessonNote) return
    
    let questions = [...(Array.isArray(lesson.lessonNote.quizQuestions) ? lesson.lessonNote.quizQuestions : [])]
    
    // Shuffle questions if enabled
    if (lesson.lessonNote.quizShuffleQuestions && questions.length > 0) {
      questions = questions.sort(() => Math.random() - 0.5)
    }
    
    // Shuffle options if enabled
    if (lesson.lessonNote.quizShuffleOptions) {
      questions = questions.map(q => {
        const opts = Array.isArray(q.options) ? q.options : []
        if (opts.length === 0) return q
        const shuffled = [...opts].sort(() => Math.random() - 0.5)
        const originalIndex = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
        return {
          ...q,
          options: shuffled,
          correctAnswer: originalIndex < opts.length ? originalIndex : 0
        }
      })
    }
    
    setLesson({ ...lesson, lessonNote: { ...lesson.lessonNote, quizQuestions: questions } })
    setAnswers(new Array(questions.length).fill(-1))
    setCurrentQuestion(0)
    setScore(0)
    setStartTime(Date.now())
    setView('quiz')
  }
  
  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return
    setSelectedAnswer(index)
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = index
    setAnswers(newAnswers)
  }
  
  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer')
      return
    }
    setShowFeedback(true)
    
    const questions = Array.isArray(lesson?.lessonNote?.quizQuestions) ? lesson.lessonNote.quizQuestions : []
    if (!questions[currentQuestion]) return
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1)
      playCorrect()
    } else {
      playWrong()
    }
  }
  
  const handleNextQuestion = () => {
    const questions = Array.isArray(lesson?.lessonNote?.quizQuestions) ? lesson.lessonNote.quizQuestions : []
    if (questions.length > 0 && currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(answers[currentQuestion + 1])
      setShowFeedback(false)
    } else {
      handleSubmitQuiz()
    }
  }
  
  const handleSubmitQuiz = async () => {
    const questions = Array.isArray(lesson?.lessonNote?.quizQuestions) ? lesson.lessonNote.quizQuestions : []
    const totalQuestions = questions.length || 1
    const passingScore = lesson?.lessonNote?.quizPassingScore || 50
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0
    const passed = percentage >= passingScore
    
    // Get rewards from lesson note (stored in db but need to add to API response)
    const xpReward = passed ? (lesson?.lessonNote?.quizXpReward || 10) : 0
    const gemReward = passed ? (lesson?.lessonNote?.quizGemReward || 1) : 0
    
    // Transform answers to API format { questionId, answer }
    const formattedAnswers = questions.map((q, i) => ({
      questionId: (q as any).id || `q-${i}`,
      answer: String(answers[i] ?? ''),
      isCorrect: answers[i] === q.correctAnswer,
    }))
    
    // Set results state
    setResultPassed(passed)
    setResultPercentage(percentage)
    setResultXpEarned(xpReward)
    setResultGemsEarned(gemReward)
    setView('results')
    
    // Play completion sounds
    if (passed) {
      playLevelUp()
      setTimeout(() => playXPGain(), 600)
      setTimeout(() => playGemCollect(), 1000)
    }
    
    // Save progress
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: formattedAnswers,
          score: percentage,
          passed,
          type: 'LESSON_NOTE_QUIZ',
          xpReward,
          gemReward,
        }),
      })
    } catch {
      // Silent fail
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!lesson || !lesson.lessonNote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <Button onClick={() => navigateTo('dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }
  
  const { lessonNote } = lesson
  const questions = Array.isArray(lessonNote.quizQuestions) ? lessonNote.quizQuestions : []
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const passed = percentage >= lessonNote.quizPassingScore
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/10 border-b p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigateTo('course', { courseId })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Course
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                {lessonNote.title}
              </h1>
              <p className="text-muted-foreground">{lesson.module.course.title} - {lesson.module.title}</p>
            </div>
            {view === 'quiz' && timeLeft !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        {view === 'note' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Study Note</CardTitle>
                {lessonNote.audioUrl && (
                  <div className="flex items-center gap-2">
                    <AudioPlayButton text={lessonNote.content} />
                    <span className="text-sm text-muted-foreground">Listen</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <div ref={contentRef} className="whitespace-pre-wrap">
                  {lessonNote.content}
                </div>
              </CardContent>
            </Card>
            
            {/* Code IDE Button */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open('/code-ide', '_blank')}
                >
                  <Terminal className="w-4 h-4" />
                  Open Code IDE
                </Button>
              </CardContent>
            </Card>
            
            {lessonNote.hasQuiz && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        {lessonNote.quizTitle || 'Knowledge Check'}
                      </h3>
                      <p className="text-muted-foreground">
                        {questions.length} questions • Passing score: {lessonNote.quizPassingScore}%
                        {lessonNote.quizTimeLimit && ` • Time limit: ${lessonNote.quizTimeLimit} min`}
                      </p>
                    </div>
                    <Button onClick={handleStartQuiz} className="gap-2">
                      <Play className="w-4 h-4" />
                      Start Quiz
                    </Button>
                  </div>
                  
                  {lessonNote.quizRequireFullscreen && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Fullscreen mode required during quiz
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
        
        {view === 'quiz' && questions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                  <Badge variant="outline">
                    Score: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
                  </Badge>
                </div>
                <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{questions[currentQuestion].question}</h3>
                  <AudioPlayButton text={questions[currentQuestion].question} size="sm" />
                </div>
                
                <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => handleAnswerSelect(parseInt(v))}>
                  {questions[currentQuestion].options.map((option, i) => (
                    <div key={i} className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                      showFeedback
                        ? i === questions[currentQuestion].correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-950'
                          : selectedAnswer === i
                            ? 'border-red-500 bg-red-50 dark:bg-red-950'
                            : 'border-border opacity-50'
                        : selectedAnswer === i
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                    }`}>
                      <RadioGroupItem value={i.toString()} id={`option-${i}`} disabled={showFeedback} />
                      <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                        {option}
                        {showFeedback && i === questions[currentQuestion].correctAnswer && (
                          <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                        )}
                        {showFeedback && selectedAnswer === i && i !== questions[currentQuestion].correctAnswer && (
                          <XCircle className="w-4 h-4 text-red-500 inline ml-2" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="flex justify-end gap-2">
                  {!showFeedback ? (
                    <Button onClick={handleCheckAnswer} disabled={selectedAnswer === null}>
                      Check Answer
                    </Button>
                  ) : (
                    <Button onClick={handleNextQuestion}>
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {view === 'results' && (
          <LessonNoteQuizResults
            score={score}
            total={questions.length}
            xpEarned={resultXpEarned}
            gemsEarned={resultGemsEarned}
            passed={resultPassed}
            lessonTitle={lessonNote.title}
            passingScore={lessonNote.quizPassingScore}
            onContinue={() => navigateTo('course', { courseId })}
            onRetry={handleStartQuiz}
          />
        )}
      </div>
    </div>
  )
}