'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  SkipForward,
  ArrowRight,
  Loader2,
  AlertCircle,
  Zap,
  Download,
  Crown,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { useSoundStore } from '@/store/sound-store'
import { useLesson, removeLessonSession, type Question } from '@/hooks/use-lesson'
import { useAuthStore } from '@/store/auth-store'
import { isFeatureUnlocked } from '@/lib/premium'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { QuotePreloader } from '@/components/shared/quote-preloader'
import { HeartsDisplay } from '@/components/learning/hearts-display'
import { LessonProgressBar } from '@/components/learning/lesson-progress-bar'
import { QuestionFeedback } from '@/components/learning/question-feedback'
import { ResultsScreen } from '@/components/learning/results-screen'
import { McqQuestion } from '@/components/learning/mcq-question'
import { FillBlankQuestion } from '@/components/learning/fill-blank-question'
import { DragDropQuestion } from '@/components/learning/drag-drop-question'
import { MatchingQuestion } from '@/components/learning/matching-question'
import { TrueFalseQuestion } from '@/components/learning/true-false-question'
import { OrderingQuestion } from '@/components/learning/ordering-question'
import { AudioPlayButton } from '@/components/shared/audio-play-button'
import { DraggableCalculator } from '@/components/shared/draggable-calculator'
import { SpeechRecognition } from '@/components/shared/speech-recognition'
import { CheckboxQuestion } from '@/components/learning/checkbox-question'
import { SpeechQuestion } from '@/components/learning/speech-question'
import { ConversationQuestion } from '@/components/learning/conversation-question'
import { StoryMode } from '@/components/learning/story-mode'

function QuestionRenderer({
  question,
  onAnswer,
  showFeedback,
  isCorrect,
}: {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}) {
  switch (question.type) {
    case 'MCQ':
      return <McqQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'FILL_BLANK':
      return <FillBlankQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'DRAG_DROP':
      return <DragDropQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'MATCHING':
      return <MatchingQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'TRUE_FALSE':
      return <TrueFalseQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'ORDERING':
      return <OrderingQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'CHECKBOX':
      return <CheckboxQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'SPEECH':
      return <SpeechQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'CONVERSATION':
      return <ConversationQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    default:
      return <McqQuestion question={question} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
  }
}

const questionTypeLabel: Record<string, string> = {
  MCQ: 'Multiple Choice',
  FILL_BLANK: 'Fill in the Blank',
  DRAG_DROP: 'Drag & Drop',
  MATCHING: 'Match the Pairs',
  TRUE_FALSE: 'True or False',
  ORDERING: 'Put in Order',
  CHECKBOX: 'Multiple Selection',
  SPEECH: 'Speak',
  CONVERSATION: 'Conversation',
}

