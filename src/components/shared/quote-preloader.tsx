'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Star } from 'lucide-react'
import { useHydrated } from '@/hooks/use-hydrated'

const DEFAULT_QUOTE = {
  text: "Education is the most powerful weapon which you can use to change the world.",
  author: "Nelson Mandela",
  category: "GENERAL",
}

const DEFAULT_DURATION = 3000

const CATEGORY_ICONS: Record<string, string> = {
  GENERAL: '🌟',
  LEARNING: '📚',
  EXAM: '📝',
  MOTIVATION: '💪',
  FUNNY: '😄',
}

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: 'General',
  LEARNING: 'Learning',
  EXAM: 'Exam',
  MOTIVATION: 'Motivation',
  FUNNY: 'Fun',
}

export type PreloaderContext = 'startup' | 'lesson_start' | 'page_refresh' | 'achievement'

const CONTEXT_CONFIG: Record<PreloaderContext, {
  categories: string
  subtitle: string
  icon: 'graduation' | 'book' | 'star'
}> = {
  startup: {
    categories: '',
    subtitle: 'Preparing your experience',
    icon: 'graduation',
  },
  lesson_start: {
    categories: 'LEARNING,MOTIVATION',
    subtitle: 'Ready to learn?',
    icon: 'book',
  },
  page_refresh: {
    categories: 'FUNNY,GENERAL',
    subtitle: 'Preparing your experience',
    icon: 'graduation',
  },
  achievement: {
    categories: 'MOTIVATION',
    subtitle: 'Great job!',
    icon: 'star',
  },
}

function ContextIcon({ type }: { type: 'graduation' | 'book' | 'star' }) {
  switch (type) {
    case 'book':
      return <BookOpen className="w-6 h-6 text-white" />
    case 'star':
      return <Star className="w-6 h-6 text-white" />
    default:
      return <GraduationCap className="w-6 h-6 text-white" />
  }
}

interface QuotePreloaderProps {
  show: boolean
  onComplete: () => void
  context?: PreloaderContext
  customDuration?: number
}

export function QuotePreloader({ 
  show, 
  onComplete, 
  context = 'startup',
  customDuration 
}: QuotePreloaderProps) {
  const hydrated = useHydrated()
  
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [fadeOut, setFadeOut] = useState(false)
  const [dots, setDots] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasCompletedRef = useRef(false)
  
  const config = useMemo(() => CONTEXT_CONFIG[context], [context])
  
  const handleComplete = useCallback(() => {
    if (hasCompletedRef.current) return
    hasCompletedRef.current = true
    onComplete()
  }, [onComplete])

  const duration = customDuration || DEFAULT_DURATION

  // Handle visibility - only when hydrated (client-side)
  const handleSetVisible = useCallback((value: boolean) => {
    setIsVisible(value)
    if (value) {
      setFadeOut(false)
      hasCompletedRef.current = false
      setDots('')
    }
  }, [])

  // Show preloader when hydrated and show is true
  useEffect(() => {
    if (!hydrated || !show || isVisible) return
    
    const timeout = setTimeout(() => {
      handleSetVisible(true)
    }, 0)
    
    return () => clearTimeout(timeout)
  }, [hydrated, show, isVisible, handleSetVisible])



  // Fetch quote when visible and hydrated
  useEffect(() => {
    if (!hydrated || !isVisible) return

    const url = config.categories
      ? `/api/quotes?category=${encodeURIComponent(config.categories)}`
      : '/api/quotes'

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.quote) {
          setQuote(data.quote)
        }
      })
      .catch(() => {
        // Keep default quote on error
      })
  }, [hydrated, isVisible, config.categories])

   // Main timer logic
   useEffect(() => {
     if (!hydrated || !isVisible || hasCompletedRef.current) return

     if (timerRef.current) clearTimeout(timerRef.current)
     if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

     timerRef.current = setTimeout(() => {
       setFadeOut(true)
       
       fadeTimerRef.current = setTimeout(() => {
         setIsVisible(false)
         handleComplete()
       }, 500)
     }, duration)

     dotIntervalRef.current = setInterval(() => {
       setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
     }, 400)

     return () => {
       if (timerRef.current) clearTimeout(timerRef.current)
       if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
       if (dotIntervalRef.current) clearInterval(dotIntervalRef.current)
     }
   }, [hydrated, isVisible, duration, handleComplete])

  const categoryIcon = CATEGORY_ICONS[quote.category] || '🌟'
  const categoryLabel = CATEGORY_LABELS[quote.category] || 'General'

  // Don't render anything if not visible
  if (!isVisible || !hydrated) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800" />
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>
      <div className="relative z-10 max-w-lg mx-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ContextIcon type={config.icon} />
          </div>
          <span className="text-xl font-bold text-white">SkoolarPlay</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20 shadow-2xl"
        >
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-medium">
              <span>{categoryIcon}</span>
              {categoryLabel}
            </span>
          </div>
          <blockquote className="text-white text-lg md:text-xl font-medium italic leading-relaxed mb-4">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          <p className="text-white/70 text-sm">— {quote.author}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-white/50 text-xs mt-2">{config.subtitle}{dots}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}