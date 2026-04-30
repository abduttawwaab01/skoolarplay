'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSoundStore } from '@/store/sound-store'

export function SoundEnablePrompt() {
  const [show, setShow] = useState(false)
  const { initAudio, isInitialized } = useSoundStore()

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('skoolarplay-sound-dismissed')
    if (!dismissed && !isInitialized) {
      // Show prompt after 2 seconds
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isInitialized])

  const handleEnable = () => {
    initAudio()
    localStorage.setItem('skoolarplay-sound-dismissed', 'true')
    setShow(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('skoolarplay-sound-dismissed', 'true')
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md"
        >
          <div className="bg-card border-2 border-primary/20 shadow-xl rounded-2xl p-4 flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <Volume2 className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Enable Sound</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Turn on sound for the full learning experience!
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                onClick={handleEnable}
                size="sm"
                className="rounded-full bg-primary hover:bg-primary/90 text-xs px-4"
              >
                Enable
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
