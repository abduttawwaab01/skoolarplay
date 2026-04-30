/**
 * SoundEngine — Procedural audio using Web Audio API
 * No audio files needed! All sounds are generated in real-time.
 * Uses pentatonic scale patterns for Nigerian flavor.
 */

export type SoundEffectName =
  | 'correct'
  | 'levelUp'
  | 'gemCollect'
  | 'xpGain'
  | 'streak'
  | 'achievement'
  | 'purchase'
  | 'spinWheel'
  | 'wrong'
  | 'heartsLost'
  | 'outOfHearts'
  | 'bossHit'
  | 'click'
  | 'hover'
  | 'open'
  | 'close'
  | 'slide'
  | 'notification'
  | 'timer'
  | 'countdown'
  | 'bossIntro'
  | 'bossAttack'
  | 'bossDefeat'
  | 'powerUp'
  | 'mysteryBox'
  | 'loginReward'
  | 'referralReward'
  | 'questComplete'
  | 'storyTransition'
  | 'examSubmit'

// Pentatonic scale frequencies (common in African music)
// C major pentatonic: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5
const PENTATONIC = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.00,
  G3: 196.00,
  C6: 1046.50,
}

class SoundEngine {
  private audioContext: AudioContext | null = null
  private isMuted: boolean = false
  private sfxGainNode: GainNode | null = null
  private sfxVolume: number = 0.7
  private initialized: boolean = false

