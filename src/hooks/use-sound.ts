'use client'

import { useCallback } from 'react'
import { useSoundStore } from '@/store/sound-store'
import type { SoundEffectName } from '@/lib/sound-engine'

/**
 * Hook to play a specific sound effect.
 * Auto-initializes audio context on first call.
 * Respects mute state.
 *
 * @param name - The sound effect name to play
 * @returns A function that plays the sound effect when called
 *
 * @example
 * const playClick = useSoundEffect('click')
 * <button onClick={() => { doSomething(); playClick() }}>Click me</button>
 */
export function useSoundEffect(name: SoundEffectName): () => void {
  const playSfx = useSoundStore((s) => s.playSfx)

  const play = useCallback(() => {
    playSfx(name)
  }, [playSfx, name])

  return play
}
