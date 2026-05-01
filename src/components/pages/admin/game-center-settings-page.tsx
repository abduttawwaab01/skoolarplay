'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
  Settings,
  Save,
  Clock,
  BookOpen,
  Zap,
  Gem,
  Crown,
  Shield,
  Timer,
  Trophy,
  BarChart3,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

interface GameCenterSettings {
  id: string
  minLessonsCompleted: number
  minTimeSpentMinutes: number
  enablePremiumBypass: boolean
  dailyXpCap: number
  dailyGemCap: number
  gameTypes: {
    type: string
    isActive: boolean
    xpReward: number
    gemReward: number
    timeLimit: number
    minLevels: {
      EASY: number
      MEDIUM: number
      HARD: number
      EXPERT: number
    }
  }[]
  createdAt: string
  updatedAt: string
}

const GAME_TYPE_LABELS: Record<string, string> = {
  WORD_MATCH: 'Word Match',
  MATH_CHALLENGE: 'Math Challenge',
  TYPING_RACE: 'Typing Race',
  WORD_SCRAMBLE: 'Word Scramble',
  MEMORY_FLIP: 'Memory Flip',
  QUIZ_RACE: 'Quiz Race',
  SPELLING_BEE: 'Spelling Bee',
  ANAGRAMS: 'Anagrams',
}

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const

