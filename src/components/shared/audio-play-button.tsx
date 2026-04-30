'use client'

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Volume2, Loader2, X } from 'lucide-react'
import { useSoundStore } from '@/store/sound-store'
import { cn } from '@/lib/utils'
import { useHydrated } from '@/hooks/use-hydrated'
import { toast } from 'sonner'

export interface AudioPlayButtonHandle {
  play: () => void
  stop: () => void
  isPlaying: () => boolean
}

interface AudioPlayButtonProps {
  text: string
  size?: 'sm' | 'md' | 'lg' | 'default'
  className?: string
  autoPlay?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
  lang?: string
}

const sizeConfig = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  default: 'w-9 h-9',
}

const iconSize = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  default: 'w-4 h-4',
}

// Debug flag for TTS logging
const debugTTS = process.env.NODE_ENV === 'development'

export const AudioPlayButton = forwardRef<AudioPlayButtonHandle, AudioPlayButtonProps>(
  function AudioPlayButton(
    { text, size = 'default', className, autoPlay = false, onPlayStart, onPlayEnd, lang = 'yo' },
    ref
  ) {
    const hydrated = useHydrated()
    const ttsEnabled = useSoundStore((s) => s.ttsEnabled)
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayingState, setIsPlayingState] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const blobUrlRef = useRef<string | null>(null)
    const isPlayingRef = useRef(false)
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

    // Update ref state sync
    useEffect(() => {
      isPlayingRef.current = isPlayingState
    }, [isPlayingState])

    // Cleanup audio on unmount
    useEffect(() => {
      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
          blobUrlRef.current = null
        }
      }
    }, [])

    const stopAudio = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setIsPlayingState(false)
      isPlayingRef.current = false
    }, [])

    const speakWithBrowserTTS = async (ttsText: string, ttsLang: string) => {
      if (debugTTS) console.log('[TTS] Using browser Web Speech API for lang:', ttsLang)
      
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel()
      }
      
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
          return new Promise<SpeechSynthesisVoice[]>((resolve) => {
            window.speechSynthesis.onvoiceschanged = () => {
              resolve(window.speechSynthesis.getVoices())
            }
            setTimeout(() => resolve([]), 1000)
          })
        }
        return Promise.resolve(voices)
      }
      
      const availableVoices = await getVoices()
      
      const targetLangPrefix = ttsLang.split('-')[0].toLowerCase()
      let selectedVoice = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(targetLangPrefix) || 
        v.name.toLowerCase().includes(targetLangPrefix)
      )
      
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(v => 
          v.lang.toLowerCase().startsWith('en')
        )
      }
      
      selectedVoice = selectedVoice || availableVoices[0]
      
      const utterance = new SpeechSynthesisUtterance(ttsText)
      if (selectedVoice) {
        utterance.voice = selectedVoice
        if (debugTTS) console.log('[TTS] Using voice:', selectedVoice.name, 'for lang:', selectedVoice.lang)
      }
      utterance.rate = 0.85
      utterance.volume = 1.0
      
      speechSynthesisRef.current = utterance
      
      utterance.onstart = () => {
        if (debugTTS) console.log('[TTS Web Speech] Started speaking')
        setIsPlayingState(true)
        isPlayingRef.current = true
        setIsLoading(false)
        onPlayStart?.()
      }
      
      utterance.onend = () => {
        if (debugTTS) console.log('[TTS Web Speech] Finished speaking')
        setIsPlayingState(false)
        isPlayingRef.current = false
        setIsLoading(false)
        speechSynthesisRef.current = null
        onPlayEnd?.()
      }
      
      utterance.onerror = (e) => {
        console.error('[TTS Web Speech] Error:', e)
        setIsPlayingState(false)
        isPlayingRef.current = false
        setIsLoading(false)
        speechSynthesisRef.current = null
        onPlayEnd?.()
        toast.error('Failed to play audio using browser speech synthesis.')
      }
      
      window.speechSynthesis.speak(utterance)
    }

    const playAudio = useCallback(async () => {
        // If currently playing, stop
        if (isPlayingRef.current) {
            stopAudio()
            return
        }

        // Wait for hydration before checking TTS status
        if (!hydrated) {
            if (debugTTS) console.log('[TTS] Waiting for hydration, using default: true')
        }

        // If TTS is disabled (and hydrated), don't do anything
        if (hydrated && !ttsEnabled) {
            if (debugTTS) console.log('[TTS] TTS is disabled (hydrated)', { ttsEnabled, hydrated })
            return
        }

        // If already loading, ignore
        if (isLoading) return

        if (debugTTS) console.log('[TTS DEBUG] Attempting to play audio:', {
            textLength: text.length,
            ttsEnabled,
            hydrated,
            isLoading,
            isPlayingRef: isPlayingRef.current
        })

        setIsLoading(true)

        try {
            if (debugTTS) console.log('[TTS] Fetching audio for:', text.substring(0, 50) + '...')
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: 'jam',
                    speed: 0.85,
                    lang: lang,
                }),
            })

            if (debugTTS) console.log('[TTS] Response status:', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`TTS request failed: ${response.status} - ${errorText}`)
            }

            // Check if we should use browser TTS instead
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
                // Server says use browser TTS - parse the JSON to get language
                const jsonData = await response.json()
                if (debugTTS) console.log('[TTS] Server says use browser TTS:', jsonData)
                
                // Use browser TTS with the specified or default language
                const targetLang = jsonData.lang || lang
                await speakWithBrowserTTS(text, targetLang)
                setIsLoading(false)
                return
            }

            // It's audio - proceed with normal playback
            const blob = await response.blob()
            if (debugTTS) console.log('[TTS] Blob size:', blob.size, 'type:', blob.type)
            
            const blobUrl = URL.createObjectURL(blob)
            blobUrlRef.current = blobUrl

            const audio = new Audio(blobUrl)
            audioRef.current = audio

            audio.onplay = () => {
                if (debugTTS) console.log('[TTS] Started playing')
                setIsPlayingState(true)
                isPlayingRef.current = true
                setIsLoading(false)
                onPlayStart?.()
            }

            audio.onended = () => {
                if (debugTTS) console.log('[TTS] Finished playing')
                stopAudio()
                onPlayEnd?.()
            }

            audio.onerror = (e) => {
                console.error('[TTS] Audio error:', e)
                stopAudio()
                onPlayEnd?.()
            }

