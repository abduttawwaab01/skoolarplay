'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  SkipForward,
  Zap,
  Terminal,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { useSoundStore } from '@/store/sound-store'
import { useVideoLesson, removeVideoLessonSession, type VideoContentData } from '@/hooks/use-video-lesson'
import { QuotePreloader } from '@/components/shared/quote-preloader'
import { AudioPlayButton } from '@/components/shared/audio-play-button'
import { HeartsDisplay } from '@/components/learning/hearts-display'
import { LessonProgressBar } from '@/components/learning/lesson-progress-bar'
import { QuestionFeedback } from '@/components/learning/question-feedback'
import { McqQuestion } from '@/components/learning/mcq-question'
import { FillBlankQuestion } from '@/components/learning/fill-blank-question'
import { DragDropQuestion } from '@/components/learning/drag-drop-question'
import { MatchingQuestion } from '@/components/learning/matching-question'
import { TrueFalseQuestion } from '@/components/learning/true-false-question'
import { OrderingQuestion } from '@/components/learning/ordering-question'
import { CheckboxQuestion } from '@/components/learning/checkbox-question'
import { SpeechQuestion } from '@/components/learning/speech-question'
import { VideoQuizResults } from '@/components/learning/video-quiz-results'

interface VideoQuizQuestion {
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

function QuestionRenderer({
  question,
  onAnswer,
  showFeedback,
  isCorrect,
}: {
  question: VideoQuizQuestion
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}) {
  const parsedQuestion = {
    id: question.id,
    type: question.type,
    question: question.question,
    hint: question.hint,
    explanation: question.explanation,
    options: question.options || null,
    correctAnswer: question.correctAnswer || '',
    order: question.order,
    points: question.points,
  }

  switch (question.type) {
    case 'MCQ':
      return <McqQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'FILL_BLANK':
      return <FillBlankQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'DRAG_DROP':
      return <DragDropQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'MATCHING':
      return <MatchingQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'TRUE_FALSE':
      return <TrueFalseQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'ORDERING':
      return <OrderingQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'CHECKBOX':
      return <CheckboxQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    case 'SPEECH':
      return <SpeechQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
    default:
      return <McqQuestion question={parsedQuestion} onAnswer={onAnswer} showFeedback={showFeedback} isCorrect={isCorrect} />
  }
}

function VideoPlayer({ video, onEnded }: { video: VideoContentData; onEnded: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isEnded, setIsEnded] = useState(false)

  const isYouTube = video.url.includes('youtube.com') || video.url.includes('youtu.be')

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setIsEnded(true)
    onEnded()
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    videoRef.current.currentTime = percent * duration
    setCurrentTime(percent * duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isYouTube) {
    let embedUrl = video.url
    if (video.url.includes('watch?v=')) {
      const videoId = video.url.split('watch?v=')[1]?.split('&')[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`
    } else if (video.url.includes('youtu.be/')) {
      const videoId = video.url.split('youtu.be/')[1]?.split('?')[0]
      embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`
    }

    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onClick={togglePlay}
          playsInline
        />

        {/* Play/Pause overlay */}
        {!isPlaying && !isEnded && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-7 h-7 text-gray-800 ml-1" />
            </div>
          </button>
        )}

        {/* Ended overlay */}
        {isEnded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <p className="font-semibold">Video Complete!</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-muted rounded-full cursor-pointer overflow-hidden group"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-[#008751] rounded-full transition-all"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VideoLessonPage() {
  const { params, goBack, navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playClose = useSoundEffect('close')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const playLevelUp = useSoundEffect('levelUp')
  const playGemCollect = useSoundEffect('gemCollect')
  const playXPGain = useSoundEffect('xpGain')
  const videoId = params?.videoId as string

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
  } = useVideoLesson()

  const [completionResult, setCompletionResult] = useState<{
    xpEarned: number
    gemsEarned: number
    leveledUp: boolean
    newLevel: number
    passed: boolean
    score: number
  } | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [phase, setPhase] = useState<'video' | 'quiz'>('video')
  const [showQuoteLoader, setShowQuoteLoader] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const audioButtonRef = useRef<{ play: () => void; stop: () => void; isPlaying: () => boolean } | null>(null)
  const lastAutoPlayTime = useRef<number>(0)
  const autoReadEnabled = useSoundStore((s) => s.autoReadEnabled)
  const ttsEnabled = useSoundStore((s) => s.ttsEnabled)

  // Track if quiz has started
  const quizStarted = phase === 'quiz' && questions.length > 0

  // Get current question safely
  const currentQ = questions[currentQuestion]

  // Auto-read question when question changes (only in quiz phase)
  useEffect(() => {
    if (!currentQ || showFeedback || !autoReadEnabled || !ttsEnabled || phase !== 'quiz') return
    
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
  }, [currentQuestion, currentQ, showFeedback, autoReadEnabled, ttsEnabled, phase])

  // Exit confirmation handler
  const handleExitQuiz = useCallback(() => {
    if (quizStarted && !isComplete) {
      setShowExitConfirm(true)
    } else {
      performExit()
    }
  }, [quizStarted, isComplete])

  // Actually perform the exit (clear session and navigate)
  const performExit = useCallback(() => {
    if (videoLessonData?.video?.id) {
      removeVideoLessonSession(videoLessonData.video.id)
    }
    playClose()
    // Navigate to course page if we have course info, otherwise go back
    const courseId = videoLessonData?.video?.lesson?.module?.course?.id
    if (courseId) {
      navigateTo('course', { courseId })
    } else {
      goBack()
    }
  }, [goBack, navigateTo, videoLessonData, playClose])

  // Browser back button and beforeunload handling
  useEffect(() => {
    if (!quizStarted || isComplete) return

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      setShowExitConfirm(true)
      window.history.pushState(null, '', window.location.href)
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !isComplete) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [quizStarted, isComplete])

  const hasQuiz = questions.length > 0
  const currentXpReward = videoLessonData?.quiz?.xpReward || 15
  const currentGemReward = videoLessonData?.quiz?.gemReward || 2

  useEffect(() => {
    if (videoId && !showQuoteLoader) {
      startVideoLesson(videoId)
      setPhase('video')
      setVideoEnded(false)
    }
  }, [videoId, startVideoLesson, showQuoteLoader])

  useEffect(() => {
    if (hasRecoveredSession) {
      toast.success('Your progress has been restored!', {
        description: 'You can continue from where you left off.',
        duration: 4000,
      })
    }
  }, [hasRecoveredSession])

  const handleQuoteComplete = useCallback(() => {
    setShowQuoteLoader(false)
  }, [])

  const handleVideoEnded = () => {
    setVideoEnded(true)
  }

  const handleStartQuiz = () => {
    playOpen()
    if (hasQuiz) {
      setPhase('quiz')
    } else {
      handleFinish()
    }
  }

  const handleNext = useCallback(() => {
    nextQuestion()
  }, [nextQuestion])

  const handleSkip = useCallback(() => {
    skipQuestion()
  }, [skipQuestion])

  const handleContinue = useCallback(() => {
    goBack()
  }, [goBack])

  const handleRetry = useCallback(() => {
    setCompletionResult(null)
    setPhase('quiz')
    resetVideoLesson()
  }, [resetVideoLesson])

  const handleFinish = useCallback(async () => {
    if (isCompleting || completionResult) return
    setIsCompleting(true)
    
    // Set a fallback result in case API fails
    const fallbackResult = {
      xpEarned: 0,
      gemsEarned: 0,
      leveledUp: false,
      newLevel: 0,
      passed: false,
      score: 0,
    }
    
    try {
      const result = await completeVideoQuiz()
      if (result) {
        setCompletionResult(result)
        if (result.leveledUp) {
          playLevelUp()
        }
        if (result.xpEarned > 0) {
          setTimeout(() => playXPGain(), result.leveledUp ? 800 : 0)
        }
        if (result.gemsEarned > 0) {
          setTimeout(() => playGemCollect(), result.leveledUp ? 1200 : 400)
        }
      } else {
        setCompletionResult(fallbackResult)
      }
    } catch (err) {
      console.error('Failed to complete video quiz:', err)
      setCompletionResult(fallbackResult)
    } finally {
      setIsCompleting(false)
    }
  }, [completeVideoQuiz, isCompleting, completionResult, playLevelUp, playXPGain, playGemCollect])

  useEffect(() => {
    if (isComplete && !completionResult && !isCompleting) {
      handleFinish()
    }
  }, [isComplete, completionResult, isCompleting, handleFinish])

  const heartsLost = hearts === 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">Loading video lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !videoLessonData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-muted-foreground">{error || 'Video lesson not found'}</p>
          <Button onClick={goBack} variant="outline" className="rounded-full">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (isComplete && completionResult) {
    return (
      <VideoQuizResults
        score={score}
        total={questions.length}
        xpEarned={completionResult.xpEarned}
        gemsEarned={completionResult.gemsEarned}
        leveledUp={completionResult.leveledUp}
        newLevel={completionResult.newLevel}
        passed={completionResult.passed}
        videoTitle={videoLessonData?.video?.title || 'Video Quiz'}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Motivational Quote Preloader */}
      <QuotePreloader show={showQuoteLoader} onComplete={handleQuoteComplete} />
      {!showQuoteLoader && (
        <>
          {/* Top Bar */}
          <div className="shrink-0 border-b bg-card">
            <div className="flex items-center justify-between px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExitQuiz}
                className="rounded-full h-10 w-10"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium">
                  {videoLessonData.video.title}
                </p>
                <p className="text-sm font-semibold">
                  {phase === 'video' ? 'Watch Video' : `Question ${currentQuestion + 1} of ${questions.length}`}
                </p>
              </div>

              {phase === 'quiz' && <HeartsDisplay hearts={hearts} maxHearts={maxHearts} />}
              {phase === 'video' && <div className="w-[84px]" />}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-6">
              <AnimatePresence mode="wait">
                {phase === 'video' && (
                  <motion.div
                    key="video-phase"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    {/* Video */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{videoLessonData.video.title}</h3>
                      <VideoPlayer video={videoLessonData.video} onEnded={handleVideoEnded} />
                    </div>

                    {/* Code IDE Button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => window.open('/code-ide', '_blank')}
                      >
                        <Terminal className="w-4 h-4" />
                        Open Code IDE
                      </Button>
                    </motion.div>

                    {/* Quiz Info */}
                    {hasQuiz && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-primary/5 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm">Video Quiz</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Complete {questions.length} question{questions.length !== 1 ? 's' : ''} to earn {currentXpReward} XP and {currentGemReward} 💎
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-primary font-medium">+{currentXpReward} XP</span>
                          <span className="text-xs text-[#F59E0B] font-medium">+{currentGemReward} 💎</span>
                        </div>
                      </motion.div>
                    )}

                    {/* Start Quiz Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        onClick={handleStartQuiz}
                        size="lg"
                        className="w-full h-12 rounded-full text-base font-semibold bg-[#008751] hover:bg-[#008751]/90"
                      >
                        {hasQuiz ? 'Start Quiz' : 'Complete Lesson'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {phase === 'quiz' && currentQ && (
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
                        {currentQ.type}
                      </span>
                      {['MCQ', 'FILL_BLANK', 'TRUE_FALSE', 'ORDERING', 'CHECKBOX'].includes(currentQ.type) && (
                        <AudioPlayButton ref={audioButtonRef} text={currentQ.question} size="sm" />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1 mb-4">
                      <Zap className="w-3.5 h-3.5 text-[#008751]" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {currentQ.points} points
                      </span>
                    </div>

                    <div
                      className={`min-h-[280px] ${!showFeedback && currentIsCorrect === false ? 'animate-shake' : ''}`}
                    >
                      <QuestionRenderer
                        question={currentQ}
                        onAnswer={(answer, isCorrect) => {
                          if (isCorrect) {
                            playCorrect()
                          } else {
                            playWrong()
                          }
                          answerQuestion(answer, isCorrect)
                        }}
                        showFeedback={showFeedback}
                        isCorrect={currentIsCorrect}
                      />
                    </div>

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

          {/* Bottom Area (only in quiz phase) */}
          {phase === 'quiz' && (
            <div className="shrink-0 border-t bg-card p-4 space-y-2">
              {showFeedback ? (
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
                    {questions.length > 0 ? Math.round((currentQuestion / questions.length) * 100) : 0}% complete
                  </span>
                </div>
              )}

              <LessonProgressBar current={currentQuestion + (showFeedback ? 1 : 0)} total={questions.length} />
            </div>
          )}

          {/* Hearts Lost Overlay */}
          <AnimatePresence>
            {heartsLost && phase === 'quiz' && !isComplete && (
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
                    You ran out of hearts. Watch the video again and try harder!
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
                  Leave Quiz?
                </DialogTitle>
                <DialogDescription>
                  You are about to leave this quiz. Your progress will be lost and will not be saved.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Current Progress:</strong> {currentQuestion + 1} of {questions.length} questions answered.
                  {!isComplete && <span className="block mt-1">You will not receive any XP or gems for this attempt.</span>}
                </p>
              </div>
              <DialogFooter className="gap-3 sm:gap-0 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowExitConfirm(false)}
                  className="rounded-full"
                >
                  Continue Quiz
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
        </>
      )}
    </div>
  )
}
