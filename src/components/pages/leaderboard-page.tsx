'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Crown,
  Medal,
  Zap,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Minus,
  Star,
  Award,
  Gem,
  Clock,
  Target,
  BookOpen,
  Users,
  Lock,
  ChevronRight,
  Gift,
  Flame,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { UserLink } from '@/components/shared/user-link'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

// ======================== TYPES ========================

interface LeagueInfo {
  currentLeague: { name: string; icon: string; color: string; tier: number }
  nextLeague: { name: string; icon: string; color: string; minXP: number } | null
  prevLeague: { name: string; icon: string; color: string } | null
  weeklyXp: number
  totalXp: number
  xpNeededToPromote: number
  progressInLeague: number
  leagueRank: number
  leagueSize: number
  topUsers: Array<{
    id: string
    name: string
    avatar: string | null
    weeklyXp: number
    isOnline: boolean
    league: string
    totalLessonsCompleted: number
    rank: number
  }>
  rewards: Array<{ rank: string; gems: number; icon: string }>
  daysUntilEnd: number
  endOfWeek: string
}

interface LeaderboardUser {
  id: string
  name: string
  avatar: string | null
  level: number
  xp: number
  rank: number
  league: string
  planTier: string
  isOnline: boolean
  totalLessonsCompleted: number
  totalCoursesCompleted: number
  prevRank?: number
}

