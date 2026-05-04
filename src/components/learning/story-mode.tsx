'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Volume2,
  VolumeX,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Sparkles,
  Loader2,
  MapPin,
  User,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  X,
  ArrowRight,
  Languages,
  Settings2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSoundEffect } from '@/hooks/use-sound'
import { useSoundStore } from '@/store/sound-store'


interface StoryChapter {
  title: string
  narrative: string
  questions?: StoryQuestion[]
  vocabulary?: StoryVocabulary[]
}

interface StoryQuestion {
  text: string
  options: string[]
  correctIndex: number
  explanation?: string
}

interface StoryVocabulary {
  word: string
  translation: string
  context?: string
}

interface StoryData {
  title: string
  narrative: string
  character: string | null
  setting: string | null
  mood: string | null
  chapters: StoryChapter[] | null
  languageCode?: string
  readingLevel?: string
  estimatedReadingTime?: number
  ttsVoice?: string
  ttsSpeed?: number
  ttsLanguage?: string
  hasBranching?: boolean
  totalQuestions?: number
  passingScore?: number
  xpReward?: number
  gemReward?: number
}

interface StoryModeProps {
  story: StoryData
  onComplete: (result: { passed: boolean; score: number; correctAnswers: number; totalQuestions: number }) => void
  onExit: () => void
}

const moodConfig: Record<string, { color: string; emoji: string; gradient: string; bgGradient: string }> = {
  ADVENTURE: { color: 'text-amber-600', emoji: '⚔️', gradient: 'from-amber-500/20 to-orange-500/20', bgGradient: 'from-amber-50 to-orange-50' },
  MYSTERY: { color: 'text-purple-600', emoji: '🔍', gradient: 'from-purple-500/20 to-indigo-500/20', bgGradient: 'from-purple-50 to-indigo-50' },
  COMEDY: { color: 'text-green-600', emoji: '😂', gradient: 'from-green-500/20 to-emerald-500/20', bgGradient: 'from-green-50 to-emerald-50' },
  DRAMA: { color: 'text-rose-600', emoji: '🎭', gradient: 'from-rose-500/20 to-pink-500/20', bgGradient: 'from-rose-50 to-pink-50' },
  ROMANCE: { color: 'text-pink-600', emoji: '💕', gradient: 'from-pink-500/20 to-rose-500/20', bgGradient: 'from-pink-50 to-rose-50' },
  FANTASY: { color: 'text-violet-600', emoji: '🧙', gradient: 'from-violet-500/20 to-purple-500/20', bgGradient: 'from-violet-50 to-purple-50' },
  SCI_FI: { color: 'text-cyan-600', emoji: '🚀', gradient: 'from-cyan-500/20 to-blue-500/20', bgGradient: 'from-cyan-50 to-blue-50' },
  EDUCATIONAL: { color: 'text-blue-600', emoji: '📚', gradient: 'from-blue-500/20 to-indigo-500/20', bgGradient: 'from-blue-50 to-indigo-50' },
}

const characterEmojis: Record<string, string> = {
  Adaeze: '👩🏾',
  Emeka: '👨🏾',
  Chidi: '👨🏾‍🎓',
  Fatima: '👩🏾‍🏫',
  Ngozi: '👩🏾‍⚕️',
  Amina: '👩🏾',
  Tunde: '👨🏾',
  Bisi: '👩🏾',
  Zara: '👩🏾‍💼',
  Kwame: '👨🏾‍💻',
  Aisha: '👩🏾‍🔬',
  Obi: '👨🏾‍🍳',
  Nneka: '👩🏾‍🎨',
  Kofi: '👨🏾‍🚀',
  Amara: '👩🏾‍⚖️',
}

function getCharacterEmoji(name: string | null): string {
  if (!name) return '📖'
  for (const [key, emoji] of Object.entries(characterEmojis)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🧑🏾'
}

const readingLevelConfig: Record<string, { label: string; color: string; icon: string }> = {
  BEGINNER: { label: 'Beginner', color: 'text-green-600', icon: '🌱' },
  INTERMEDIATE: { label: 'Intermediate', color: 'text-amber-600', icon: '🌿' },
  ADVANCED: { label: 'Advanced', color: 'text-red-600', icon: '🌳' },
}

function splitIntoSentences(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g)
  return sentences ? sentences.map(s => s.trim()).filter(s => s.length > 0) : [text]
}