export function LessonPage() {
  const { params, goBack, navigateTo } = useAppStore()
  const lessonId = params?.lessonId as string
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const playHeartsLost = useSoundEffect('heartsLost')
  const playXPGain = useSoundEffect('xpGain')
  const playAchievement = useSoundEffect('achievement')
  const playLevelUp = useSoundEffect('levelUp')
  const playSlide = useSoundEffect('slide')

  const {
    currentQuestion,
    questions,
    score,
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
  } = useLesson()

  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    lessonReport?: any
  } | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showLessonPreloader, setShowLessonPreloader] = useState(true)
  const [noteRead, setNoteRead] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [storyModeActive, setStoryModeActive] = useState(false)
  const [storyResult, setStoryResult] = useState<{ passed: boolean; score: number; correctAnswers: number; totalQuestions: number } | null>(null)
  const audioButtonRef = useRef<{ play: () => void; stop: () => void; isPlaying: () => boolean } | null>(null)
  const lastAutoPlayTime = useRef<number>(0)
  const autoReadEnabled = useSoundStore((s) => s.autoReadEnabled)
  const ttsEnabled = useSoundStore((s) => s.ttsEnabled)

  // Track if quiz has started (not on note reader or story)
  const hasNote = lessonData?.lessonNote || null
  const hasStory = lessonData?.storyLesson || null
  const quizStarted = !hasNote && !hasStory && questions.length > 0

  useEffect(() => {
    if (lessonId && !showLessonPreloader && !storyModeActive) {
      startLesson(lessonId)
    }
  }, [lessonId, startLesson, showLessonPreloader, storyModeActive])

  // Activate story mode when lesson data loads and has a story
  useEffect(() => {
    if (lessonData?.storyLesson && !storyModeActive && !storyResult) {
      setStoryModeActive(true)
    }
  }, [lessonData, storyModeActive, storyResult])

  const handleStoryComplete = useCallback((result: { passed: boolean; score: number; correctAnswers: number; totalQuestions: number }) => {
    setStoryResult(result)
    setStoryModeActive(false)
    setIsCompleting(true)
    
    const fallbackResult = {
      xpEarned: lessonData?.storyLesson?.xpReward || 25,
      gemsEarned: lessonData?.storyLesson?.gemReward || 5,
      leveledUp: false,
      newLevel: 0,
      lessonReport: {
        storyCompleted: true,
        passed: result.passed,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
      },
    }
    
    setCompletionResult(fallbackResult)
    setIsCompleting(false)
  }, [lessonData])

  // Actually perform the exit (clear session and navigate)
  const performExit = useCallback(() => {
    if (lessonData?.id) {
      removeLessonSession(lessonData.id)
    }
    // Navigate to course page if we have course info, otherwise go back
    const courseId = lessonData?.module?.course?.id
    if (courseId) {
      navigateTo('course', { courseId })
    } else {
      goBack()
    }
  }, [goBack, navigateTo, lessonData])

  const handleStoryExit = useCallback(() => {
    setStoryModeActive(false)
    performExit()
  }, [performExit])

  // Exit confirmation handler
  const handleExitQuiz = useCallback(() => {
    if (quizStarted && !isComplete) {
      setShowExitConfirm(true)
    } else {
      performExit()
    }
  }, [quizStarted, isComplete])

  // Browser back button and beforeunload handling
  useEffect(() => {
    if (!quizStarted || isComplete) return

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      setShowExitConfirm(true)
      // Push state back to prevent navigation
      window.history.pushState(null, '', window.location.href)
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !isComplete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    // Push initial state
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [quizStarted, isComplete])

  // Download capability
  const authUser = useAuthStore((s) => s.user)
  const isPremiumUser = (authUser as any)?.isPremium || false
  const premiumExpires = (authUser as any)?.premiumExpiresAt || null
  let dlFeatures: string[] = []
  try { dlFeatures = JSON.parse((authUser as any)?.unlockedFeatures || '[]') } catch {}
  const canDownload = isFeatureUnlocked(isPremiumUser, premiumExpires, dlFeatures, 'DOWNLOAD_LESSONS')

  const handleDownloadLesson = async () => {
    if (!canDownload) {
      toast.info('Premium subscription required to download lessons')
      return
    }
    if (!lessonId) return
    try {
      const res = await fetch(`/api/lessons/download?lessonId=${lessonId}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${lessonData?.title.replace(/[^a-zA-Z0-9]/g, '_') || 'lesson'}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Lesson downloaded successfully')
      } else {
        toast.error('Failed to download lesson')
      }
    } catch {
      toast.error('Failed to download lesson')
    }
  }

  useEffect(() => {
    if (hasRecoveredSession) {
      toast.success('Your progress has been restored!', {
        description: 'You can continue from where you left off.',
        duration: 4000,
      })
    }
  }, [hasRecoveredSession])

  const handleQuoteComplete = useCallback(() => {
    setShowLessonPreloader(false)
  }, [])

  const handleNext = useCallback(() => {
    nextQuestion()
    playXPGain()
  }, [nextQuestion, playXPGain])

  const handleSkip = useCallback(() => {
    skipQuestion()
  }, [skipQuestion])

  const handleContinue = useCallback(() => {
    goBack()
  }, [goBack])

  const handleRetry = useCallback(() => {
    setCompletionResult(null)
    resetLesson()
  }, [resetLesson])

  const safeQuestions = Array.isArray(questions) ? questions : []

  const handleFinish = useCallback(async () => {
    if (isCompleting || completionResult) return
    setIsCompleting(true)
    
    // Calculate results immediately for UI responsiveness
    const safeLen = safeQuestions.length
    const percentage = safeLen > 0 ? Math.round((score / safeLen) * 100) : 0
    
    // Set a fallback result in case API fails
    const fallbackResult = {
      xpEarned: 0,
      gemsEarned: 0,
      leveledUp: false,
      newLevel: 0,
      lessonReport: undefined,
    }
    
    try {
      const result = await completeLesson()
      if (result) {
        if (percentage >= 90) {
          playLevelUp()
        } else {
          playAchievement()
        }
        setCompletionResult(result)
      } else {
        setCompletionResult(fallbackResult)
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err)
      setCompletionResult(fallbackResult)
    } finally {
      setIsCompleting(false)
    }
  }, [completeLesson, isCompleting, completionResult, playLevelUp, playAchievement, score, safeQuestions.length])

  useEffect(() => {
    if (isComplete && !completionResult && !isCompleting) {
      handleFinish()
    }
  }, [isComplete, completionResult, isCompleting, handleFinish])

  const currentQ = safeQuestions[currentQuestion]
  const heartsLost = hearts === 0
  const progressPercentage = safeQuestions.length > 0
    ? Math.round((currentQuestion / safeQuestions.length) * 100)
    : 0

   // Auto-read question when question changes
   useEffect(() => {
     // More permissive conditions for testing
     if (!currentQ) return;
     
     // Always allow during development for easier testing
     const shouldAutoRead = process.env.NODE_ENV === 'development' 
       || (autoReadEnabled && ttsEnabled && !showFeedback && !hasNote);
       
     if (!shouldAutoRead) return;
     
     // Skip if user recently interacted (within 3 seconds)
     const now = Date.now()
     if (now - lastAutoPlayTime.current < 3000) return
     
     // Skip if not an audio-supported question type
     if (!['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'ORDERING', 'CHECKBOX'].includes(currentQ.type)) return
     
     // Auto-play after a short delay
     const timer = setTimeout(() => {
       if (audioButtonRef.current && !audioButtonRef.current.isPlaying()) {
         audioButtonRef.current.play()
         lastAutoPlayTime.current = Date.now()
       }
     }, 500)
     
     return () => clearTimeout(timer)
   }, [currentQuestion, currentQ, showFeedback, autoReadEnabled, ttsEnabled, hasNote])

  // Lesson-start preloader
  if (showLessonPreloader) {
    return <QuotePreloader show={showLessonPreloader} onComplete={handleQuoteComplete} context="lesson_start" />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Loading lesson...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          {requiresPremium ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold">Premium Content</h2>
              <p className="text-muted-foreground">{error || 'This lesson requires a SkoolarPlay+ subscription'}</p>
              <Button onClick={goBack} className="rounded-full bg-amber-500 hover:bg-amber-600">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Access
              </Button>
            </>
          ) : (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-muted-foreground">{error || 'Lesson not found'}</p>
              <Button onClick={goBack} variant="outline" className="rounded-full">
                Go Back
              </Button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Results screen
  if (isComplete && completionResult) {
    return (
      <ResultsScreen
        score={score}
        total={safeQuestions.length}
        xpEarned={completionResult.xpEarned}
        gemsEarned={completionResult.gemsEarned}
        onContinue={handleContinue}
        onRetry={handleRetry}
        lessonReport={completionResult.lessonReport}
        lessonTitle={lessonData?.title}
      />
    )
  }

  const showNoteReader = hasNote && !noteRead
  const showStoryMode = hasStory && storyModeActive && !storyResult

  // Show Story Mode if lesson has a story
  if (showStoryMode) {
    return (
      <StoryMode
        story={{
          title: hasStory.title,
          narrative: hasStory.narrative,
          character: hasStory.character,
          setting: hasStory.setting,
          mood: hasStory.mood,
          chapters: hasStory.chapters as any,
          languageCode: hasStory.languageCode,
          readingLevel: hasStory.readingLevel,
          estimatedReadingTime: hasStory.estimatedReadingTime,
          ttsVoice: hasStory.ttsVoice,
          ttsSpeed: hasStory.ttsSpeed,
          ttsLanguage: hasStory.ttsLanguage,
          hasBranching: hasStory.hasBranching,
          totalQuestions: hasStory.totalQuestions,
          passingScore: hasStory.passingScore,
          xpReward: hasStory.xpReward,
          gemReward: hasStory.gemReward,
        }}
        onComplete={handleStoryComplete}
        onExit={handleStoryExit}
      />
    )
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col">
      <DraggableCalculator />
      {/* Top Bar */}
      <div className="shrink-0 border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitQuiz}
            className="rounded-full h-10 w-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Lesson Info */}
          <div className="text-center flex-1">
            <p className="text-xs text-muted-foreground font-medium">
              {lessonData.title}
            </p>
            <p className="text-sm font-semibold">
              {showNoteReader ? 'Study Note' : `${currentQuestion + 1} of ${safeQuestions.length}`}
            </p>
          </div>

          {/* Download Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadLesson}
                className="rounded-full h-10 w-10"
                title={canDownload ? 'Download lesson for offline' : 'Premium required to download'}
              >
                <div className="relative">
                  <Download className="w-4 h-4" />
                  {!canDownload && (
                    <Crown className="w-2.5 h-2.5 text-amber-500 absolute -top-1.5 -right-1.5" />
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canDownload ? 'Download lesson' : 'Premium required'}
            </TooltipContent>
          </Tooltip>

          {/* Hearts */}
          <HeartsDisplay hearts={hearts} maxHearts={maxHearts} />
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-2">
          <LessonProgressBar current={currentQuestion + (showFeedback ? 1 : 0)} total={safeQuestions.length} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            {showNoteReader ? (
              <motion.div
                key="note"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-2xl shadow-sm p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold">{lessonData.lessonNote?.title}</h2>
                  <AudioPlayButton text={lessonData.lessonNote?.content || ''} size="default" />
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: lessonData.lessonNote?.content || '' }}>
                </div>
              </motion.div>
            ) : currentQ && (
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question Type Badge + Audio Button */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {questionTypeLabel[currentQ.type] || currentQ.type}
                  </span>
                  {['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'ORDERING', 'CHECKBOX'].includes(currentQ.type) && (
                    <AudioPlayButton ref={audioButtonRef} text={currentQ.question} size="sm" />
                  )}
                </div>

                {/* Points Indicator */}
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Zap className="w-3.5 h-3.5 text-[#008751]" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentQ.points} points
                  </span>
                </div>

                {/* Question */}
                <div
                  className={`min-h-[280px] ${!showFeedback && currentIsCorrect === false ? 'animate-shake' : ''}`}
                >
                  <QuestionRenderer
                    question={currentQ}
                    onAnswer={(answer: string, isCorrect: boolean) => {
                      answerQuestion(answer, isCorrect)
                      if (isCorrect) {
                        playCorrect()
                      } else {
                        playWrong()
                        playHeartsLost()
                      }
                    }}
                    showFeedback={showFeedback}
                    isCorrect={currentIsCorrect}
                  />
                </div>

                {/* Feedback */}
                <QuestionFeedback
                  showFeedback={showFeedback}
                  isCorrect={currentIsCorrect}
                  explanation={currentQ.explanation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="shrink-0 border-t bg-card p-4 space-y-2">
        {showNoteReader ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => { playSlide(); setNoteRead(true) }}
              className="w-full h-12 rounded-full text-base font-semibold bg-[#008751] hover:bg-[#008751]/90"
            >
              Start Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : showFeedback ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleNext}
              className="w-full h-12 rounded-full text-base font-semibold bg-[#008751] hover:bg-[#008751]/90"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="rounded-full h-12 px-6 text-muted-foreground"
            >
              Skip
              <SkipForward className="w-4 h-4 ml-1" />
            </Button>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {progressPercentage}% complete
            </span>
          </div>
        )}

        {/* Bottom Progress Bar */}
        <LessonProgressBar current={showNoteReader ? 0 : currentQuestion + (showFeedback ? 1 : 0)} total={safeQuestions.length} />
      </div>

      {/* Hearts Lost Overlay */}
      <AnimatePresence>
        {heartsLost && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-destructive/10 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-6 text-center shadow-xl max-w-sm w-full"
            >
              <p className="text-4xl mb-3">💔</p>
              <h3 className="text-lg font-bold mb-2">Out of Hearts!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You ran out of hearts. Practice more to master this lesson!
              </p>
              <Button
                onClick={performExit}
                className="w-full h-12 rounded-full font-semibold"
              >
                Back to Course
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Leave Lesson?
            </DialogTitle>
            <DialogDescription>
              You are about to leave this lesson. Your progress will be lost and will not be saved.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-4 mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Current Progress:</strong> {currentQuestion + 1} of {safeQuestions.length} questions answered.
              {!isComplete && <span className="block mt-1">You will not receive any XP or gems for this attempt.</span>}
            </p>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowExitConfirm(false)}
              className="rounded-full"
            >
              Continue Lesson
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowExitConfirm(false)
                performExit()
              }}
              className="rounded-full"
            >
              Leave Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