const LEAGUE_CONFIG: Record<string, { gradient: string; ring: string; text: string; bg: string }> = {
  BRONZE: { gradient: 'from-amber-700 to-amber-500', ring: 'ring-amber-600', text: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-950/30' },
  SILVER: { gradient: 'from-gray-400 to-gray-300', ring: 'ring-gray-400', text: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800/30' },
  GOLD: { gradient: 'from-yellow-500 to-yellow-400', ring: 'ring-yellow-500', text: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-950/30' },
  PLATINUM: { gradient: 'from-cyan-400 to-blue-400', ring: 'ring-cyan-500', text: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-950/30' },
  DIAMOND: { gradient: 'from-blue-500 to-purple-500', ring: 'ring-blue-500', text: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-950/30' },
  SAPPHIRE: { gradient: 'from-indigo-500 to-blue-600', ring: 'ring-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-950/30' },
  RUBY: { gradient: 'from-red-500 to-pink-500', ring: 'ring-red-500', text: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950/30' },
  OBSIDIAN: { gradient: 'from-gray-800 to-gray-900', ring: 'ring-gray-700', text: 'text-gray-300', bg: 'bg-gray-200 dark:bg-gray-800/50' },
}

const LEAGUE_ICONS: Record<string, string> = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
  DIAMOND: '🔷',
  SAPPHIRE: '💠',
  RUBY: '❤️‍🔥',
  OBSIDIAN: '🖤',
}

type TabType = 'LEAGUE' | 'WEEKLY' | 'DAILY' | 'ALL_TIME'
type PeriodMap = { [key in TabType]: string }

const PERIOD_MAP: PeriodMap = {
  LEAGUE: 'WEEKLY',
  WEEKLY: 'WEEKLY',
  DAILY: 'DAILY',
  ALL_TIME: 'ALL_TIME',
}

// ======================== SKELETON ========================

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto">
      {/* League Badge Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />
      {/* Tab bar skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />
      {/* Podium skeleton */}
      <div className="flex items-end justify-center gap-4 py-4">
        <Skeleton className="h-32 w-28 rounded-2xl" />
        <Skeleton className="h-40 w-32 rounded-2xl" />
        <Skeleton className="h-32 w-28 rounded-2xl" />
      </div>
      {/* List skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

// ======================== LEAGUE SHIELD ========================

function LeagueShield({ leagueInfo }: { leagueInfo: LeagueInfo }) {
  const cfg = LEAGUE_CONFIG[leagueInfo.currentLeague.name] || LEAGUE_CONFIG.BRONZE
  const icon = LEAGUE_ICONS[leagueInfo.currentLeague.name] || '🥉'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="relative overflow-hidden rounded-2xl"
    >
      <div className={`bg-gradient-to-br ${cfg.gradient} p-6 md:p-8 text-white relative`}>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-white/5 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/5" />

        <div className="relative z-10">
          {/* League Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 ring-4 ring-white/30 shadow-lg"
            >
              <span className="text-5xl md:text-6xl">{icon}</span>
            </motion.div>
            <h2 className="text-xl md:text-2xl font-black tracking-wide">
              {leagueInfo.currentLeague.name} LEAGUE
            </h2>
            <p className="text-white/70 text-sm mt-1">Tier {leagueInfo.currentLeague.tier} of 8</p>
          </div>

          {/* XP Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{leagueInfo.weeklyXp} XP this week</span>
              {leagueInfo.nextLeague && (
                <span className="text-white/70">{leagueInfo.xpNeededToPromote} XP to {leagueInfo.nextLeague.name}</span>
              )}
              {!leagueInfo.nextLeague && (
                <span className="text-white/70 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" /> Max League!
                </span>
              )}
            </div>
            <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(2, leagueInfo.progressInLeague)}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-white/80 rounded-full"
              />
            </div>
          </div>

          {/* Week Timer */}
          <div className="flex items-center justify-center gap-2 mt-4 text-white/80 text-sm">
            <Clock className="w-4 h-4" />
            <span>Week ends in {leagueInfo.daysUntilEnd} day{leagueInfo.daysUntilEnd !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ======================== PODIUM ========================

function PodiumUser({
  user,
  position,
  isCurrentUser,
}: {
  user: LeaderboardUser
  position: number
  isCurrentUser: boolean
}) {
  const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const leagueCfg = LEAGUE_CONFIG[user.league] || LEAGUE_CONFIG.BRONZE
  const leagueIcon = LEAGUE_ICONS[user.league] || '🥉'

  const medals: Record<number, { color: string; bg: string; size: string; border: string }> = {
    1: { color: 'text-yellow-600', bg: 'bg-gradient-to-t from-yellow-500 to-yellow-400', size: 'w-18 h-18 md:w-22 md:h-22', border: 'border-yellow-400' },
    2: { color: 'text-gray-500', bg: 'bg-gradient-to-t from-gray-400 to-gray-300', size: 'w-15 h-15 md:w-18 md:h-18', border: 'border-gray-400' },
    3: { color: 'text-amber-700', bg: 'bg-gradient-to-t from-amber-600 to-amber-500', size: 'w-14 h-14 md:w-16 md:h-16', border: 'border-amber-500' },
  }
  const m = medals[position]
  const heights: Record<number, string> = { 1: 'h-36 md:h-44', 2: 'h-28 md:h-34', 3: 'h-24 md:h-30' }
  const orderClasses: Record<number, string> = { 1: 'order-2', 2: 'order-1', 3: 'order-3' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: position === 1 ? 0.3 : position === 2 ? 0.2 : 0.4, type: 'spring' }}
      className={`flex flex-col items-center ${orderClasses[position]} w-28 md:w-36`}
    >
      {/* Crown for 1st */}
      {position === 1 && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="absolute -top-6 z-10"
        >
          <Crown className="w-7 h-7 text-yellow-500 drop-shadow-lg" />
        </motion.div>
      )}

      {/* Avatar */}
      <motion.div
        animate={position === 1 ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="relative mb-2"
      >
        <Avatar className={`${m.size} border-4 ${isCurrentUser ? 'border-primary' : m.border} relative`}>
          <AvatarFallback className={`${m.bg} text-lg font-bold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Online indicator */}
        {user.isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        )}
        {/* League mini badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-xs shadow-sm">
          {leagueIcon}
        </div>
      </motion.div>

      {/* Name */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs md:text-sm font-bold text-center max-w-[110px] truncate">
          <UserLink userId={user.id} name={user.name}>
            {user.name}
          </UserLink>
          {isCurrentUser && (
            <Badge className="ml-1 bg-primary text-primary-foreground text-[9px] px-1 py-0 h-3.5 rounded-full">
              You
            </Badge>
          )}
        </p>
        {user.planTier && user.planTier !== 'FREE' && (
          <PlanBadge tier={user.planTier as PlanTier} size="tiny" />
        )}
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Zap className="w-3 h-3 text-amber-500" />
        <span className="font-semibold">{user.xp.toLocaleString()}</span>
      </div>

      {/* Pedestal */}
      <div className={`w-full ${heights[position]} rounded-t-2xl ${m.bg} flex flex-col items-center justify-start pt-3 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <Trophy className={`w-5 h-5 ${m.color} mb-1`} />
        <span className="text-xl font-black text-white/90">#{position}</span>
      </div>
    </motion.div>
  )
}

// ======================== USER ROW ========================

function UserRow({
  entry,
  isCurrentUser,
  index,
}: {
  entry: LeaderboardUser
  isCurrentUser: boolean
  index: number
}) {
  const initials = entry.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const leagueIcon = LEAGUE_ICONS[entry.league] || '🥉'

  // Determine rank change
  const prevRank = entry.prevRank
  let rankChange: 'up' | 'down' | 'same' | null = null
  if (prevRank !== undefined) {
    if (prevRank > entry.rank) rankChange = 'up'
    else if (prevRank < entry.rank) rankChange = 'down'
    else rankChange = 'same'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index + 3) * 0.04 }}
    >
      <Card
        className={`rounded-xl border-0 shadow-sm transition-all hover:shadow-md ${
          isCurrentUser
            ? 'bg-primary/8 ring-2 ring-primary/40 shadow-primary/10 dark:bg-primary/10'
            : 'bg-card'
        }`}
      >
        <CardContent className="p-3 md:p-4 flex items-center gap-3">
          {/* Rank */}
          <div className="w-8 text-center shrink-0 relative">
            <span className="text-base font-bold text-muted-foreground">#{entry.rank}</span>
            {rankChange && (
              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
                {rankChange === 'up' && <ArrowUpCircle className="w-3.5 h-3.5 text-green-500" />}
                {rankChange === 'down' && <ArrowDownCircle className="w-3.5 h-3.5 text-red-500" />}
                {rankChange === 'same' && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className={`w-10 h-10 ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
              <AvatarFallback className="bg-muted text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {entry.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>

          {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <UserLink userId={entry.id} name={entry.name}>
                  <p className="font-semibold text-sm truncate">{entry.name}</p>
                </UserLink>
              {isCurrentUser && (
                <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-3.5 rounded-full shrink-0">
                  You
                </Badge>
              )}
              {entry.planTier && entry.planTier !== 'FREE' && (
                <PlanBadge tier={entry.planTier as PlanTier} size="tiny" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">Lv.{entry.level}</span>
              <span className="text-xs">{leagueIcon}</span>
              {entry.totalLessonsCompleted > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <BookOpen className="w-2.5 h-2.5" />
                  {entry.totalLessonsCompleted}
                </span>
              )}
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 shrink-0">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-sm">{entry.xp.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">XP</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ======================== REWARDS CARD ========================

function RewardsCard({ rewards, daysUntilEnd }: { rewards: LeagueInfo['rewards']; daysUntilEnd: number }) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <Accordion type="single" collapsible>
        <AccordionItem value="rewards" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">League Rewards</p>
                <p className="text-xs text-muted-foreground">Win gems based on your rank!</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              {rewards.map((r) => (
                <div
                  key={r.rank}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 dark:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{r.icon}</span>
                    <span className="font-semibold text-sm">{r.rank} Place</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gem className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{r.gems}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-white/60 dark:bg-white/5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Week ends in <span className="font-bold text-foreground">{daysUntilEnd} day{daysUntilEnd !== 1 ? 's' : ''}</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Complete more lessons to rank up! 🚀
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}

// ======================== QUICK STATS ========================

function QuickStats({ leagueInfo, currentUserRank }: { leagueInfo: LeagueInfo; currentUserRank: number | null }) {
  const stats = [
    {
      label: 'Your Rank',
      value: `#${currentUserRank || leagueInfo.leagueRank}`,
      icon: Trophy,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'Week XP',
      value: leagueInfo.weeklyXp.toLocaleString(),
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'League Size',
      value: leagueInfo.leagueSize.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Lessons Done',
      value: leagueInfo.topUsers.find((u) => u.id === '')?.totalLessonsCompleted?.toString() || '0',
      icon: BookOpen,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-base font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

// ======================== MOTIVATIONAL FOOTER ========================

function MotivationalFooter({ rank, leagueSize }: { rank: number | null; leagueSize: number }) {
  if (!rank) return null

  let message = ''
  let icon: React.ReactNode = null
  let colorClass = ''

  if (rank <= 3 && leagueSize > 3) {
    message = "You're on track for promotion! 🎉"
    icon = <Flame className="w-5 h-5 text-orange-500" />
    colorClass = 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20'
  } else if (rank > leagueSize - 3 && leagueSize > 6) {
    message = 'Keep learning to avoid demotion!'
    icon = <Shield className="w-5 h-5 text-red-500" />
    colorClass = 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20'
  } else {
    message = "You're doing great! Push for promotion!"
    icon = <TrendingUp className="w-5 h-5 text-blue-500" />
    colorClass = 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      <Card className={`border-0 shadow-sm bg-gradient-to-r ${colorClass}`}>
        <CardContent className="p-4 flex items-center gap-3">
          {icon}
          <p className="text-sm font-medium">{message}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ======================== MAIN PAGE ========================

export function LeaderboardPage() {
  const { user } = useAuthStore()
  const { goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playNotification = useSoundEffect('notification')
  const [entries, setEntries] = useState<LeaderboardUser[]>([])
  const [prevEntries, setPrevEntries] = useState<LeaderboardUser[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('LEAGUE')
  const [leagueInfo, setLeagueInfo] = useState<LeagueInfo | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const prevEntriesRef = useRef<LeaderboardUser[]>([])
  const [showStickyUser, setShowStickyUser] = useState(false)

  // Keep ref in sync for safe functional updates without triggering dependency
  useEffect(() => {
    prevEntriesRef.current = entries
  }, [entries])

  // Fetch league info
  const fetchLeagueInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard/leagues')
      if (res.ok) {
        const data = await res.json()
        setLeagueInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch league info:', error)
    }
  }, [])

  // Fetch leaderboard entries
  const fetchLeaderboard = useCallback(async (tab: TabType) => {
    try {
      setLoading(true)
      const period = PERIOD_MAP[tab]
      const category = tab === 'LEAGUE' ? 'LEAGUE' : 'OVERALL'
      const params = new URLSearchParams({ period, category })
      const res = await fetch(`/api/leaderboard?${params}`)
      const data = await res.json()

      // Save previous entries for rank change comparison
      setPrevEntries((prev) => (prev.length > 0 ? prevEntriesRef.current : prev))
      setEntries(data.entries || [])
      setCurrentUserRank(data.currentUserRank || null)
      playNotification()
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [playNotification])

  useEffect(() => {
    fetchLeagueInfo()
  }, [fetchLeagueInfo])

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab, fetchLeaderboard])

  // Merge prev ranks into entries
  const entriesWithPrev = entries.map((entry) => {
    const prev = prevEntries.find((p) => p.id === entry.id)
    return { ...entry, prevRank: prev?.rank }
  })

  if (loading && entries.length === 0) return <LeaderboardSkeleton />

  const top3 = entriesWithPrev.slice(0, 3)
  const rest = entriesWithPrev.slice(3)

  // Find current user in the list
  const currentUserEntry = entriesWithPrev.find((e) => e.id === user?.id)

  const tabs: Array<{ key: TabType; label: string; icon: string }> = [
    { key: 'LEAGUE', label: 'League', icon: '🏆' },
    { key: 'WEEKLY', label: 'Weekly', icon: '📊' },
    { key: 'DAILY', label: 'Daily', icon: '📅' },
    { key: 'ALL_TIME', label: 'All Time', icon: '👑' },
  ]

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto pb-24">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
      </motion.div>

      {/* League Shield Section */}
      {leagueInfo && <LeagueShield leagueInfo={leagueInfo} />}

      {/* Tab Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="flex bg-muted/60 dark:bg-muted/30 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                playClick()
                setActiveTab(tab.key)
              }}
              className={`relative flex-1 py-2.5 px-1 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <AnimatePresence>
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-xs">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {top3.length >= 3 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-end justify-center gap-2 md:gap-4 py-4 md:py-8 px-2 relative"
        >
          {/* 2nd place */}
          <PodiumUser
            user={top3[1]}
            position={2}
            isCurrentUser={user?.id === top3[1].id}
          />
          {/* 1st place */}
          <PodiumUser
            user={top3[0]}
            position={1}
            isCurrentUser={user?.id === top3[0].id}
          />
          {/* 3rd place */}
          <PodiumUser
            user={top3[2]}
            position={3}
            isCurrentUser={user?.id === top3[2].id}
          />
        </motion.div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Not enough players yet. Be the first!</p>
        </div>
      )}

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div ref={listRef} className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {rest.map((entry, i) => (
            <UserRow
              key={entry.id}
              entry={entry}
              isCurrentUser={user?.id === entry.id}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Sticky current user row (when scrolled past) */}
      <AnimatePresence>
        {currentUserEntry && !top3.find((e) => e.id === user?.id) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-20 z-20 mt-2"
          >
            <Card className="rounded-xl border-0 shadow-lg ring-2 ring-primary/50 bg-primary/10 dark:bg-primary/15 backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-8 text-center shrink-0">
                  <span className="text-base font-bold text-primary">#{currentUserEntry.rank}</span>
                </div>
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10 ring-2 ring-primary">
                    <AvatarFallback className="bg-primary/20 text-sm font-bold text-primary">
                      {currentUserEntry.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  {currentUserEntry.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm truncate text-primary">{currentUserEntry.name}</p>
                    <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-3.5 rounded-full">
                      You
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">Lv.{currentUserEntry.level}</span>
                    <span className="text-xs">{LEAGUE_ICONS[currentUserEntry.league] || '🥉'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-sm">{currentUserEntry.xp.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-1">No rankings yet</h3>
          <p className="text-sm text-muted-foreground/70">
            Complete lessons to appear on the leaderboard!
          </p>
        </div>
      )}

      {/* League Rewards Card */}
      {leagueInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <RewardsCard rewards={leagueInfo.rewards} daysUntilEnd={leagueInfo.daysUntilEnd} />
        </motion.div>
      )}

      {/* Quick Stats */}
      {leagueInfo && (
        <QuickStats leagueInfo={leagueInfo} currentUserRank={currentUserRank} />
      )}

      {/* Motivational Footer */}
      {leagueInfo && (
        <MotivationalFooter rank={currentUserRank || leagueInfo.leagueRank} leagueSize={leagueInfo.leagueSize} />
      )}
    </div>
  )
}
