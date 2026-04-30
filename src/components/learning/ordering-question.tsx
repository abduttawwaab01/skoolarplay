'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  defaultDropAnimationSideEffects,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Question } from '@/hooks/use-lesson'
import { AudioPlayButton } from '@/components/shared/audio-play-button'

interface QuestionProps {
  question: Question
  onAnswer: (answer: string, isCorrect: boolean) => void
  showFeedback: boolean
  isCorrect: boolean | null
}

interface DraggableItem {
  id: string
  text: string
}

function SortableItem({ id, text, disabled }: { id: string; text: string; disabled: boolean }) {
   const {
     attributes,
     listeners,
     setNodeRef,
     transform,
     transition,
     isDragging,
   } = useSortable({ 
     id, 
     disabled,
     resizeObserverConfig: { 
       timeout: 0,
     },
   })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all select-none touch-manipulation ${
        isDragging
          ? 'border-primary bg-primary/20 shadow-xl scale-105 z-50 opacity-90'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>
        </svg>
      </span>
      <span className="font-medium text-sm md:text-base flex-1" style={{ wordBreak: 'break-word' }}>{text}</span>
    </div>
  )
}

export function OrderingQuestion({ question, onAnswer, showFeedback }: QuestionProps) {
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
        }
      } catch {
        correctAnswer = []
      }
    }
  } catch (e) {
    correctAnswer = []
  }

  // Shuffle options initially
  const [items, setItems] = useState<DraggableItem[]>(() => {
    const shuffled = [...options].sort(() => Math.random() - 0.5)
    return shuffled.map((text, i) => ({ id: `item-${i}`, text }))
  })

  const [activeId, setActiveId] = useState<string | null>(null)

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
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const [overId, setOverId] = useState<string | null>(null)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string || null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setOverId(null)

      if (!over || active.id === over.id) return

      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)
        const newItems = [...prev]
        const [moved] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, moved)
        return newItems
      })
    },
    []
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const handleCheck = () => {
    const userAnswer = items.map((item) => item.text.toLowerCase().trim())
    const correctLower = correctAnswer.map(c => c.toLowerCase().trim())
    const isCorrect =
      userAnswer.length === correctLower.length &&
      userAnswer.every((a, i) => a === correctLower[i])
    onAnswer(JSON.stringify(items.map((item) => item.text)), isCorrect)
  }

  const activeItem = items.find((item) => item.id === activeId)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
          <h3 className="text-lg md:text-xl font-semibold">{question.question}</h3>
          <AudioPlayButton text={question.question} size="sm" />
        </div>
        {question.hint && !showFeedback && (
          <p className="text-sm text-muted-foreground italic">Hint: {question.hint}</p>
        )}
        {!showFeedback && (
          <p className="text-sm text-muted-foreground mt-1">
            Drag to reorder items in the correct sequence
          </p>
        )}
      </div>

      <div className="max-w-md mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 sm:space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 sm:gap-3">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <SortableItem id={item.id} text={item.text} disabled={showFeedback} />
                  </div>
                </div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? (
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/20 shadow-xl scale-105">
                <span className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 15h18v-2H3v2zm0 4h18v-2H3v2zm0-8h18V9H3v2zm0-6v2h18V5H3z"/>
                  </svg>
                </span>
                <span className="font-semibold text-base" style={{ wordBreak: 'break-word' }}>{activeItem.text}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Correct order:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {correctAnswer.map((item, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 text-sm font-medium"
                >
                  {i + 1}. {item}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {!showFeedback && (
          <motion.button
            onClick={handleCheck}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-4 p-3 rounded-xl font-semibold text-white bg-[#008751] hover:bg-[#008751]/90 transition-all"
          >
            Check Answer
          </motion.button>
        )}
      </div>
    </div>
  )
}
