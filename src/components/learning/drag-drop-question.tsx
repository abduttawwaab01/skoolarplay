'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

interface DraggableWord {
  id: string
  text: string
}

function DraggableSlotItem({
  index,
  text,
  showFeedback,
  slotResults,
  onRemove,
}: {
  index: number
  text: string | null
  showFeedback: boolean
  slotResults: boolean[]
  onRemove: () => void
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `grid-slot-${index}` })
  
  // Make placed words draggable
  const draggableId = text ? `grid-slot-${index}` : null
  const { attributes, listeners, isDragging } = useDraggable({ 
    id: `grid-slot-${index}`,
    disabled: !text || showFeedback 
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">
        {index + 1}.
      </span>
      <div
        {...(text && !showFeedback ? { ...attributes, ...listeners } : {})}
        className={`flex-1 min-h-[52px] sm:min-h-[48px] px-3 py-2 rounded-xl border-2 flex items-center justify-center transition-all cursor-grab active:cursor-grabbing touch-manipulation ${
          isOver
            ? 'border-primary bg-primary/30 scale-105'
            : text
            ? showFeedback
              ? slotResults[index] === true
                ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                : slotResults[index] === false
                ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                : 'border-primary bg-primary/5'
              : 'border-primary bg-primary/5'
            : 'border-dashed border-muted-foreground/40 bg-muted/30'
        }`}
        onClick={() => {
          if (text && !showFeedback && !isDragging) {
            onRemove()
          }
        }}
      >
        {text ? (
          <span className="text-sm font-semibold select-none" style={{ wordBreak: 'break-word' }}>{text}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Drop here</span>
        )}
      </div>
    </div>
  )
}

function DroppableSlot({
  id,
  index,
  text,
  isCorrect,
  showFeedback,
  positionLabel,
}: {
  id: string
  index: number
  text: string | null
  isCorrect: boolean | null
  showFeedback: boolean
  positionLabel: string
}) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`relative min-w-[80px] min-h-[56px] px-3 py-2 rounded-xl border-2 flex items-center justify-center transition-all ${
        isOver
          ? 'border-primary bg-primary/20 scale-105'
          : text
          ? showFeedback
            ? isCorrect === true
              ? 'border-green-500 bg-green-50 dark:bg-green-500/10 border-solid'
              : isCorrect === false
              ? 'border-red-500 bg-red-50 dark:bg-red-500/10 border-solid'
              : 'border-primary bg-primary/5 border-solid'
            : 'border-primary bg-primary/5 border-solid'
          : 'border-dashed border-muted-foreground/40 bg-muted/30'
      }`}
    >
      {text ? (
        <span className="text-sm font-semibold text-center">{text}</span>
      ) : (
        <div className="text-center">
          <span className="text-lg font-bold text-muted-foreground/50">{index + 1}</span>
        </div>
      )}
      {showFeedback && text && (
        <div
          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            isCorrect ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {isCorrect ? '✓' : '✗'}
        </div>
      )}
    </div>
  )
}

function DraggableWord({ id, text }: { id: string; text: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`px-4 py-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-600 cursor-grab active:cursor-grabbing transition-all select-none text-sm font-semibold text-amber-900 dark:text-amber-100 shadow-sm touch-manipulation min-h-[48px] flex items-center justify-center ${
        isDragging ? 'opacity-50 shadow-xl scale-110 rotate-2 z-50' : 'hover:shadow-md hover:scale-105 hover:border-amber-400'
      }`}
      style={{ wordBreak: 'break-word' }}
    >
      {text}
    </div>
  )
}

