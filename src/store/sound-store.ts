import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { soundEngine, type SoundEffectName } from '@/lib/sound-engine'

interface SoundState {
  isMuted: boolean
  sfxVolume: number
  isInitialized: boolean
  ttsEnabled: boolean
  autoReadEnabled: boolean
  _hasHydrated: boolean

  toggleMute: () => void
  setSfxVolume: (volume: number) => void
  playSfx: (name: SoundEffectName) => void
  initAudio: () => void
  toggleTTS: () => void
  setAutoReadEnabled: (enabled: boolean) => void
  setHasHydrated: (state: boolean) => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      sfxVolume: 0.7,
      isInitialized: false,
      ttsEnabled: true,
      autoReadEnabled: true,
      _hasHydrated: false,

      initAudio: () => {
        if (get().isInitialized) return
        soundEngine.init()
        soundEngine.setSfxVolume(get().sfxVolume)
        if (get().isMuted) {
          soundEngine.setMuted(true)
        }
        set({ isInitialized: true })
      },

      toggleMute: () => {
        const current = get().isMuted
        soundEngine.setMuted(!current)
        set({ isMuted: !current })
      },

      setSfxVolume: (volume: number) => {
        const v = Math.max(0, Math.min(1, volume))
        soundEngine.setSfxVolume(v)
        set({ sfxVolume: v })
      },

      playSfx: (name: SoundEffectName) => {
        const state = get()
        if (!state.isInitialized) {
          state.initAudio()
        }
        soundEngine.playSfx(name)
      },

       toggleTTS: () => {
         const newState = !get().ttsEnabled;
         // Only allow disabling if we can verify TTS is available
         // (This would require a capability check, simplified here)
         set({ ttsEnabled: newState });
       },

      setAutoReadEnabled: (enabled: boolean) => {
        set({ autoReadEnabled: enabled })
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },
    }),
    {
      name: 'skoolarplay-sound-settings',
      partialize: (state) => ({
        isMuted: state.isMuted,
        sfxVolume: state.sfxVolume,
        ttsEnabled: state.ttsEnabled,
        autoReadEnabled: state.autoReadEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
