'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MessageCircle, Sparkles, Volume2, Check, X } from 'lucide-react'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface ConversationTurn {
  speaker: string
  text: string
  isBlank?: boolean
}

interface ConversationData {
  scenario: string
  turns: ConversationTurn[]
  choices?: string[]
  correctAnswer: string
  correctIndex?: number
}

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

const speakerColors: Record<string, { bg: string; border: string; text: string; avatar: string; label: string }> = {
  A: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    avatar: 'bg-blue-500',
    label: 'Speaker A',
  },
  B: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    avatar: 'bg-emerald-500',
    label: 'Speaker B',
  },
  C: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-100',
    avatar: 'bg-purple-500',
    label: 'Speaker C',
  },
}

const speakerAvatars: Record<string, string> = {
  A: '👤',
  B: '🧑',
  C: '👩',
}

function parseConversationData(question: Question): ConversationData | null {
  try {
    const parsed = JSON.parse(question.options || '{}')

    if (parsed.turns && Array.isArray(parsed.turns)) {
      return {
        scenario: parsed.scenario || question.question || '',
        turns: parsed.turns,
        choices: parsed.choices || [],
        correctAnswer: parsed.correctAnswer || question.correctAnswer || '',
        correctIndex: parsed.correctIndex,
      }
    }

    return null
  } catch {
    return null
  }
}