export function StoryMode({ story, onComplete, onExit }: StoryModeProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showSkip, setShowSkip] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingTTS, setIsLoadingTTS] = useState(false)
  const [highlightedSentence, setHighlightedSentence] = useState(0)
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [ttsSpeed, setTtsSpeed] = useState(story.ttsSpeed || 1.0)
  const [showQuestion, setShowQuestion] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [storyCompleted, setStoryCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const typewriterDoneRef = useRef(false)
  const isMuted = useSoundStore((s) => s.isMuted)
  const playStoryTransition = useSoundEffect('storyTransition')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const mood = story.mood || 'ADVENTURE'
  const moodStyle = moodConfig[mood] || moodConfig.ADVENTURE
  const readingLevel = story.readingLevel || 'BEGINNER'
  const levelConfig = readingLevelConfig[readingLevel] || readingLevelConfig.BEGINNER

  const chapters = useMemo(() => {
    if (story.chapters && story.chapters.length > 0) {
      return story.chapters
    }
    return [{
      title: story.title,
      narrative: story.narrative,
      questions: [],
      vocabulary: [],
    }]
  }, [story])

  const currentChapterData = chapters[currentChapter]
  const sentences = useMemo(() => splitIntoSentences(currentChapterData?.narrative || ''), [currentChapterData])
  const vocabulary = currentChapterData?.vocabulary || []
  const questions = currentChapterData?.questions || []

  const typeText = useCallback((text: string, speed = 25) => {
    setDisplayedText('')
    setIsTyping(true)
    typewriterDoneRef.current = false
    
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }
    
    let i = 0
    typingTimerRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        typewriterDoneRef.current = true
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current)
        }
      }
    }, speed)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop() } catch {}
      audioSourceRef.current = null
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch {}
      audioContextRef.current = null
    }
    setIsSpeaking(false)
    setIsLoadingTTS(false)
  }, [])

  const handleReadAloud = useCallback(async (text?: string) => {
    if (isMuted || isSpeaking || isLoadingTTS) return
    if (!typewriterDoneRef.current) return

    const textToRead = text || currentChapterData?.narrative || ''
    if (!textToRead) return

    try {
      setIsLoadingTTS(true)
      stopSpeaking()

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voice: story.ttsVoice || 'jam',
          speed: ttsSpeed,
          lang: story.ttsLanguage || story.languageCode || 'en',
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('TTS rate limited')
        }
        return
      }

      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      audioSourceRef.current = source
      source.connect(audioContext.destination)

      source.onended = () => {
        setIsSpeaking(false)
        setIsLoadingTTS(false)
        audioContextRef.current = null
        audioSourceRef.current = null
        try { audioContext.close() } catch {}
      }

      source.start(0)
      setIsSpeaking(true)
      setIsLoadingTTS(false)
    } catch (error) {
      console.error('TTS playback error:', error)
      setIsLoadingTTS(false)
      stopSpeaking()
    }
  }, [isMuted, isSpeaking, isLoadingTTS, currentChapterData, story.ttsVoice, story.ttsLanguage, story.languageCode, ttsSpeed, stopSpeaking])

  useEffect(() => {
    return () => {
      stopSpeaking()
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
      }
    }
  }, [stopSpeaking])

  useEffect(() => {
    const timeout = setTimeout(() => setShowSkip(true), 1500)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    stopSpeaking()
    setHighlightedSentence(0)
    setShowQuestion(false)
    setSelectedAnswer(null)
    setShowAnswerFeedback(false)
    
    const narrative = currentChapterData?.narrative || ''
    const typingSpeed = isMuted ? 10 : 20
    typeText(narrative, typingSpeed)
    
    if (!isPaused) {
      playStoryTransition()
    }
  }, [currentChapter, currentChapterData, stopSpeaking, typeText, playStoryTransition, isMuted, isPaused])

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [currentChapter])

  const handleNextChapter = useCallback(() => {
    stopSpeaking()
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
    }
    
    if (questions.length > 0 && !showQuestion) {
      setShowQuestion(true)
      setCurrentQuestionIndex(0)
      return
    }

    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(prev => prev + 1)
    } else {
      setStoryCompleted(true)
      const passed = totalAnswered === 0 || (correctAnswers / totalAnswered) * 100 >= (story.passingScore || 60)
      onComplete({
        passed,
        score: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 100,
        correctAnswers,
        totalQuestions: totalAnswered,
      })
    }
  }, [currentChapter, chapters.length, questions.length, showQuestion, correctAnswers, totalAnswered, story.passingScore, onComplete, stopSpeaking])

  const handleAnswerQuestion = useCallback((answerIndex: number) => {
    if (showAnswerFeedback) return
    
    setSelectedAnswer(answerIndex)
    setShowAnswerFeedback(true)
    setTotalAnswered(prev => prev + 1)

    const question = questions[currentQuestionIndex]
    if (question) {
      const isCorrect = answerIndex === question.correctIndex
      if (isCorrect) {
        setCorrectAnswers(prev => prev + 1)
        playCorrect()
      } else {
        playWrong()
      }
    }
  }, [showAnswerFeedback, questions, currentQuestionIndex, playCorrect, playWrong])

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowAnswerFeedback(false)
    } else {
      setShowQuestion(false)
      handleNextChapter()
    }
  }, [currentQuestionIndex, questions.length, handleNextChapter])

  const handleWordClick = useCallback((word: string) => {
    const vocab = vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase())
    if (vocab) {
      setSelectedWord({ word: vocab.word, translation: vocab.translation })
    }
  }, [vocabulary])

  const renderHighlightedText = useCallback(() => {
    if (!currentChapterData?.narrative) return null
    
    const parts = splitIntoSentences(currentChapterData.narrative)
    
    return parts.map((sentence, idx) => {
      const words = sentence.split(/(\s+)/)
      const isHighlighted = idx === highlightedSentence
      
      return (
        <span key={idx} className={isHighlighted ? 'bg-primary/20 rounded px-0.5 transition-colors duration-300' : ''}>
          {words.map((word, wIdx) => {
            if (/^\s+$/.test(word)) return <span key={wIdx}>{word}</span>
            const cleanWord = word.replace(/[.,!?;:"'()]/g, '')
            const vocabMatch = vocabulary.find(v => v.word.toLowerCase() === cleanWord.toLowerCase())
            
            return (
              <span
                key={wIdx}
                className={vocabMatch ? 'cursor-pointer border-b-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/10 transition-colors rounded' : ''}
                onClick={() => vocabMatch && handleWordClick(cleanWord)}
                title={vocabMatch ? `${vocabMatch.word}: ${vocabMatch.translation}` : undefined}
              >
                {word}
              </span>
            )
          })}
          {' '}
        </span>
      )
    })
  }, [currentChapterData, highlightedSentence, vocabulary, handleWordClick])

  if (storyCompleted) {
    const passed = totalAnswered === 0 || (correctAnswers / totalAnswered) * 100 >= (story.passingScore || 60)
    const score = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 100

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4"
      >
        <Card className="max-w-md w-full overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl"
              style={{
                background: passed ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              }}
            >
              {passed ? '🎉' : '📖'}
            </motion.div>

            <div>
              <h2 className="text-2xl font-bold mb-2">
                {passed ? 'Story Complete!' : 'Keep Reading!'}
              </h2>
              <p className="text-muted-foreground">
                {passed
                  ? "You've successfully read and understood the story!"
                  : "Great effort! Try reading again to improve your comprehension."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">{score}%</p>
                <p className="text-xs text-muted-foreground">Comprehension</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="text-3xl font-bold text-amber-500">{correctAnswers}/{totalAnswered}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>+{story.xpReward || 25} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>+{story.gemReward || 5} 💎</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => onComplete({ passed, score, correctAnswers, totalQuestions: totalAnswered })}
                className="w-full h-12 rounded-full text-base font-semibold"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={onExit}
                className="w-full h-10 rounded-full"
              >
                Back to Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10">
        {/* Story Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b"
        >
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full h-9 w-9">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="rounded-full text-[10px] bg-primary/10 text-primary border-0">
                    Story Mode
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-xs">
                  Ch. {currentChapter + 1}/{chapters.length}
                </Badge>
                {vocabulary.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowVocabulary(true)}
                        className="rounded-full h-8 w-8"
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vocabulary ({vocabulary.length} words)</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(true)}
                      className="rounded-full h-8 w-8"
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reading Settings</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <Progress value={((currentChapter + (isTyping ? 0 : 1)) / chapters.length) * 100} className="h-1.5" />
            </div>
          </div>
        </motion.div>

        {/* Story Content */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentChapter}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {/* Story Info Card */}
              <Card className="mb-6 border-0 overflow-hidden bg-gradient-to-r shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                      {getCharacterEmoji(story.character)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold truncate">{story.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {story.character && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {story.character}
                          </span>
                        )}
                        {story.setting && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {story.setting}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {story.estimatedReadingTime || 5} min
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs font-medium ${moodStyle.color}`}>
                          {moodStyle.emoji} {mood}
                        </span>
                        <span className={`text-xs font-medium ${levelConfig.color}`}>
                          {levelConfig.icon} {levelConfig.label}
                        </span>
                        {story.languageCode && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Languages className="w-3 h-3" />
                            {story.languageCode.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chapter Content */}
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  {/* Chapter Title */}
                  {currentChapterData?.title && currentChapterData.title !== story.title && (
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h3 className="font-semibold text-lg">{currentChapterData.title}</h3>
                    </div>
                  )}

                  {/* Narrative Text */}
                  <div
                    ref={contentRef}
                    className="min-h-[200px] text-base leading-relaxed text-foreground/90 whitespace-pre-wrap"
                  >
                    {renderHighlightedText()}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
                      />
                    )}
                  </div>

                  {/* TTS Controls */}
                  {!isTyping && !isMuted && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReadAloud()}
                          disabled={isLoadingTTS}
                          className="rounded-full"
                        >
                          {isLoadingTTS ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : isSpeaking ? (
                            <VolumeX className="w-4 h-4 mr-2" />
                          ) : (
                            <Volume2 className="w-4 h-4 mr-2" />
                          )}
                          {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showSkip && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleNextChapter}
                              className="rounded-full text-muted-foreground hover:text-foreground"
                            >
                              <SkipForward className="w-4 h-4 mr-1" />
                              {questions.length > 0 && !showQuestion ? 'Continue to Questions' : 'Next'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Comprehension Questions */}
          <AnimatePresence>
            {showQuestion && questions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="mt-6"
              >
                <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-lg">Comprehension Check</h3>
                      <Badge variant="secondary" className="ml-auto rounded-full text-xs">
                        {currentQuestionIndex + 1}/{questions.length}
                      </Badge>
                    </div>

                    <p className="text-base mb-6 font-medium">
                      {questions[currentQuestionIndex]?.text}
                    </p>

                    <div className="space-y-3">
                      {questions[currentQuestionIndex]?.options.map((option, idx) => {
                        const isCorrect = idx === questions[currentQuestionIndex].correctIndex
                        const isSelected = selectedAnswer === idx

                        let buttonStyle = 'border-muted hover:border-primary/50 hover:bg-primary/5'
                        if (showAnswerFeedback) {
                          if (isCorrect) {
                            buttonStyle = 'border-green-500 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                          } else if (isSelected && !isCorrect) {
                            buttonStyle = 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                          } else {
                            buttonStyle = 'border-muted opacity-50'
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerQuestion(idx)}
                            disabled={showAnswerFeedback}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${buttonStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="flex-1">{option}</span>
                              {showAnswerFeedback && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                              )}
                              {showAnswerFeedback && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {showAnswerFeedback && questions[currentQuestionIndex]?.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-muted/50 rounded-xl text-sm"
                      >
                        <p className="font-medium mb-1">Explanation:</p>
                        <p className="text-muted-foreground">{questions[currentQuestionIndex].explanation}</p>
                      </motion.div>
                    )}

                    {showAnswerFeedback && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                      >
                        <Button
                          onClick={handleNextQuestion}
                          className="w-full h-12 rounded-full text-base font-semibold"
                        >
                          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Continue'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vocabulary Dialog */}
        <Dialog open={showVocabulary} onOpenChange={setShowVocabulary}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" />
                Vocabulary ({vocabulary.length} words)
              </DialogTitle>
              <DialogDescription>
                Key words from this chapter with translations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {vocabulary.map((vocab, idx) => (
                <div key={idx} className="p-3 bg-muted rounded-xl">
                  <p className="font-semibold">{vocab.word}</p>
                  <p className="text-sm text-muted-foreground">{vocab.translation}</p>
                  {vocab.context && (
                    <p className="text-xs text-muted-foreground mt-1 italic">"{vocab.context}"</p>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Reading Settings
              </DialogTitle>
              <DialogDescription>
                Customize your reading experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Reading Speed</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Slow</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">Fast</span>
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">{ttsSpeed.toFixed(1)}x</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Word Tooltip */}
        <AnimatePresence>
          {selectedWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
            >
              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div>
                    <p className="font-semibold">{selectedWord.word}</p>
                    <p className="text-sm text-primary">{selectedWord.translation}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedWord(null)}
                    className="h-6 w-6 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}