  init(): void {
    if (this.initialized && this.audioContext) return
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      this.sfxGainNode = this.audioContext.createGain()
      this.sfxGainNode.gain.value = this.sfxVolume
      this.sfxGainNode.connect(this.audioContext.destination)

      this.initialized = true
    } catch (e) {
      console.warn('Web Audio API not supported:', e)
    }
  }

  get isInitialized(): boolean {
    return this.initialized && this.audioContext !== null
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = muted ? 0 : this.sfxVolume
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    if (this.sfxGainNode && !this.isMuted) {
      this.sfxGainNode.gain.value = this.sfxVolume
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted)
    return this.isMuted
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext) {
      this.init()
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.5,
    attack: number = 0.01,
    decay: number = 0.1
  ): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.value = frequency

    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + decay)

    osc.connect(gain)
    gain.connect(this.sfxGainNode)

    osc.start(now)
    osc.stop(now + duration + decay + 0.05)
  }

  private playToneSequence(
    frequencies: number[],
    interval: number,
    type: OscillatorType = 'sine',
    volume: number = 0.4
  ): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq

      const startTime = now + i * interval
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + interval - 0.02)

      osc.connect(gain)
      gain.connect(this.sfxGainNode!)
      osc.start(startTime)
      osc.stop(startTime + interval)
    })
  }

  private playNoiseBurst(duration: number = 0.1, volume: number = 0.2): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    source.connect(gain)
    gain.connect(this.sfxGainNode)
    source.start(now)
  }

  private playSweep(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = startFreq

    const now = ctx.currentTime
    osc.frequency.linearRampToValueAtTime(endFreq, now + duration)
    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.05)

    osc.connect(gain)
    gain.connect(this.sfxGainNode)
    osc.start(now)
    osc.stop(now + duration + 0.1)
  }

  // === POSITIVE SOUND EFFECTS ===

  playCorrect(): void {
    this.playToneSequence(
      [PENTATONIC.C5, PENTATONIC.E5],
      0.08,
      'sine',
      0.5
    )
  }

  playLevelUp(): void {
    this.playToneSequence(
      [PENTATONIC.C4, PENTATONIC.E4, PENTATONIC.G4, PENTATONIC.C5, PENTATONIC.E5],
      0.1,
      'triangle',
      0.45
    )
    setTimeout(() => {
      this.playTone(PENTATONIC.G5, 0.3, 'sine', 0.15, 0.01, 0.2)
      this.playTone(PENTATONIC.A5, 0.25, 'sine', 0.1, 0.02, 0.15)
    }, 400)
  }

  playGemCollect(): void {
    this.playTone(PENTATONIC.E5, 0.15, 'sine', 0.35, 0.005, 0.1)
    setTimeout(() => {
      this.playTone(PENTATONIC.G5, 0.2, 'sine', 0.3, 0.005, 0.12)
    }, 80)
    setTimeout(() => {
      this.playTone(PENTATONIC.A5, 0.15, 'sine', 0.2, 0.005, 0.1)
    }, 150)
  }

  playXPGain(): void {
    this.playSweep(300, 1200, 0.25, 'sine', 0.25)
    this.playNoiseBurst(0.15, 0.08)
  }

  playStreak(): void {
    this.playNoiseBurst(0.2, 0.12)
    setTimeout(() => {
      this.playTone(PENTATONIC.A4, 0.15, 'sawtooth', 0.15, 0.01, 0.08)
      this.playTone(PENTATONIC.C5, 0.2, 'sine', 0.3, 0.01, 0.1)
    }, 100)
  }

  playAchievement(): void {
    this.playTone(PENTATONIC.C4, 0.4, 'triangle', 0.3, 0.01, 0.2)
    this.playTone(PENTATONIC.E4, 0.4, 'triangle', 0.3, 0.01, 0.2)
    this.playTone(PENTATONIC.G4, 0.4, 'triangle', 0.3, 0.01, 0.2)
    setTimeout(() => {
      this.playTone(PENTATONIC.C5, 0.5, 'sine', 0.35, 0.01, 0.25)
      this.playTone(PENTATONIC.E5, 0.4, 'sine', 0.2, 0.01, 0.2)
    }, 250)
  }

  playPurchase(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'square'
    osc1.frequency.value = 1200
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc1.connect(gain1)
    gain1.connect(this.sfxGainNode)
    osc1.start(now)
    osc1.stop(now + 0.2)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 2400
    gain2.gain.setValueAtTime(0.15, now)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    osc2.connect(gain2)
    gain2.connect(this.sfxGainNode)
    osc2.start(now)
    osc2.stop(now + 0.15)

    setTimeout(() => {
      this.playTone(1800, 0.1, 'sine', 0.12, 0.005, 0.06)
    }, 60)
  }

  playSpinWheel(): void {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(600 + Math.random() * 400, 0.06, 'square', 0.15, 0.005, 0.04)
      }, i * 70)
    }
  }

  // === NEGATIVE SOUND EFFECTS ===

  playWrong(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.linearRampToValueAtTime(150, now + 0.2)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGainNode)
    osc.start(now)
    osc.stop(now + 0.3)
  }

  playHeartsLost(): void {
    this.playToneSequence(
      [PENTATONIC.E4, PENTATONIC.D4, 311.13, 261.63],
      0.15,
      'sine',
      0.35
    )
  }

  playOutOfHearts(): void {
    this.playSweep(400, 100, 0.6, 'sawtooth', 0.25)
    setTimeout(() => {
      this.playNoiseBurst(0.3, 0.15)
    }, 200)
  }

  playBossHit(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3)
    gain.gain.setValueAtTime(0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    const distortion = ctx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x))
    }
    distortion.curve = curve

    osc.connect(distortion)
    distortion.connect(gain)
    gain.connect(this.sfxGainNode)
    osc.start(now)
    osc.stop(now + 0.4)

    this.playNoiseBurst(0.1, 0.2)
  }

  // === UI SOUNDS ===

  playClick(): void {
    this.playTone(800, 0.05, 'sine', 0.2, 0.005, 0.03)
  }

  playHover(): void {
    this.playTone(1000, 0.03, 'sine', 0.08, 0.003, 0.02)
  }

  playOpen(): void {
    this.playSweep(200, 600, 0.2, 'sine', 0.15)
  }

  playClose(): void {
    this.playSweep(600, 200, 0.2, 'sine', 0.15)
  }

  playSlide(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const bufferSize = ctx.sampleRate * 0.15
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(2000, ctx.currentTime)
    filter.frequency.linearRampToValueAtTime(4000, ctx.currentTime + 0.15)
    filter.Q.value = 1

    const gain = ctx.createGain()
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0.1, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGainNode)
    source.start(now)
  }

  playNotification(): void {
    this.playTone(PENTATONIC.G5, 0.15, 'sine', 0.35, 0.005, 0.08)
    setTimeout(() => {
      this.playTone(PENTATONIC.E5, 0.2, 'sine', 0.25, 0.005, 0.1)
    }, 120)
  }

  playTimer(): void {
    this.playTone(600, 0.05, 'square', 0.15, 0.003, 0.03)
  }

  playCountdown(): void {
    this.playTone(800, 0.1, 'square', 0.2, 0.005, 0.05)
    setTimeout(() => {
      this.playTone(800, 0.1, 'square', 0.2, 0.005, 0.05)
    }, 150)
    setTimeout(() => {
      this.playTone(1200, 0.2, 'square', 0.25, 0.005, 0.1)
    }, 300)
  }

  // === BATTLE SOUNDS ===

  playBossIntro(): void {
    this.playSweep(60, 200, 1.0, 'sawtooth', 0.2)
    this.playNoiseBurst(0.8, 0.1)
    setTimeout(() => {
      this.playToneSequence(
        [PENTATONIC.C4, PENTATONIC.D4, PENTATONIC.E4, PENTATONIC.G4],
        0.15,
        'triangle',
        0.35
      )
    }, 600)
  }

  playBossAttack(): void {
    const ctx = this.ensureContext()
    if (!ctx || !this.sfxGainNode) return

    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, now)
    osc.frequency.linearRampToValueAtTime(80, now + 0.2)
    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    const distortion = ctx.createWaveShaper()
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x))
    }
    distortion.curve = curve

    osc.connect(distortion)
    distortion.connect(gain)
    gain.connect(this.sfxGainNode)
    osc.start(now)
    osc.stop(now + 0.3)

    this.playNoiseBurst(0.15, 0.15)
  }

  playBossDefeat(): void {
    this.playToneSequence(
      [PENTATONIC.C4, PENTATONIC.E4, PENTATONIC.G4, PENTATONIC.C5, PENTATONIC.E5, PENTATONIC.G5],
      0.12,
      'triangle',
      0.4
    )
    setTimeout(() => {
      this.playTone(PENTATONIC.C6, 0.5, 'sine', 0.3, 0.01, 0.3)
      this.playTone(PENTATONIC.E5, 0.5, 'sine', 0.2, 0.01, 0.3)
      this.playTone(PENTATONIC.G5, 0.5, 'sine', 0.2, 0.01, 0.3)
    }, 650)
  }

  playPowerUp(): void {
    this.playSweep(200, 1500, 0.5, 'sine', 0.25)
    setTimeout(() => {
      this.playTone(PENTATONIC.C5, 0.3, 'triangle', 0.2, 0.01, 0.15)
      this.playTone(PENTATONIC.E5, 0.25, 'sine', 0.15, 0.01, 0.12)
    }, 350)
  }

  // === REWARDS SOUNDS ===

  playMysteryBox(): void {
    this.playToneSequence(
      [PENTATONIC.E4, PENTATONIC.G4, PENTATONIC.A4],
      0.2,
      'triangle',
      0.3
    )
    setTimeout(() => {
      this.playTone(PENTATONIC.G5, 0.3, 'sine', 0.2, 0.02, 0.15)
      this.playTone(PENTATONIC.A5, 0.25, 'sine', 0.15, 0.02, 0.12)
    }, 500)
  }

  playLoginReward(): void {
    this.playToneSequence(
      [PENTATONIC.C5, PENTATONIC.D5, PENTATONIC.E5, PENTATONIC.C5],
      0.12,
      'sine',
      0.35
    )
    setTimeout(() => {
      this.playTone(PENTATONIC.G5, 0.3, 'sine', 0.2, 0.01, 0.15)
    }, 450)
  }

  playReferralReward(): void {
    this.playTone(PENTATONIC.C5, 0.15, 'sine', 0.3, 0.005, 0.08)
    setTimeout(() => {
      this.playTone(PENTATONIC.E5, 0.15, 'sine', 0.3, 0.005, 0.08)
    }, 100)
    setTimeout(() => {
      this.playTone(PENTATONIC.G5, 0.15, 'sine', 0.3, 0.005, 0.08)
    }, 200)
    setTimeout(() => {
      this.playTone(PENTATONIC.C6, 0.3, 'sine', 0.35, 0.005, 0.15)
    }, 300)
  }

  playQuestComplete(): void {
    this.playToneSequence(
      [PENTATONIC.C4, PENTATONIC.E4, PENTATONIC.G4, PENTATONIC.C5],
      0.1,
      'triangle',
      0.45
    )
    setTimeout(() => {
      this.playTone(PENTATONIC.E5, 0.3, 'sine', 0.25, 0.01, 0.15)
      this.playTone(PENTATONIC.G5, 0.25, 'sine', 0.15, 0.01, 0.12)
    }, 350)
  }

  playStoryTransition(): void {
    const glissandoFreqs = [PENTATONIC.C4, PENTATONIC.D4, PENTATONIC.E4, PENTATONIC.G4, PENTATONIC.A4, PENTATONIC.C5, PENTATONIC.D5, PENTATONIC.E5]
    glissandoFreqs.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 'sine', 0.15 + i * 0.02, 0.01, 0.3)
      }, i * 60)
    })
  }

  playExamSubmit(): void {
    this.playTone(120, 0.6, 'sine', 0.4, 0.01, 0.3)
    this.playTone(240, 0.5, 'sine', 0.2, 0.01, 0.25)
    setTimeout(() => {
      this.playTone(PENTATONIC.C4, 0.5, 'triangle', 0.25, 0.02, 0.2)
      this.playTone(PENTATONIC.E4, 0.5, 'triangle', 0.25, 0.02, 0.2)
      this.playTone(PENTATONIC.G4, 0.5, 'triangle', 0.25, 0.02, 0.2)
      this.playTone(PENTATONIC.C5, 0.6, 'sine', 0.3, 0.02, 0.25)
    }, 500)
  }

  // === Generic SFX Dispatcher ===

  playSfx(name: SoundEffectName): void {
    if (this.isMuted) return

    const sfxMap: Record<SoundEffectName, () => void> = {
      correct: () => this.playCorrect(),
      levelUp: () => this.playLevelUp(),
      gemCollect: () => this.playGemCollect(),
      xpGain: () => this.playXPGain(),
      streak: () => this.playStreak(),
      achievement: () => this.playAchievement(),
      purchase: () => this.playPurchase(),
      spinWheel: () => this.playSpinWheel(),
      wrong: () => this.playWrong(),
      heartsLost: () => this.playHeartsLost(),
      outOfHearts: () => this.playOutOfHearts(),
      bossHit: () => this.playBossHit(),
      click: () => this.playClick(),
      hover: () => this.playHover(),
      open: () => this.playOpen(),
      close: () => this.playClose(),
      slide: () => this.playSlide(),
      notification: () => this.playNotification(),
      timer: () => this.playTimer(),
      countdown: () => this.playCountdown(),
      bossIntro: () => this.playBossIntro(),
      bossAttack: () => this.playBossAttack(),
      bossDefeat: () => this.playBossDefeat(),
      powerUp: () => this.playPowerUp(),
      mysteryBox: () => this.playMysteryBox(),
      loginReward: () => this.playLoginReward(),
      referralReward: () => this.playReferralReward(),
      questComplete: () => this.playQuestComplete(),
      storyTransition: () => this.playStoryTransition(),
      examSubmit: () => this.playExamSubmit(),
    }

    const fn = sfxMap[name]
    if (fn) fn()
  }
}

export const soundEngine = new SoundEngine()
