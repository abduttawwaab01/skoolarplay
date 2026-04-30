'use client'

import { Volume2, VolumeX, Volume1 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useSoundStore } from '@/store/sound-store'

export function SoundSettings() {
  const {
    isMuted,
    sfxVolume,
    toggleMute,
    setSfxVolume,
  } = useSoundStore()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isMuted
                ? 'bg-red-500/10'
                : 'bg-primary/10'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Sound Effects</p>
            <p className="text-xs text-muted-foreground">
              {isMuted ? 'All sounds muted' : 'Sounds enabled'}
            </p>
          </div>
        </div>
        <Switch checked={!isMuted} onCheckedChange={() => toggleMute()} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume1 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Volume</span>
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {Math.round(sfxVolume * 100)}%
          </span>
        </div>
        <Slider
          value={[sfxVolume * 100]}
          min={0}
          max={100}
          step={1}
          disabled={isMuted}
          onValueChange={([v]) => setSfxVolume(v / 100)}
          className="w-full"
        />
      </div>
    </div>
  )
}