await audio.play()
        } catch (apiError) {
            console.error('[TTS API ERROR] API call failed:', apiError)
            
            // Use browser TTS as fallback
            if (debugTTS) console.log('[TTS] Falling back to Web Speech API')
            await speakWithBrowserTTS(text, lang)
        }
    }, [text, lang, hydrated, ttsEnabled, isLoading, stopAudio, onPlayStart, onPlayEnd])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        play: () => {
            // Use same hydration logic as in playAudio
            const isEnabled = (() => {
                if (!hydrated) {
                    // During SSR, default to enabled but log warning
                    if (debugTTS) console.log('[TTS] Not hydrated yet, defaulting to enabled in imperative handle')
                    return true
                }
                return ttsEnabled
            })()
            if (isEnabled && !isPlayingRef.current) {
                playAudio()
            }
        },
        stop: () => {
            if (isPlayingRef.current) {
                stopAudio()
            }
        },
        isPlaying: () => isPlayingRef.current,
    }), [hydrated, ttsEnabled, playAudio, stopAudio])

    // Auto-play when text changes (for auto-read feature)
    useEffect(() => {
        // Use same hydration logic as in playAudio
        const isEnabled = (() => {
            if (!hydrated) {
                // During SSR, default to enabled but log warning
                if (debugTTS) console.log('[TTS] Not hydrated yet, defaulting to enabled in auto-play')
                return true
            }
            return ttsEnabled
        })()
        if (autoPlay && isEnabled && !isPlayingRef.current) {
            // Small delay to ensure component is ready
            const timer = setTimeout(() => {
                playAudio()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [text, lang, autoPlay, hydrated, ttsEnabled, playAudio])

    // During SSR or before hydration, show as enabled (default)
    const isDisabled = hydrated ? !ttsEnabled : false
    
    return (
      <button
        onClick={playAudio}
        type="button"
        aria-label={
          isDisabled
            ? 'Text-to-speech is disabled'
            : isPlayingState
            ? 'Stop audio'
            : 'Play question audio'
        }
        title={
          isDisabled
            ? 'Text-to-speech is disabled in settings'
            : isPlayingState
            ? 'Stop audio'
            : 'Play question audio'
        }
        className={cn(
          'inline-flex items-center justify-center rounded-full shrink-0 transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeConfig[size],
          isDisabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
            : 'bg-primary/10 text-primary hover:bg-primary/20',
          isPlayingState && 'animate-pulse bg-primary/20',
          className
        )}
        disabled={isLoading || isDisabled}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSize[size], 'animate-spin')} />
        ) : isDisabled ? (
          <Volume2 className={cn(iconSize[size], 'opacity-50')} />
        ) : isPlayingState ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className={cn(iconSize[size])} />
            <X className="absolute w-2 h-2 text-primary stroke-[3]" />
          </div>
        ) : (
          <Volume2 className={iconSize[size]} />
        )}
      </button>
    )
  }
)

// Store-based TTS trigger for auto-read (alternative method)
let ttsTriggerCallback: ((text: string) => void) | null = null

export function setTTSTriggerCallback(callback: (text: string) => void | null) {
  ttsTriggerCallback = callback
}

export function triggerTTS(text: string) {
  if (ttsTriggerCallback) {
    ttsTriggerCallback(text)
  }
}
