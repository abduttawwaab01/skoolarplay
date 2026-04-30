'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const LEARNING_TIPS = [
  'Spaced repetition helps you remember 80% more than cramming. Review your lessons regularly!',
  'Teaching someone else is the best way to learn. Try explaining concepts to a friend!',
  'Taking short 5-minute breaks every 25 minutes improves focus and retention.',
  'The WAEC exam rewards clear handwriting. Practice writing neatly under timed conditions.',
  'JAMB questions often test application, not just memorization. Focus on understanding why.',
  'Sleep helps consolidate memories. Study before bed for better retention.',
  'Use mnemonics and acronyms to remember complex information for exams.',
  'Active recall (testing yourself) is 2x more effective than re-reading notes.',
  'Nigerian pidgin can help you understand concepts — translate tough topics into familiar language!',
  'Mathematics in WAEC often has shortcuts. Learn the tricks to save time!',
  'Reading English passages aloud improves comprehension and vocabulary simultaneously.',
  'Drawing diagrams helps visualize Physics and Chemistry concepts better.',
  'The human brain can focus for about 45 minutes. Plan your study sessions accordingly.',
  'Past questions are gold! Practice at least 5 years of past WAEC/JAMB questions.',
  'Group study works when everyone contributes. Take turns teaching different topics.',
  'Stay hydrated! Drinking water improves cognitive function by up to 14%.',
  'Start with the hardest subject when your energy is highest, usually in the morning.',
  'Flashcards are perfect for memorizing formulas, definitions, and key dates.',
  'Break large topics into smaller chunks. Small wins build momentum!',
  'Listening to calm instrumental music can enhance concentration while studying.',
  'Write formulas and key points on sticky notes and place them where you see them daily.',
  'Economics graphs in WAEC always follow specific patterns. Master the standard curves!',
  'Biology requires understanding processes, not just facts. Learn the "how" and "why".',
  'Set specific study goals: "I will solve 10 math problems" is better than "I will study math".',
  'Use the Feynman Technique: explain complex topics as if teaching a 12-year-old.',
  'Your brain processes information better when you write by hand than when you type.',
  'Government questions often test knowledge of the Nigerian Constitution. Read key sections!',
  'Chemistry equations must be balanced. Practice writing them until it becomes second nature.',
  'Consistency beats intensity. 30 minutes daily is better than 5 hours once a week.',
  'Celebrate small victories! Completing one lesson is a step toward exam success.',
  'Mock exams under real conditions reduce test anxiety. Practice with a timer!',
]

function getTipForToday(): { tip: string; alreadyDismissed: boolean } {
  try {
    const today = new Date().toDateString()
    const lastDismissed = localStorage.getItem('skoolarplay_tip_dismissed')

    if (lastDismissed === today) {
      return { tip: '', alreadyDismissed: true }
    }

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    const tipIndex = dayOfYear % LEARNING_TIPS.length
    return { tip: LEARNING_TIPS[tipIndex], alreadyDismissed: false }
  } catch {
    return { tip: '', alreadyDismissed: true }
  }
}

export function DailyTip() {
  const [tipState, setTipState] = useState<{ tip: string; dismissed: boolean }>(() => {
    const { tip, alreadyDismissed } = getTipForToday()
    return { tip, dismissed: alreadyDismissed }
  })

  if (tipState.dismissed || !tipState.tip) return null

  const handleDismiss = () => {
    try {
      const today = new Date().toDateString()
      localStorage.setItem('skoolarplay_tip_dismissed', today)
    } catch {
      // Ignore localStorage errors
    }
    setTipState({ tip: '', dismissed: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
              className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5"
            >
              <Lightbulb className="w-5 h-5 text-amber-500" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-600 mb-1">
                💡 Did you know?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tipState.tip}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