export function DragDropQuestion({ question, onAnswer, showFeedback, isCorrect }: QuestionProps) {
  let options: string[] = []
  try {
    if (question.options) {
      const parsed = JSON.parse(question.options)
      options = Array.isArray(parsed) ? parsed : []
    }
  } catch (e) {
    options = []
  }
  
  let correctAnswer: string[] = []
  try {
    if (question.correctAnswer) {
      const raw = question.correctAnswer
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const firstItem = parsed[0]
          if (typeof firstItem === 'number') {
            correctAnswer = parsed.filter((n): n is number => typeof n === 'number' && !isNaN(n) && n >= 0 && n < options.length).map(i => options[i])
          } else {
            correctAnswer = parsed.filter((n): n is string => typeof n === 'string')
          }
        } else if (typeof parsed === 'string') {
          try {
            correctAnswer = JSON.parse(parsed)
            if (!Array.isArray(correctAnswer)) correctAnswer = []
          } catch {
            correctAnswer = [parsed]
          }
        }
      } catch {
        if (typeof raw === 'string') {
          correctAnswer = [raw]
        }
      }
    }
  } catch (e) {
    correctAnswer = []
  }

  const [slots, setSlots] = useState<(string | null)[]>(() =>
    new Array(correctAnswer.length).fill(null)
  )
  const [availableWords, setAvailableWords] = useState<DraggableWord[]>(() =>
    [...options].sort(() => Math.random() - 0.5).map((text, i) => ({
      id: `word-${i}-${Date.now()}`,
      text,
    }))
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 5,
      } 
    }),
    useSensor(TouchSensor, { 
      activationConstraint: { 
        delay: 50,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const overId = over.id as string
      
      // Check if dropping on a grid slot
      const gridSlotMatch = overId.match(/^grid-slot-(\d+)$/)
      if (gridSlotMatch) {
        const overSlotIndex = parseInt(gridSlotMatch[1], 10)
        
        // Check if dragging from available words
        const activeWord = availableWords.find((w) => w.id === active.id)
        
        // Check if dragging from another slot
        const activeSlotMatch = (active.id as string).match(/^grid-slot-(\d+)$/)
        const activeSlotIndex = activeSlotMatch ? parseInt(activeSlotMatch[1], 10) : -1
        
        if (activeWord) {
          // Dragging from available words to slot
          setSlots((prev) => {
            const next = [...prev]
            const existingWord = next[overSlotIndex]
            if (existingWord) {
              // Return existing word to available
              setAvailableWords((prevWords) => [...prevWords, { id: `word-${Date.now()}-${Math.random()}`, text: existingWord }])
            }
            next[overSlotIndex] = activeWord.text
            return next
          })
          setAvailableWords((prev) => prev.filter((w) => w.id !== activeWord.id))
        } else if (activeSlotIndex >= 0 && activeSlotIndex !== overSlotIndex) {
          // Swapping between slots
          setSlots((prev) => {
            const next = [...prev]
            const temp = next[activeSlotIndex]
            next[activeSlotIndex] = next[overSlotIndex]
            next[overSlotIndex] = temp
            return next
          })
        }
        return
      }

      // Fallback: check for slot pattern (for template view)
      const activeWord = availableWords.find((w) => w.id === active.id)
      const activeWordFromSlot = slots.find((s) => s !== null && `slot-${slots.indexOf(s)}` === active.id)
      
      if (activeWord) {
        const overSlotIndex = slots.findIndex((_, i) => `slot-${i}` === over.id)
        if (overSlotIndex >= 0) {
          const existingWord = slots[overSlotIndex]
          
          setSlots((prev) => {
            const next = [...prev]
            if (existingWord) {
              setAvailableWords((prevWords) => [...prevWords, { id: `word-${Date.now()}-${Math.random()}`, text: existingWord }])
            }
            next[overSlotIndex] = activeWord.text
            return next
          })
          setAvailableWords((prev) => prev.filter((w) => w.id !== activeWord.id))
          setUsedWordIds((prev) => new Set([...prev, activeWord.id]))
        }
      } else {
        const slotIndex = slots.findIndex((s) => s !== null && `slot-${slots.indexOf(s)}` === active.id)
        if (slotIndex >= 0) {
          const wordToRemove = slots[slotIndex]
          setSlots((prev) => {
            const next = [...prev]
            next[slotIndex] = null
            return next
          })
          if (wordToRemove) {
            setAvailableWords((prev) => [...prev, { id: `word-${Date.now()}-${Math.random()}`, text: wordToRemove }])
          }
        }
      }
    },
    [availableWords, slots]
  )

  const activeItem = availableWords.find((w) => w.id === activeId)

  const handleCheck = () => {
    const isCorrect =
      slots.length === correctAnswer.length &&
      slots.every((s, i) => s?.toLowerCase().trim() === correctAnswer[i]?.toLowerCase().trim())
    onAnswer(JSON.stringify(slots), isCorrect)
  }

  const slotResults = useMemo(() => 
    showFeedback ? slots.map((s, i) => s === correctAnswer[i]) : [],
    [showFeedback, slots, correctAnswer]
  )

  const allSlotsFilled = slots.every((s) => s !== null)
  const correctCount = slotResults.filter((r) => r === true).length

  const questionParts = useMemo(() => {
    const text = question.question
    const parts: Array<{ type: 'text' | 'slot'; content: string; index?: number }> = []
    
    const slotPattern = /\{\{(\d+)\}\}/g
    let lastIndex = 0
    let match
    
    while ((match = slotPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) })
      }
      const slotIndex = parseInt(match[1], 10) - 1
      parts.push({ type: 'slot', content: match[0], index: slotIndex })
      lastIndex = match.index + match[0].length
    }
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) })
    }
    
    return parts
  }, [question.question])

  const hasTemplate = questionParts.some((p) => p.type === 'slot')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-lg md:text-xl font-semibold">Drag & Drop</h3>
        </div>
        <p className="text-sm text-muted-foreground">Drag the correct words to fill in the blanks</p>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic mt-1">Hint: {question.hint}</p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {hasTemplate ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-6 shadow-sm border mb-6">
              <div className="flex flex-wrap items-center justify-center gap-2 text-lg leading-relaxed">
                {questionParts.map((part, i) => {
                  if (part.type === 'text') {
                    return <span key={i}>{part.content}</span>
                  }
                  const slotIndex = part.index ?? 0
                  const slotText = slots[slotIndex]
                  const result = showFeedback ? slotResults[slotIndex] : null
                  
                  return (
                    <div key={i} className="relative">
                      <div
                        className={`relative min-w-[100px] min-h-[48px] px-4 py-2 rounded-xl border-2 flex items-center justify-center transition-all ${
                          slotText
                            ? showFeedback
                              ? result === true
                                ? 'border-green-500 bg-green-50 dark:bg-green-500/10'
                                : result === false
                                ? 'border-red-500 bg-red-50 dark:bg-red-500/10'
                                : 'border-primary bg-primary/5'
                              : 'border-primary bg-primary/5'
                            : 'border-dashed border-muted-foreground/40 bg-muted/30'
                        }`}
                      >
                        {slotText ? (
                          <span className="text-sm font-semibold">{slotText}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">Drop here</span>
                        )}
                        {showFeedback && slotText && (
                          <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            result ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {result ? '✓' : '✗'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-2xl p-4 shadow-sm border mb-4">
              <div className="text-center mb-4">
                <p className="text-base font-medium text-muted-foreground">
                  {question.question}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {slots.map((slotText, i) => (
                  <DraggableSlotItem 
                    key={i}
                    index={i}
                    text={slotText}
                    showFeedback={showFeedback}
                    slotResults={slotResults}
                    onRemove={() => {
                      if (slotText && !showFeedback) {
                        setSlots((prev) => {
                          const next = [...prev]
                          next[i] = null
                          return next
                        })
                        setAvailableWords((prev) => [...prev, { id: `word-${Date.now()}-${Math.random()}`, text: slotText }])
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto">
          <div className="text-center mb-3">
            <p className="text-sm font-medium text-muted-foreground">Available Words</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800">
            {availableWords.map((word) => (
              <DraggableWord key={word.id} id={word.id} text={word.text} />
            ))}
            {availableWords.length === 0 && (
              <p className="text-sm text-muted-foreground italic">All words placed</p>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-800 dark:to-orange-800 border-2 border-amber-400 dark:border-amber-500 shadow-xl text-sm font-semibold text-amber-900 dark:text-amber-100 rotate-2">
              {activeItem.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!showFeedback && (
        <div className="max-w-md mx-auto">
          <motion.button
            onClick={handleCheck}
            disabled={!allSlotsFilled}
            whileHover={allSlotsFilled ? { scale: 1.02 } : undefined}
            whileTap={allSlotsFilled ? { scale: 0.98 } : undefined}
            className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${
              allSlotsFilled
                ? 'bg-gradient-to-r from-[#008751] to-[#005E38] hover:shadow-lg shadow-md'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-70'
            }`}
          >
            Check Answer
          </motion.button>
          {!allSlotsFilled && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Drag all words to slots to check your answer
            </p>
          )}
        </div>
      )}

      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <div className={`p-4 rounded-xl ${
            correctCount === slots.length
              ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30'
              : correctCount > 0
              ? 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30'
          }`}>
            <p className={`text-lg font-bold ${
              correctCount === slots.length
                ? 'text-green-600 dark:text-green-400'
                : correctCount > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {correctCount === slots.length
                ? '🎉 Perfect!'
                : correctCount > 0
                ? `✨ ${correctCount} of ${slots.length} correct`
                : '😕 Try again!'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {correctCount === slots.length
                ? 'All words are in the correct positions!'
                : 'Some words need to be rearranged.'}
            </p>
          </div>
          
          {correctCount < slots.length && (
            <div className="mt-4 p-4 rounded-xl bg-muted/30">
              <p className="text-sm font-medium mb-2">Correct Answers:</p>
              <div className="space-y-1">
                {correctAnswer.map((answer, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-muted-foreground">{i + 1}.</span>{' '}
                    <span className="font-medium">{answer}</span>
                    {slots[i] !== answer && (
                      <span className="text-red-500 ml-2">(Your answer: {slots[i] || 'empty'})</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