export function ConversationQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [textInput, setTextInput] = useState('')
  const [revealedTurns, setRevealedTurns] = useState<number[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const conversationData = parseConversationData(question)

  if (!conversationData || conversationData.turns.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Conversation data is not available.</p>
      </div>
    )
  }

  const { scenario, turns, choices, correctAnswer } = conversationData
  const hasBlank = turns.some(t => t.isBlank)
  const blankTurnIndex = turns.findIndex(t => t.isBlank)
  const hasChoices = choices && choices.length > 0

  useEffect(() => {
    setRevealedTurns([])
    setSelectedChoice(null)
    setTextInput('')
    setIsTyping(false)

    let currentTurn = 0
    const revealInterval = setInterval(() => {
      if (currentTurn < turns.length) {
        const turn = turns[currentTurn]
        if (turn.isBlank) {
          setIsTyping(false)
          clearInterval(revealInterval)
          setTimeout(() => {
            if (hasChoices && inputRef.current) {
              inputRef.current.focus()
            }
          }, 200)
          return
        }
        setRevealedTurns(prev => [...prev, currentTurn])
        currentTurn++
      } else {
        clearInterval(revealInterval)
      }
    }, 600)

    return () => clearInterval(revealInterval)
  }, [question.id])

  const getConversationText = () => {
    return turns.map(t => `${t.speaker}: ${t.text}`).join('. ')
  }

  const handleChoiceSelect = (choice: string) => {
    if (showFeedback) return
    setSelectedChoice(choice)

    let correct = false
    if (conversationData.correctIndex !== undefined && choices) {
      const selectedIndex = choices.indexOf(choice)
      correct = selectedIndex === conversationData.correctIndex
    } else {
      correct = choice.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    }

    onAnswer(choice, correct)
  }

  const handleSubmitText = () => {
    if (showFeedback || !textInput.trim()) return

    const normalizeString = (s: string) =>
      s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()

    const submitted = normalizeString(textInput)
    const expected = normalizeString(correctAnswer)

    const isCorrectAnswer = submitted === expected ||
      (submitted.length > 0 && expected.length > 0 &&
        submitted.split(' ').filter(w => w.length > 2).some(w =>
          expected.split(' ').filter(ww => ww.length > 2).includes(w)
        ) &&
        submitted.split(' ').filter(w => w.length > 2).length / Math.max(expected.split(' ').filter(w => w.length > 2).length, 1) >= 0.8)

    onAnswer(textInput, isCorrectAnswer)
  }

  const showCorrectAnswer = (choice: string) => {
    if (conversationData.correctIndex !== undefined && choices) {
      return choices[conversationData.correctIndex] === choice
    }
    return choice.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  const getChoiceStyle = (choice: string) => {
    if (!showFeedback) {
      return selectedChoice === choice
        ? 'border-2 border-primary bg-primary/5 shadow-md'
        : 'border-2 border-border hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm'
    }

    if (showCorrectAnswer(choice)) {
      return 'border-2 border-green-500 bg-green-50 dark:bg-green-500/10 shadow-md'
    }

    if (choice === selectedChoice && !isCorrect) {
      return 'border-2 border-red-500 bg-red-50 dark:bg-red-500/10 shadow-md'
    }

    return 'border-2 border-border opacity-50'
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Scenario Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 mb-3">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Conversation Practice</span>
        </div>
        {scenario && (
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium text-foreground/80 italic">{scenario}</p>
            <AudioPlayButton text={`${scenario}. ${getConversationText()}`} size="sm" />
          </div>
        )}
      </div>

      {/* Conversation Bubbles */}
      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence>
          {turns.map((turn, index) => {
            const isRevealed = revealedTurns.includes(index)
            const colors = speakerColors[turn.speaker] || speakerColors.A
            const isBlankTurn = turn.isBlank

            return (
              <motion.div
                key={`${question.id}-turn-${index}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isRevealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`flex ${turn.speaker === 'A' || turn.speaker === 'C' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] ${turn.speaker === 'A' || turn.speaker === 'C' ? 'order-1' : 'order-2'}`}>
                  {/* Speaker Avatar & Label */}
                  <div className={`flex items-center gap-2 mb-1 ${turn.speaker === 'B' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-7 h-7 rounded-full ${colors.avatar} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                      {speakerAvatars[turn.speaker] || '👤'}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {turn.speaker === 'A' ? 'Alex' : turn.speaker === 'B' ? 'Sam' : 'Jordan'}
                    </span>
                  </div>

                  {/* Bubble */}
                  {isBlankTurn ? (
                    <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl px-4 py-3 relative`}>
                      <div className="flex items-center gap-2">
                        <div className={`flex-1 p-3 rounded-xl border-2 border-dashed ${
                          showFeedback
                            ? isCorrect
                              ? 'border-green-400 bg-green-100 dark:bg-green-900/30'
                              : 'border-red-400 bg-red-100 dark:bg-red-900/30'
                            : 'border-primary/30 bg-white dark:bg-gray-900'
                        }`}>
                          <p className={`text-sm font-medium ${
                            showFeedback
                              ? isCorrect
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                              : 'text-primary'
                          }`}>
                            {showFeedback ? (
                              <span className="flex items-center gap-2">
                                {isCorrect ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    {selectedChoice || textInput}
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    <span className="line-through opacity-60">{selectedChoice || textInput}</span>
                                    <span className="text-green-600 dark:text-green-400 font-semibold ml-2">
                                      → {correctAnswer}
                                    </span>
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="opacity-50">Your response here...</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`${colors.bg} ${colors.border} border rounded-2xl px-4 py-3 shadow-sm`}>
                      <p className={`text-sm leading-relaxed ${colors.text}`}>
                        {turn.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Typing indicator */}
                {!isRevealed && !isBlankTurn && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 py-2 px-3"
                  >
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/40"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/40"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/40"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Response Area */}
      {!showFeedback && revealedTurns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-4 border-t border-border/50"
        >
          <p className="text-sm font-medium text-center mb-3 text-muted-foreground">
            {hasChoices ? 'Choose the best response:' : 'Type your response:'}
          </p>

          {hasChoices ? (
            <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
              {choices!.map((choice, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleChoiceSelect(choice)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all duration-200 ${getChoiceStyle(choice)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      selectedChoice === choice
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{choice}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="max-w-lg mx-auto flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitText()
                }}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-border focus:border-primary focus:outline-none text-sm bg-background transition-colors"
                disabled={showFeedback}
              />
              <motion.button
                onClick={handleSubmitText}
                disabled={!textInput.trim()}
                whileHover={textInput.trim() ? { scale: 1.05 } : {}}
                whileTap={textInput.trim() ? { scale: 0.95 } : {}}
                className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  textInput.trim()
                    ? 'bg-primary text-white shadow-md hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Mic className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Feedback State */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl text-center ${
            isCorrect
              ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {isCorrect ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className="w-5 h-5 text-green-500" />
                </motion.div>
                <span className="font-semibold text-green-700 dark:text-green-300">Perfect response!</span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-300">Not quite right</span>
              </>
            )}
          </div>
          {!isCorrect && (
            <p className="text-sm text-muted-foreground">
              Correct: <span className="font-semibold text-foreground">{correctAnswer}</span>
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
