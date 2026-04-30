'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, SkipForward, MapPin, Sparkles, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSoundEffect } from '@/hooks/use-sound'
import { useSoundStore } from '@/store/sound-store'

interface StoryLesson {
  title: string
  narrative: string
  character: string | null
  setting: string | null
  mood: string | null
}

interface StoryOverlayProps {
  story: StoryLesson
  chapterIndex: number
  totalChapters: number
  onComplete: () => void
}

const moodConfig: Record<string, { color: string; emoji: string; gradient: string }> = {
  ADVENTURE: { color: 'text-amber-600', emoji: '⚔️', gradient: 'from-amber-500/10 to-orange-500/10' },
  MYSTERY: { color: 'text-purple-600', emoji: '🔍', gradient: 'from-purple-500/10 to-indigo-500/10' },
  COMEDY: { color: 'text-green-600', emoji: '😂', gradient: 'from-green-500/10 to-emerald-500/10' },
  DRAMA: { color: 'text-red-600', emoji: '🎭', gradient: 'from-red-500/10 to-pink-500/10' },
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
}

function getCharacterEmoji(name: string): string {
  for (const [key, emoji] of Object.entries(characterEmojis)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return emoji
  }
  return '🧑🏾‍🎓'
}

export function StoryOverlay({ story, chapterIndex, totalChapters, onComplete }: StoryOverlayProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [showSkip, setShowSkip] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoadingTTS, setIsLoadingTTS] = useState(false)
  const playStoryTransition = useSoundEffect('storyTransition')
  const hasPlayedRef = useRef(false)
  const typewriterDoneRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const isMuted = useSoundStore((s) => s.isMuted)

  const mood = moodConfig[story.mood || 'ADVENTURE'] || moodConfig.ADVENTURE

  const typeText = useCallback((text: string) => {
    setDisplayedText('')
    setIsTyping(true)
    typewriterDoneRef.current = false
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        setIsTyping(false)
        typewriterDoneRef.current = true
        clearInterval(timer)
      }
    }, 25)
    return () => clearInterval(timer)
  }, [])

  // Stop TTS playback
  const stopSpeaking = useCallback(() => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop()
      } catch {
        // Ignore if already stopped
      }
      audioSourceRef.current = null
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch {
        // Ignore close errors
      }
      audioContextRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  // Read aloud handler
  const handleReadAloud = useCallback(async () => {
    // Don't proceed if muted or already speaking/loading
    if (isMuted || isSpeaking || isLoadingTTS) return

    // Don't proceed if typewriter hasn't finished
    if (!typewriterDoneRef.current) return

    try {
      setIsLoadingTTS(true)
      stopSpeaking()

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: story.narrative,
          voice: 'jam',
          speed: 0.9,
        }),
      })

      if (!response.ok) {
        // Rate limited or other error
        if (response.status === 429) {
          console.warn('TTS rate limited')
        }
        return
      }

      const arrayBuffer = await response.arrayBuffer()

      // Create AudioContext and decode
      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      audioSourceRef.current = source

      // Connect to destination
      source.connect(audioContext.destination)

      // When audio ends, advance to next chapter
      source.onended = () => {
        setIsSpeaking(false)
        audioContextRef.current = null
        audioSourceRef.current = null
        try {
          audioContext.close()
        } catch {
          // Ignore
        }
        onComplete()
      }

      source.start(0)
      setIsSpeaking(true)
      setIsLoadingTTS(false)
    } catch (error) {
      console.error('TTS playback error:', error)
      setIsLoadingTTS(false)
      stopSpeaking()
    }
  }, [isMuted, isSpeaking, isLoadingTTS, story.narrative, onComplete, stopSpeaking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop() } catch { /* ignore */ }
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close() } catch { /* ignore */ }
      }
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setShowSkip(true), 1500)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    // Stop any TTS when chapter changes
    stopSpeaking()
    const cleanup = typeText(story.narrative)
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true
      playStoryTransition()
    }
    return cleanup
  }, [story.narrative, typeText, playStoryTransition, stopSpeaking])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className={`border-0 overflow-hidden bg-gradient-to-br ${mood.gradient}`}>
        <CardContent className="p-0">
          {/* Story Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <Badge variant="secondary" className="rounded-full text-[10px] bg-primary/10 text-primary border-0">
                Story Mode
              </Badge>
              <span className="text-xs text-muted-foreground">
                Chapter {chapterIndex + 1} of {totalChapters}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Read Aloud / Stop Button */}
              {!isTyping && !isMuted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isSpeaking ? stopSpeaking : handleReadAloud}
                  disabled={isLoadingTTS}
                  className={`h-7 w-7 p-0 rounded-full ${isSpeaking ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-primary hover:bg-primary/10'}`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isLoadingTTS ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isSpeaking ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
              <span className="text-sm">{mood.emoji}</span>
              <span className={`text-xs font-medium ${mood.color}`}>{story.mood || 'Adventure'}</span>
            </div>
          </div>

          {/* Story Content */}
          <div className="p-5 md:p-6">
            {/* Character & Setting */}
            <div className="flex items-center gap-3 mb-4">
              {story.character && (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {getCharacterEmoji(story.character)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{story.character}</p>
                    {story.setting && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">{story.setting}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h3 className="font-bold text-lg">{story.title}</h3>
            </div>

            {/* Narrative Text with typewriter effect */}
            <div className="relative min-h-[80px]">
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                  />
                )}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mt-4">
              {Array.from({ length: totalChapters }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= chapterIndex
                      ? 'bg-primary w-6'
                      : i === chapterIndex + 1
                        ? 'bg-primary/30 w-4'
                        : 'bg-muted w-3'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5">
              <p className="text-[11px] text-muted-foreground">
                Read the story, then answer the question below!
              </p>
              <AnimatePresence>
                {showSkip && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1"
                  >
                    {/* Read Aloud button in action area when typewriter done */}
                    {!isTyping && !isMuted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isSpeaking ? stopSpeaking : handleReadAloud}
                        disabled={isLoadingTTS}
                        className={`text-xs rounded-full ${isSpeaking ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : 'text-primary hover:bg-primary/10'}`}
                      >
                        {isLoadingTTS ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Loading
                          </>
                        ) : isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 mr-1" />
                            Read Aloud
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        stopSpeaking()
                        setDisplayedText(story.narrative)
                        setIsTyping(false)
                        typewriterDoneRef.current = true
                        onComplete()
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground rounded-full"
                    >
                      <SkipForward className="w-3 h-3 mr-1" />
                      Skip Story
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
