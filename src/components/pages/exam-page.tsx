'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Award,
  Zap,
  Gem,
  Timer,
  Loader2,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app-store'
import { AudioPlayButton } from '@/components/shared/audio-play-button'
import { useExam, type ExamResult } from '@/hooks/use-exam'
import { useSoundEffect } from '@/hooks/use-sound'
import { QuotePreloader } from '@/components/shared/quote-preloader'

function getWaecGrade(percentage: number): { grade: string; label: string } {
  if (percentage >= 75) return { grade: 'A1', label: 'Excellent' }
  if (percentage >= 70) return { grade: 'B2', label: 'Very Good' }
  if (percentage >= 65) return { grade: 'B3', label: 'Good' }
  if (percentage >= 60) return { grade: 'C4', label: 'Credit' }
  if (percentage >= 55) return { grade: 'C5', label: 'Credit' }
  if (percentage >= 50) return { grade: 'C6', label: 'Credit' }
  if (percentage >= 45) return { grade: 'D7', label: 'Pass' }
  if (percentage >= 40) return { grade: 'E8', label: 'Weak Pass' }
  return { grade: 'F9', label: 'Fail' }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ==================== PRE-EXAM SCREEN ====================

function PreExamScreen({
  exam,
  onStart,
  previousAttempts,
}: {
  exam: NonNullable<ReturnType<typeof useExam>['exam']>
  onStart: () => void
  previousAttempts: { score: number; totalMarks: number; percentage: number; passed: boolean }[]
}) {
  const playOpen = useSoundEffect('open')

  const handleStart = () => {
    playOpen()
    onStart()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <Card className="bg-slate-800/50 border-slate-700 text-white overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {exam.type} {exam.year && `- ${exam.year}`}
                </Badge>
                <p className="text-white/80 text-sm mt-1">{exam.subject}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold">{exam.title}</h2>
            {exam.description && (
              <p className="text-white/70 text-sm mt-1">{exam.description}</p>
            )}
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-slate-700/50">
                <Timer className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                <p className="font-bold text-lg">{exam.duration}</p>
                <p className="text-xs text-slate-400">Minutes</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-700/50">
                <BookOpen className="w-5 h-5 mx-auto text-green-400 mb-1" />
                <p className="font-bold text-lg">{exam.totalQuestions}</p>
                <p className="text-xs text-slate-400">Questions</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-700/50">
                <Award className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="font-bold text-lg">{exam.passingMark}%</p>
                <p className="text-xs text-slate-400">Pass Mark</p>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-slate-700/30 rounded-xl p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Exam Rules
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  No hints or retries during the exam
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  Timer starts when you begin — it cannot be paused
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  Exam auto-submits when time runs out
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  You can navigate between questions freely
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  You need {exam.passingMark}% to pass
                </li>
              </ul>
            </div>

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
              <div className="bg-slate-700/30 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2">Previous Attempts</h4>
                {previousAttempts.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">Attempt {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className={a.passed ? 'text-green-400' : 'text-red-400'}>
                        {a.percentage}%
                      </span>
                      {a.passed && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sections Preview */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Sections</h4>
              <div className="space-y-2">
                {exam.sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-700/30">
                    <span className="text-slate-300">{section.title}</span>
                    <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                      {section.questions.length} questions
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Begin Button */}
            <Button
              onClick={handleStart}
              className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Begin Exam
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ==================== EXAM TAKING SCREEN ====================

function ExamTakingScreen({
  hook,
  onClose,
}: {
  hook: ReturnType<typeof useExam>
  onClose: () => void
}) {
  const {
    exam,
    allQuestions,
    currentQuestionIndex,
    currentSectionIndex,
    answers,
    markedQuestions,
    timeRemaining,
    submitExam,
    answerQuestion,
    markForReview,
    goToQuestion,
    goToSection,
    calculateScore,
    isSubmitting,
  } = hook

  const playClick = useSoundEffect('click')
  const playSlide = useSoundEffect('slide')
  const playTimer = useSoundEffect('timer')
  const playCountdown = useSoundEffect('countdown')
  const playNotification = useSoundEffect('notification')
  const playExamSubmit = useSoundEffect('examSubmit')

  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const timerPlayedRef = useRef(false)
  const countdownPlayedRef = useRef(false)
  const notificationPlayedRef = useRef(false)

  const currentQuestion = allQuestions[currentQuestionIndex]
  const currentSection = exam?.sections[currentSectionIndex]
  const stats = calculateScore()
  const timeWarning = timeRemaining < 300 // < 5 minutes
  const options = currentQuestion?.options ? JSON.parse(currentQuestion.options) : null

  // Timer sound effects — play once per threshold
  useEffect(() => {
    if (timeRemaining <= 120 && timeRemaining > 0 && !timerPlayedRef.current) {
      timerPlayedRef.current = true
      playTimer()
    }
    if (timeRemaining <= 30 && timeRemaining > 0 && !countdownPlayedRef.current) {
      countdownPlayedRef.current = true
      playCountdown()
    }
    if (timeWarning && !notificationPlayedRef.current) {
      notificationPlayedRef.current = true
      playNotification()
    }
  }, [timeRemaining, timeWarning, playTimer, playCountdown, playNotification])

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    playClick()
    answerQuestion(questionId, answer)
  }, [playClick, answerQuestion])

  const handleNavigate = useCallback((index: number) => {
    playSlide()
    goToQuestion(index)
  }, [playSlide, goToQuestion])

  const handleSectionNav = useCallback((sectionIndex: number) => {
    playSlide()
    goToSection(sectionIndex)
  }, [playSlide, goToSection])

  const handleSubmit = useCallback(() => {
    playExamSubmit()
    submitExam()
  }, [playExamSubmit, submitExam])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You have answered {stats.answered} out of {stats.total} questions.
              {stats.answered < stats.total && (
                <span className="text-yellow-400"> {stats.total - stats.answered} questions are still unanswered.</span>
              )}
              {markedQuestions.size > 0 && (
                <span className="text-orange-400"> {markedQuestions.size} question(s) marked for review.</span>
              )}
              {' '}This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
              Continue Exam
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitDialog(false)
                handleSubmit()
              }}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Top Bar */}
      <div className="shrink-0 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">
              <X className="w-5 h-5" />
            </Button>
            <div>
              <p className="font-semibold text-sm">{exam?.title}</p>
              <p className="text-xs text-slate-400">{currentSection?.title}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
            timeWarning
              ? 'bg-red-500/20 text-red-400 animate-pulse'
              : 'bg-slate-700 text-white'
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeRemaining)}
          </div>

          {/* Read Question Button + Question Counter */}
          <div className="flex items-center gap-3">
            {currentQuestion?.question && (
              <AudioPlayButton
                text={currentQuestion.question}
                size="sm"
              />
            )}
            <div className="text-right">
              <p className="font-semibold text-sm">
                {currentQuestionIndex + 1} / {allQuestions.length}
              </p>
              <p className="text-xs text-slate-400">{stats.answered} answered</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <Progress value={stats.percentage} className="h-1 bg-slate-700" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Question Panel */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentQuestion && currentSection && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                {/* Section Header */}
                <div className="mb-6">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-3">
                    {currentSection.title}
                  </Badge>
                  {currentSection.instruction && (
                    <p className="text-sm text-slate-400 italic mb-4">{currentSection.instruction}</p>
                  )}
                </div>

                {/* Question */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-slate-400">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <Badge variant="secondary" className="text-[10px] bg-slate-700 text-slate-300">
                      {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
                    </Badge>
                    {markedQuestions.has(currentQuestion.id) && (
                      <Badge className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20">
                        <Flag className="w-3 h-3 mr-1" /> Marked
                      </Badge>
                    )}
                    {currentQuestion.question && (
                      <AudioPlayButton
                        text={currentQuestion.question}
                        size="sm"
                        className="ml-auto"
                      />
                    )}
                  </div>
                  <h3 className="text-base md:text-lg font-medium leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Answer Options / Input */}
                {currentQuestion.type === 'MCQ' && options ? (
                  <div className="space-y-2 mb-8">
                    {options.map((option: string, idx: number) => {
                      const letter = String.fromCharCode(65 + idx)
                      const isSelected = answers[currentQuestion.id] === option
                      return (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleAnswer(currentQuestion.id, option)}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                          }`}>
                            {letter}
                          </span>
                          <span className="text-sm">{option}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                ) : currentQuestion.type === 'TRUE_FALSE' ? (
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {['True', 'False'].map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt
                      return (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswer(currentQuestion.id, opt)}
                          className={`p-6 rounded-xl text-center font-semibold transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 border-2 border-blue-500 text-blue-300'
                              : 'bg-slate-800 border-2 border-slate-700 hover:border-slate-600 text-slate-300'
                          }`}
                        >
                          {opt === 'True' ? '✅' : '❌'} {opt}
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mb-8">
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => answerQuestion(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.type === 'FILL_BLANK' ? 'Type your answer here...' : 'Write your answer...'}
                      rows={4}
                      className="w-full p-4 rounded-xl bg-slate-800 border-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none resize-none text-sm"
                    />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => markForReview(currentQuestion.id)}
                    className={`rounded-full ${
                      markedQuestions.has(currentQuestion.id)
                        ? 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    {markedQuestions.has(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
                  </Button>

                  {currentQuestionIndex < allQuestions.length - 1 ? (
                    <Button
                      onClick={() => handleNavigate(currentQuestionIndex + 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => { playClick(); setShowSubmitDialog(true) }}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold"
                    >
                      Submit Exam
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - Question Navigator (Desktop) */}
        <div className="hidden lg:block w-72 shrink-0 bg-slate-800/50 border-l border-slate-700 p-4 overflow-y-auto">
          <h4 className="text-sm font-semibold mb-3 text-slate-300">Question Navigator</h4>

          {/* Sections */}
          {exam?.sections.map((section, sIdx) => (
            <div key={section.id} className="mb-4">
              <button
                onClick={() => handleSectionNav(sIdx)}
                className="text-xs font-medium text-slate-400 hover:text-white mb-2 flex items-center gap-1"
              >
                {section.title} ({section.questions.length})
              </button>
              <div className="grid grid-cols-5 gap-1.5">
                {allQuestions.map((q, qIdx) => {
                  if (q.sectionId !== section.id) return null
                  const isAnswered = !!answers[q.id] && answers[q.id].trim() !== ''
                  const isMarked = markedQuestions.has(q.id)
                  const isCurrent = qIdx === currentQuestionIndex

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleNavigate(qIdx)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-800'
                          : isMarked
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : isAnswered
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-slate-700 text-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <Separator className="my-4 bg-slate-700" />

          {/* Legend */}
          <div className="space-y-1.5 text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-600/20 border border-green-500/30" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
              Marked
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-700" />
              Unanswered
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={() => { playClick(); setShowSubmitDialog(true) }}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold"
          >
            Submit Exam
          </Button>
        </div>
      </div>

      {/* Mobile Question Navigator */}
      <div className="lg:hidden shrink-0 bg-slate-800 border-t border-slate-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">{stats.answered}/{stats.total} answered</span>
          <Button
            size="sm"
            onClick={() => setShowSubmitDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full text-xs h-7"
          >
            Submit
          </Button>
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {allQuestions.map((q, qIdx) => {
            const isAnswered = !!answers[q.id] && answers[q.id].trim() !== ''
            const isMarked = markedQuestions.has(q.id)
            const isCurrent = qIdx === currentQuestionIndex

            return (
              <button
                key={q.id}
                onClick={() => handleNavigate(qIdx)}
                className={`w-8 h-8 rounded-lg text-[10px] font-medium shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : isMarked
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : isAnswered
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-700 text-slate-500'
                }`}
              >
                {qIdx + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== RESULTS SCREEN ====================

function ResultsScreen({
  result,
  exam,
  answersMap,
  onClose,
  onRetry,
}: {
  result: ExamResult
  exam: NonNullable<ReturnType<typeof useExam>['exam']>
  answersMap: Record<string, string>
  onClose: () => void
  onRetry: () => void
}) {
  const playAchievement = useSoundEffect('achievement')
  const playWrong = useSoundEffect('wrong')
  const playLevelUp = useSoundEffect('levelUp')

  const [showReview, setShowReview] = useState(false)
  const grade = getWaecGrade(result.percentage)
  const formatTimeSpent = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  // Play result sounds once on mount
  useEffect(() => {
    if (result.passed) {
      playAchievement()
      if (grade.grade === 'A1' || grade.grade === 'B2') {
        setTimeout(() => playLevelUp(), 500)
      }
    } else {
      playWrong()
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Animated Header */}
      <div className={`p-6 md:p-8 text-center ${
        result.passed
          ? 'bg-gradient-to-b from-green-900/50 to-slate-900'
          : 'bg-gradient-to-b from-red-900/30 to-slate-900'
      }`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mb-4"
        >
          {result.passed ? (
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-14 h-14 text-green-400" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-14 h-14 text-red-400" />
            </div>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-bold"
        >
          {result.passed ? 'Congratulations!' : 'Keep Practicing!'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <p className="text-6xl md:text-7xl font-black">
            <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
              {result.score}
            </span>
            <span className="text-slate-500 text-3xl">/{result.totalMarks}</span>
          </p>
          <p className="text-xl font-semibold mt-1">{result.percentage}%</p>
        </motion.div>

        {/* Grade Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex items-center justify-center gap-3"
        >
          <Badge className={`px-4 py-1.5 text-lg font-bold rounded-full border-2 ${
            result.passed
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {result.passed ? '✅ PASSED' : '❌ NOT PASSED'}
          </Badge>
          <Badge className="px-4 py-1.5 text-lg font-bold rounded-full bg-blue-500/10 text-blue-400 border-blue-500/30">
            Grade: {grade.grade}
          </Badge>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{result.xpEarned}</p>
              <p className="text-xs text-slate-400">XP Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Gem className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{result.gemsEarned}</p>
              <p className="text-xs text-slate-400">Gems Earned</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-xl font-bold">{formatTimeSpent(result.timeSpent)}</p>
              <p className="text-xs text-slate-400">Time Spent</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Section Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Section Breakdown
              </h3>
              <div className="space-y-3">
                {exam.sections.map((section) => {
                  const ss = result.sectionScores[section.id]
                  return (
                    <div key={section.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-300">{section.title}</span>
                        <span className={`font-semibold ${
                          ss && ss.percentage >= 50 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {ss ? `${ss.score}/${ss.total} (${ss.percentage}%)` : 'N/A'}
                        </span>
                      </div>
                      <Progress
                        value={ss?.percentage || 0}
                        className="h-2 bg-slate-700"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Question Review Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={() => setShowReview(!showReview)}
            variant="outline"
            className="w-full bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700 rounded-xl h-12 font-semibold"
          >
            {showReview ? 'Hide' : 'Show'} Answer Review
            <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showReview ? 'rotate-90' : ''}`} />
          </Button>
        </motion.div>

        {/* Question Review */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              {result.questions.map((q, i) => {
                const section = exam.sections.find((s) => s.id === q.sectionId)
                const correctAnswer = typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer)
                // Check if correct from result logic
                const userAnswer = answersMap[q.id]

                return (
                  <Card key={q.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                          userAnswer === correctAnswer ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {userAnswer === correctAnswer ? '✓' : '✗'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-slate-500">Q{i + 1}</span>
                            <Badge variant="secondary" className="text-[10px] bg-slate-700 text-slate-400">
                              {q.type} · {q.marks}m
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-200 mb-2">{q.question}</p>

                          <div className="space-y-1 text-xs">
                            <p className="text-slate-400">
                              Your answer: <span className={userAnswer === correctAnswer ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                                {userAnswer || 'Not answered'}
                              </span>
                            </p>
                            {userAnswer !== correctAnswer && (
                              <p className="text-slate-400">
                                Correct answer: <span className="text-green-400 font-semibold">{correctAnswer}</span>
                              </p>
                            )}
                          </div>

                          {q.explanation && (
                            <div className="mt-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                              <p className="text-xs text-blue-300/80">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex gap-3 pt-4"
        >
          <Button
            onClick={onRetry}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold h-12"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Exam
          </Button>
          <Button
            onClick={() => { setShowReview(true) }}
            variant="outline"
            className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl font-semibold h-12"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Review Answers
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 rounded-xl font-semibold h-12"
          >
            Back to Hub
          </Button>
        </motion.div>
      </div>
    </div>
  )
}



// ==================== MAIN EXAM PAGE ====================

export function ExamPage() {
  const { params, navigateTo } = useAppStore()
  const examId = params?.examId as string
  const playOpen = useSoundEffect('open')

  const examHook = useExam()
  const [showQuoteLoader, setShowQuoteLoader] = useState(true)
  const [hasPlayedOpen, setHasPlayedOpen] = useState(false)

  // Play sound effect once on mount
  useEffect(() => {
    if (!hasPlayedOpen) {
      playOpen()
      setHasPlayedOpen(true)
    }
  }, [hasPlayedOpen, playOpen])

  useEffect(() => {
    if (examId && !showQuoteLoader) {
      examHook.startExam(examId)
    }
  }, [examId, showQuoteLoader, examHook])

  useEffect(() => {
    if (examHook.hasRecoveredSession) {
      toast.success('Your exam progress has been restored!', {
        description: 'You can continue from where you left off.',
        duration: 4000,
      })
    }
  }, [examHook.hasRecoveredSession])

  const handleQuoteComplete = useCallback(() => {
    setShowQuoteLoader(false)
  }, [])

  const handleClose = useCallback(() => {
    navigateTo('exam-hub')
  }, [navigateTo])

  const handleRetry = useCallback(() => {
    if (examId) {
      examHook.startExam(examId)
    }
  }, [examId, examHook])

  // Show motivational quote preloader first
  if (showQuoteLoader) {
    return <QuotePreloader show={true} onComplete={handleQuoteComplete} />
  }

  // Loading
  if (examHook.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <p className="text-slate-400 font-medium">Loading exam...</p>
        </div>
      </div>
    )
  }

  // Error
  if (examHook.error || !examHook.exam) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-slate-300">{examHook.error || 'Exam not found'}</p>
          <Button onClick={handleClose} variant="outline" className="bg-slate-800 border-slate-700 text-white rounded-full">
            Back to Exam Hub
          </Button>
        </div>
      </div>
    )
  }

  // Results
  if (examHook.isComplete && examHook.isSubmitted && examHook.result) {
    return (
      <ResultsScreen
        result={examHook.result}
        exam={examHook.exam}
        answersMap={examHook.answers}
        onClose={handleClose}
        onRetry={handleRetry}
      />
    )
  }

  // Pre-Exam
  if (!examHook.isStarted) {
    return (
      <PreExamScreen
        exam={examHook.exam}
        onStart={() => examHook.startExam(examId)}
        previousAttempts={examHook.exam.previousAttempts}
      />
    )
  }

  // During Exam
  return (
    <ExamTakingScreen hook={examHook} onClose={handleClose} />
  )
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}
