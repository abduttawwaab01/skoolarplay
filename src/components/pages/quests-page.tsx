'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Swords, Gem, Zap, Clock, Check, Trophy, Lock, Target, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

interface Quest {
  id: string
  title: string
  description: string
  type: string
  requirement: string
  targetCount: number
  xpReward: number
  gemReward: number
  progress: number
  completed: boolean
  canClaim: boolean
  completedAt: string | null
  endDate: string
}

export function QuestsPage() {
  const { user, updateGems, updateXP } = useAuthStore()
  const playQuestComplete = useSoundEffect('questComplete')
  const playClick = useSoundEffect('click')
  const playAchievement = useSoundEffect('achievement')
  const playWrong = useSoundEffect('wrong')
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    try {
      const res = await fetch('/api/quests')
      const data = await res.json()
      setQuests(data.quests || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  const handleClaim = async (questId: string) => {
    if (claiming) return
    setClaiming(questId)

    try {
      const res = await fetch('/api/quests/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      })

      const data = await res.json()

      if (!res.ok) {
        playWrong()
        toast.error(data.error || 'Failed to claim')
        setClaiming(null)
        return
      }

      if (data.rewards) {
        updateGems(data.rewards.gems)
        updateXP(data.rewards.xp)
      }

      toast.success(`Quest complete! +${data.rewards.xp} XP, +${data.rewards.gems} Gems 🎉`)
      playQuestComplete()
      playAchievement()
      fetchQuests()
    } catch {
      playWrong()
      toast.error('Failed to claim reward')
    } finally {
      setClaiming(null)
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins}m`
  }

  const dailyQuests = quests.filter((q) => q.type === 'DAILY')
  const weeklyQuests = quests.filter((q) => q.type === 'WEEKLY')

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const QuestCard = ({ quest }: { quest: Quest }) => {
    const progressPercent = Math.min(100, (quest.progress / quest.targetCount) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        className={`relative rounded-xl border p-4 transition-all ${
          quest.completed
            ? quest.canClaim
              ? 'bg-[#F59E0B]/5 border-[#F59E0B]/30 shadow-sm'
              : 'bg-muted/30 border-muted'
            : 'bg-card border-border hover:shadow-md'
        }`}
      >
        {/* Mission briefing header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              quest.completed && quest.canClaim
                ? 'bg-[#F59E0B]/20'
                : quest.completed
                ? 'bg-[#008751]/20'
                : 'bg-primary/10'
            }`}>
              {quest.completed && !quest.canClaim ? (
                <Check className="w-5 h-5 text-[#008751]" />
              ) : quest.completed && quest.canClaim ? (
                <Star className="w-5 h-5 text-[#F59E0B]" />
              ) : (
                <Target className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">{quest.title}</h3>
                <Badge variant="secondary" className="text-[10px] rounded-full">
                  {quest.type === 'DAILY' ? '📅 Daily' : '📆 Weekly'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{quest.description}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {getTimeRemaining(quest.endDate)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{quest.progress}/{quest.targetCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Rewards + Claim */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-xs">{quest.xpReward} XP</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Gem className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-xs">{quest.gemReward} Gems</span>
            </div>
          </div>

          {quest.canClaim ? (
            <Button
              size="sm"
              onClick={() => handleClaim(quest.id)}
              disabled={claiming === quest.id}
              className="rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white h-8 text-xs font-bold"
            >
              {claiming === quest.id ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Trophy className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <>
                  <Gem className="w-3 h-3 mr-1" />
                  Claim!
                </>
              )}
            </Button>
          ) : quest.completed ? (
            <Badge variant="secondary" className="rounded-full text-xs bg-[#008751]/10 text-[#008751]">
              <Check className="w-3 h-3 mr-1" /> Claimed
            </Badge>
          ) : (
            <Badge variant="secondary" className="rounded-full text-xs">
              <Lock className="w-3 h-3 mr-1" /> In Progress
            </Badge>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-[#008751] to-[#005E38] p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl"
          >
            📋
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Active Quests</h1>
            <p className="text-white/80 text-sm">Complete quests to earn bonus rewards!</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="daily">
        <TabsList className="bg-muted/80 w-full max-w-sm h-auto p-1 rounded-xl">
          <TabsTrigger value="daily" className="rounded-lg text-sm">📅 Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg text-sm">📆 Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          {dailyQuests.length > 0 ? (
            <div className="space-y-3 mt-4">
              {dailyQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No daily quests</h3>
              <p className="text-sm text-muted-foreground">Check back tomorrow for new quests!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly">
          {weeklyQuests.length > 0 ? (
            <div className="space-y-3 mt-4">
              {weeklyQuests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No weekly quests</h3>
              <p className="text-sm text-muted-foreground">New weekly quests coming soon!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