export function AdminGameCenterSettingsPage() {
  const { user } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [settings, setSettings] = useState<GameCenterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Unlock settings
  const [minLessons, setMinLessons] = useState(5)
  const [minMinutes, setMinMinutes] = useState(30)
  const [premiumBypass, setPremiumBypass] = useState(true)

  // Reward caps
  const [dailyXpCap, setDailyXpCap] = useState(100)
  const [dailyGemCap, setDailyGemCap] = useState(50)

  // Game configs
  const [gameConfigs, setGameConfigs] = useState<Record<string, { isActive: boolean; xpReward: number; gemReward: number; timeLimit: number; minLevels: Record<string, number> }>>({})

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigateTo('dashboard')
      return
    }
    fetchSettings()
  }, [user, navigateTo])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/game-center/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setMinLessons(data.minLessonsCompleted)
        setMinMinutes(data.minTimeSpentMinutes)
        setPremiumBypass(data.enablePremiumBypass)
        setDailyXpCap(data.dailyXpCap)
        setDailyGemCap(data.dailyGemCap)

        const configs: typeof gameConfigs = {}
        data.gameTypes.forEach((gt: GameCenterSettings['gameTypes'][0]) => {
          configs[gt.type] = {
            isActive: gt.isActive,
            xpReward: gt.xpReward,
            gemReward: gt.gemReward,
            timeLimit: gt.timeLimit,
            minLevels: { ...gt.minLevels },
          }
        })
        setGameConfigs(configs)
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/game-center/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minLessonsCompleted: minLessons,
          minTimeSpentMinutes: minMinutes,
          enablePremiumBypass: premiumBypass,
          dailyXpCap: dailyXpCap,
          dailyGemCap: dailyGemCap,
          gameConfigs,
        }),
      })

      if (res.ok) {
        toast.success('Game Center settings saved!')
        fetchSettings()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!settings) return
    setMinLessons(settings.minLessonsCompleted)
    setMinMinutes(settings.minTimeSpentMinutes)
    setPremiumBypass(settings.enablePremiumBypass)
    setDailyXpCap(settings.dailyXpCap)
    setDailyGemCap(settings.dailyGemCap)

    const configs: typeof gameConfigs = {}
    settings.gameTypes.forEach((gt) => {
      configs[gt.type] = {
        isActive: gt.isActive,
        xpReward: gt.xpReward,
        gemReward: gt.gemReward,
        timeLimit: gt.timeLimit,
        minLevels: { ...gt.minLevels },
      }
    })
    setGameConfigs(configs)
    toast.info('Settings reset to last saved values')
  }

  const updateGameConfig = (type: string, field: string, value: unknown) => {
    setGameConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }))
  }

  const updateMinLevel = (type: string, difficulty: string, value: number) => {
    setGameConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        minLevels: {
          ...prev[type].minLevels,
          [difficulty]: value,
        },
      },
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Game Center Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure access controls, rewards, and game parameters</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Access Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access Controls
          </CardTitle>
          <CardDescription>Requirements students must meet before accessing the Game Center</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="minLessons" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Minimum Lessons Completed
              </Label>
              <Input
                id="minLessons"
                type="number"
                min={0}
                max={100}
                value={minLessons}
                onChange={(e) => setMinLessons(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">Students must complete this many lessons before games unlock</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minMinutes" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Minimum Learning Time (minutes)
              </Label>
              <Input
                id="minMinutes"
                type="number"
                min={0}
                max={600}
                value={minMinutes}
                onChange={(e) => setMinMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">Total minutes students must spend learning</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="premiumBypass" className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Premium Bypass
              </Label>
              <p className="text-sm text-muted-foreground">Premium subscribers skip access requirements</p>
            </div>
            <Switch
              id="premiumBypass"
              checked={premiumBypass}
              onCheckedChange={setPremiumBypass}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reward Caps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Reward Caps
          </CardTitle>
          <CardDescription>Maximum rewards students can earn from games per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dailyXpCap" className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Daily XP Cap
              </Label>
              <Input
                id="dailyXpCap"
                type="number"
                min={0}
                max={1000}
                value={dailyXpCap}
                onChange={(e) => setDailyXpCap(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">Maximum XP earnable from games per day (0 = unlimited)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyGemCap" className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-500" />
                Daily Gem Cap
              </Label>
              <Input
                id="dailyGemCap"
                type="number"
                min={0}
                max={500}
                value={dailyGemCap}
                onChange={(e) => setDailyGemCap(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">Maximum gems earnable from games per day (0 = unlimited)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Configurations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5" />
          <h2 className="text-xl font-bold">Game Configurations</h2>
        </div>
        <p className="text-muted-foreground mb-6">Configure individual game parameters, rewards, and difficulty level requirements</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(GAME_TYPE_LABELS).map(([type, label]) => {
            const config = gameConfigs[type]
            if (!config) return null

            return (
              <Card key={type} className={config.isActive ? '' : 'opacity-60'}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{label}</CardTitle>
                    <div className="flex items-center gap-2">
                      {config.isActive ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Check className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${type}-active`}>Enabled</Label>
                    <Switch
                      id={`${type}-active`}
                      checked={config.isActive}
                      onCheckedChange={(checked) => updateGameConfig(type, 'isActive', checked)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">XP Reward</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.xpReward}
                        onChange={(e) => updateGameConfig(type, 'xpReward', Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Gem Reward</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.gemReward}
                        onChange={(e) => updateGameConfig(type, 'gemReward', Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Time (sec)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={config.timeLimit}
                        onChange={(e) => updateGameConfig(type, 'timeLimit', Math.max(0, parseInt(e.target.value) || 0))}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs flex items-center gap-1 mb-2">
                      <Trophy className="w-3 h-3" />
                      Minimum Level by Difficulty
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DIFFICULTIES.map(diff => (
                        <div key={diff} className="space-y-1">
                          <Label className="text-[10px] uppercase">{diff}</Label>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={config.minLevels[diff]}
                            onChange={(e) => updateMinLevel(type, diff, Math.max(1, parseInt(e.target.value) || 1))}
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect all students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Reset All Game Scores</p>
                <p className="text-sm text-muted-foreground">Clear all game scores, high scores, and play counts for every student</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure? This will delete ALL game scores permanently.')) {
                    toast.info('Score reset would be handled here')
                  }
                }}
              >
                Reset Scores
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Disable All Games</p>
                <p className="text-sm text-muted-foreground">Temporarily disable all games for all students</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Disable all games? This can be reversed individually.')) {
                    const newConfigs = { ...gameConfigs }
                    Object.keys(newConfigs).forEach(type => {
                      newConfigs[type] = { ...newConfigs[type], isActive: false }
                    })
                    setGameConfigs(newConfigs)
                    toast.info('All games disabled. Click Save to apply.')
                  }
                }}
              >
                Disable All
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Reset to Defaults</p>
                <p className="text-sm text-muted-foreground">Restore all settings to factory defaults (5 lessons, 30 min, 100 XP, 50 gems)</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMinLessons(5)
                  setMinMinutes(30)
                  setPremiumBypass(true)
                  setDailyXpCap(100)
                  setDailyGemCap(50)
                  const defaults: typeof gameConfigs = {
                    WORD_MATCH: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    MATH_CHALLENGE: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    TYPING_RACE: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 90, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    WORD_SCRAMBLE: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    MEMORY_FLIP: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    QUIZ_RACE: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 90, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    SPELLING_BEE: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                    ANAGRAMS: { isActive: true, xpReward: 10, gemReward: 1, timeLimit: 120, minLevels: { EASY: 1, MEDIUM: 3, HARD: 5, EXPERT: 8 } },
                  }
                  setGameConfigs(defaults)
                  toast.info('Defaults restored. Click Save to apply.')
                }}
              >
                Restore Defaults
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
