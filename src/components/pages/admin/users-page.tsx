'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, MoreHorizontal, Eye, EyeOff, Pencil, Ban, Trash2, Download, ChevronLeft, ChevronRight,
  Shield, ShieldOff, Crown, Heart, Users, Wifi, WifiOff, Activity, UserPlus, TrendingUp, AlertTriangle,
  Bell, BellRing, Send, RefreshCw, ChevronDown, Flame, Trophy, Zap, Clock, CheckCircle2,
  UserCheck, Mail, RotateCcw, Award, Target, Flag, Loader2, Copy, KeyRound, Gem, X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { PREMIUM_FEATURES, type PremiumFeatureKey } from '@/lib/premium'

// ==================== TYPES ====================

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
  gems: number
  xp: number
  streak: number
  longestStreak: number
  hearts: number
  maxHearts: number
  level: number
  isBanned: boolean
  isPremium: boolean
  premiumExpiresAt: string | null
  unlockedFeatures: string
  isOnline: boolean
  lastActiveAt: string
  league: string
  weeklyXp: number
  totalLessonsCompleted: number
  totalCoursesCompleted: number
  createdAt: string
  _count: { enrollments: number; lessonProgress: number; purchases: number; achievements: number }
}

interface UserDetail extends User {
  password?: string
  enrollments: { course: { id: string; title: string } }[]
  achievements: { achievement: { id: string; title: string; icon: string | null } }[]
  purchases: { shopItem: { id: string; title: string }; createdAt: string }[]
}

interface UserStats {
  totalUsers: number
  onlineNow: number
  activeToday: number
  activeThisWeek: number
  activeThisMonth: number
  inactiveUsers: number
  inactive7Days: number
  inactive14Days: number
  inactive30Days: number
  newUsersToday: number
  newUsersThisWeek: number
  byRole: Record<string, number>
  byLeague: Record<string, number>
  averageXp: number
  averageStreak: number
  premiumUsers: number
  recentActivity: Array<{
    name: string
    action: string
    entity: string
    entityId: string
    details: string | null
    timestamp: string
  }>
  topStreakHolders: Array<{
    id: string
    name: string
    email: string
    streak: number
    longestStreak: number
    xp: number
    level: number
    lastActiveAt: string
    isPremium: boolean
  }>
  topXpEarners: Array<{
    id: string
    name: string
    email: string
    xp: number
    level: number
    streak: number
    lastActiveAt: string
    isPremium: boolean
  }>
  topConsistentUsers: Array<{
    id: string
    name: string
    email: string
    lessonsCompleted: number
    xp: number
    streak: number
    lastActiveAt: string
  }>
}

interface InactivityData {
  intervals: number[]
  totalEligible: number
  newEligible: number
  byInterval: Record<string, { total: number; new: number; alreadySent: number; users: Array<{ userId: string; userName: string; userEmail: string; hoursSinceActive: number; eligibleInterval: number; alreadySent: boolean }> }>
}

// ==================== CONSTANTS ====================

const LEAGUES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'SAPPHIRE', 'RUBY', 'OBSIDIAN'] as const

const LEAGUE_CONFIG: Record<string, { emoji: string; color: string; bgColor: string; xpRequired: number }> = {
  BRONZE: { emoji: '🥉', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', xpRequired: 0 },
  SILVER: { emoji: '🥈', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800/50', xpRequired: 500 },
  GOLD: { emoji: '🥇', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', xpRequired: 1500 },
  PLATINUM: { emoji: '💎', color: 'text-cyan-500', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', xpRequired: 3500 },
  DIAMOND: { emoji: '💠', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', xpRequired: 7000 },
  SAPPHIRE: { emoji: '🔮', color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', xpRequired: 12000 },
  RUBY: { emoji: '❤️‍🔥', color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900/30', xpRequired: 20000 },
  OBSIDIAN: { emoji: '🪨', color: 'text-gray-800 dark:text-gray-200', bgColor: 'bg-gray-200 dark:bg-gray-700', xpRequired: 35000 },
}

// ==================== HELPERS ====================

function getTimeSince(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffWk = Math.floor(diffDay / 7)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWk < 4) return `${diffWk}w ago`
  return `${Math.floor(diffDay / 30)}mo ago`
}

function getStatusInfo(user: User): { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (user.isBanned) return { label: 'Banned', color: 'text-red-600', variant: 'destructive' }
  if (user.isOnline) return { label: 'Online', color: 'text-green-600', variant: 'default' }
  if (!user.lastActiveAt) return { label: 'Never Active', color: 'text-gray-500', variant: 'outline' }
  const diffHr = (Date.now() - new Date(user.lastActiveAt).getTime()) / 3600000
  if (diffHr < 1) return { label: 'Active <1h', color: 'text-blue-600', variant: 'default' }
  if (diffHr < 24) return { label: 'Active <24h', color: 'text-gray-600', variant: 'secondary' }
  const diffDay = diffHr / 24
  if (diffDay < 7) return { label: `Away ${Math.floor(diffDay)}d`, color: 'text-orange-600', variant: 'outline' }
  return { label: `Inactive ${Math.floor(diffDay)}d+`, color: 'text-red-600', variant: 'destructive' }
}

function formatDurationHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  const rem = hours % 24
  return rem === 0 ? `${days}d` : `${days}d ${rem}h`
}

function AwardUserRow({ user, type, rank }: { 
  user: any, 
  type: 'streak' | 'xp' | 'lessons',
  rank: number 
}) {
  const [showAward, setShowAward] = useState(false)
  const [awardAmount, setAwardAmount] = useState('50')
  const [awarding, setAwarding] = useState(false)

  const handleAward = async (gems: number) => {
    setAwarding(true)
    try {
      const res = await fetch('/api/admin/users/adjust-gems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: gems,
          action: 'add',
          reason: `Awarded for being top ${type}`
        }),
      })
      if (res.ok) {
        toast.success(`Awarded ${gems} gems to ${user.name}`)
        setShowAward(false)
      } else {
        toast.error('Failed to award gems')
      }
    } catch {
      toast.error('Failed to award gems')
    } finally {
      setAwarding(false)
    }
  }

  const getValue = () => {
    if (type === 'streak') return user.streak
    if (type === 'xp') return user.xp?.toLocaleString() || '0'
    if (type === 'lessons') return user.lessonsCompleted
  }

  const getIcon = () => {
    if (type === 'streak') return <Flame className="w-3 h-3 text-orange-500" />
    if (type === 'xp') return <Zap className="w-3 h-3 text-yellow-500" />
    if (type === 'lessons') return <Activity className="w-3 h-3 text-green-500" />
  }

  return (
    <div className="relative flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted-foreground w-4">{rank}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate max-w-[120px]">{user.name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {getIcon()} {getValue()}
          </p>
        </div>
      </div>
      <Button 
        size="sm" 
        variant="ghost" 
        className="h-7 px-2 text-xs"
        onClick={() => setShowAward(!showAward)}
      >
        <Gem className="w-3 h-3 mr-1 text-green-500" /> Award
      </Button>
      
      {showAward && (
        <div className="absolute z-50 top-full right-0 mt-1 p-3 bg-card border rounded-lg shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Award Gems</span>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowAward(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex gap-1 mb-2">
            {[25, 50, 100, 200].map(amount => (
              <Button
                key={amount}
                size="sm"
                variant="outline"
                className="flex-1 h-8"
                onClick={() => handleAward(amount)}
                disabled={awarding}
              >
                +{amount}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Custom"
              value={awardAmount}
              onChange={(e) => setAwardAmount(e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={() => handleAward(parseInt(awardAmount) || 0)}
              disabled={awarding || !awardAmount}
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== COMPONENT ====================

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [leagueFilter, setLeagueFilter] = useState('')
  const [premiumFilter, setPremiumFilter] = useState('')
  const [sortBy, setSortBy] = useState('')

  // Stats
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsLastRefresh, setStatsLastRefresh] = useState<Date>(new Date())
  const statsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Inactivity
  const [inactivityData, setInactivityData] = useState<InactivityData | null>(null)
  const [inactivityLoading, setInactivityLoading] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)

  // Dialogs
  const [viewUser, setViewUser] = useState<UserDetail | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [banUser, setBanUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [flagUser, setFlagUser] = useState<User | null>(null)
  const [restrictUser, setRestrictUser] = useState<User | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)
  const [inactivityDialogOpen, setInactivityDialogOpen] = useState(false)

  // Reset password dialog state
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState(false)
  const [showPasswordHash, setShowPasswordHash] = useState(false)

  // Flag & Restrict form state
  const [flagReason, setFlagReason] = useState('')
  const [flagCustomReason, setFlagCustomReason] = useState('')
  const [restrictReason, setRestrictReason] = useState('')
  const [flagSubmitting, setFlagSubmitting] = useState(false)
  const [restrictSubmitting, setRestrictSubmitting] = useState(false)

  const FLAG_PRESET_REASONS = ['Spam', 'Inappropriate behavior', 'Suspicious activity', 'Violation of terms', 'Other']

  // Edit form
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editGems, setEditGems] = useState('')
  const [editXP, setEditXP] = useState('')
  const [editIsPremium, setEditIsPremium] = useState(false)
  const [editPremiumExpiresAt, setEditPremiumExpiresAt] = useState('')
  const [editUnlockedFeatures, setEditUnlockedFeatures] = useState<string[]>([])
  const [editStreak, setEditStreak] = useState('')
  const [editHearts, setEditHearts] = useState('')
  const [editMaxHearts, setEditMaxHearts] = useState('')
  const [editLongestStreak, setEditLongestStreak] = useState('')
  const [editLeague, setEditLeague] = useState('')

  // ==================== DATA FETCHING ====================

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      }
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setStatsLastRefresh(new Date())
      }
    } catch {
      // silently fail for stats
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    fetchStats()
    statsTimerRef.current = setInterval(fetchStats, 120000)
    return () => {
      if (statsTimerRef.current) clearInterval(statsTimerRef.current)
    }
  }, [fetchStats])

  // Client-side filtering for league, premium, sort
  const filteredUsers = users.filter((u) => {
    if (leagueFilter && u.league !== leagueFilter) return false
    if (premiumFilter === 'premium' && !u.isPremium) return false
    if (premiumFilter === 'free' && u.isPremium) return false
    return true
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'xp': return b.xp - a.xp
      case 'level': return b.level - a.level
      case 'streak': return b.streak - a.streak
      case 'lastActive': return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      case 'joined': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default: return 0
    }
  })

  // ==================== HANDLERS ====================

  const openEdit = (user: User) => {
    setEditUser(user)
    setEditName(user.name)
    setEditRole(user.role)
    setEditGems(user.gems.toString())
    setEditXP(user.xp.toString())
    setEditIsPremium(user.isPremium)
    setEditPremiumExpiresAt(user.premiumExpiresAt ? user.premiumExpiresAt.split('T')[0] : '')
    try { setEditUnlockedFeatures(JSON.parse(user.unlockedFeatures || '[]')) } catch { setEditUnlockedFeatures([]) }
    setEditStreak(user.streak.toString())
    setEditHearts(user.hearts.toString())
    setEditMaxHearts(user.maxHearts.toString())
    setEditLongestStreak(user.longestStreak.toString())
    setEditLeague(user.league)
  }

  const handleSaveEdit = async () => {
    if (!editUser) return
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          gems: parseInt(editGems) || 0,
          xp: parseInt(editXP) || 0,
          isPremium: editIsPremium,
          premiumExpiresAt: editPremiumExpiresAt ? new Date(editPremiumExpiresAt).toISOString() : null,
          unlockedFeatures: JSON.stringify(editUnlockedFeatures),
          streak: parseInt(editStreak) || 0,
          hearts: parseInt(editHearts) || 0,
          maxHearts: parseInt(editMaxHearts) || 5,
          longestStreak: parseInt(editLongestStreak) || 0,
        }),
      })
      if (res.ok) {
        toast.success('User updated successfully')
        setEditUser(null)
        fetchUsers()
        fetchStats()
      } else {
        toast.error('Failed to update user')
      }
    } catch {
      toast.error('Failed to update user')
    }
  }

  const handleBan = async () => {
    if (!banUser) return
    try {
      const res = await fetch(`/api/admin/users/${banUser.id}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !banUser.isBanned }),
      })
      if (res.ok) {
        toast.success(banUser.isBanned ? 'User unbanned' : 'User banned')
        setBanUser(null)
        fetchUsers()
        fetchStats()
      }
    } catch {
      toast.error('Failed to update ban status')
    }
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    try {
      const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('User deleted')
        setDeleteUser(null)
        fetchUsers()
        fetchStats()
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleViewUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setViewUser(data.user)
      }
    } catch {
      toast.error('Failed to fetch user details')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkBan = async () => {
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/admin/users/${id}/ban`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isBanned: true }),
          })
        )
      )
      toast.success(`${selectedIds.length} users banned`)
      setSelectedIds([])
      fetchUsers()
      fetchStats()
    } catch {
      toast.error('Bulk ban failed')
    }
  }

  const handleQuickAction = async (userId: string, action: string) => {
    try {
      if (action === 'sendReminder') {
        const res = await fetch('/api/push/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: "We miss you! Come back to SkoolarPlay",
            message: "Your learning journey awaits! Continue where you left off.",
            userIds: [userId],
          }),
        })
        if (res.ok) {
          toast.success('Reminder sent to user')
        }
      } else if (action === 'resetStreak') {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streak: 0 }),
        })
        if (res.ok) {
          toast.success('Streak reset')
          fetchUsers()
        }
      } else if (action === 'promoteLeague') {
        if (!viewUser) return
        const currentIdx = LEAGUES.indexOf(viewUser.league as typeof LEAGUES[number])
        const nextIdx = Math.min(currentIdx + 1, LEAGUES.length - 1)
        if (currentIdx === LEAGUES.length - 1) {
          toast.info('Already at max league')
          return
        }
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ league: LEAGUES[nextIdx] }),
        })
        if (res.ok) {
          toast.success(`Promoted to ${LEAGUES[nextIdx]}`)
          setViewUser({ ...viewUser, league: LEAGUES[nextIdx] })
          fetchUsers()
        }
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const isUserRestricted = (user: User) => user.unlockedFeatures === '[]'

  const handleFlag = async () => {
    if (!flagUser) return
    const reason = flagReason === 'Other' ? flagCustomReason.trim() : flagReason
    if (!reason) {
      toast.error('Please provide a reason for flagging')
      return
    }
    setFlagSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${flagUser.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (res.ok) {
        toast.success(`User ${flagUser.name} flagged successfully`)
        setFlagUser(null)
        setFlagReason('')
        setFlagCustomReason('')
      } else {
        toast.error('Failed to flag user')
      }
    } catch {
      toast.error('Failed to flag user')
    } finally {
      setFlagSubmitting(false)
    }
  }

  const handleRestrict = async () => {
    if (!restrictUser) return
    const currentlyRestricted = isUserRestricted(restrictUser)
    setRestrictSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${restrictUser.id}/restrict`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRestricted: !currentlyRestricted, restrictReason: restrictReason || undefined }),
      })
      if (res.ok) {
        toast.success(currentlyRestricted ? `User ${restrictUser.name} unrestricted` : `User ${restrictUser.name} restricted`)
        setRestrictUser(null)
        setRestrictReason('')
        fetchUsers()
      } else {
        toast.error('Failed to update restriction')
      }
    } catch {
      toast.error('Failed to update restriction')
    } finally {
      setRestrictSubmitting(false)
    }
  }

  const handleAdminResetPassword = async () => {
    if (!resetPasswordUser || !resetNewPassword) return
    if (resetNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setResetPasswordSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetNewPassword }),
      })
      if (res.ok) {
        toast.success(`Password for ${resetPasswordUser.name} has been reset`)
        setResetPasswordUser(null)
        setResetNewPassword('')
        // Refresh user details
        handleViewUser(resetPasswordUser.id)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setResetPasswordSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'XP', 'Gems', 'Streak', 'Level', 'League', 'Premium', 'Online', 'Banned', 'Last Active', 'Joined']
    const rows = filteredUsers.map(u => [
      u.name, u.email, u.role, u.xp, u.gems, u.streak, u.level, u.league,
      u.isPremium ? 'Yes' : 'No', u.isOnline ? 'Yes' : 'No',
      u.isBanned ? 'Yes' : 'No', u.lastActiveAt, u.createdAt,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const fetchInactivityPreview = async () => {
    setInactivityLoading(true)
    try {
      const res = await fetch('/api/admin/users/inactivity-notify')
      if (res.ok) {
        const data = await res.json()
        setInactivityData(data)
      }
    } catch {
      toast.error('Failed to fetch inactivity data')
    } finally {
      setInactivityLoading(false)
    }
  }

  const handleSendReminders = async (intervalHours?: number, sendAll?: boolean) => {
    setSendingReminders(true)
    try {
      const res = await fetch('/api/admin/users/inactivity-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalHours, sendAll }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(data.message || `${data.notificationsCreated} reminders sent`)
        fetchInactivityPreview()
      } else {
        toast.error('Failed to send reminders')
      }
    } catch {
      toast.error('Failed to send reminders')
    } finally {
      setSendingReminders(false)
    }
  }

  // ==================== RENDER ====================

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ====== STATS DASHBOARD ====== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Monitor, manage, and engage your platform users
                {!statsLoading && statsLastRefresh && (
                  <span className="ml-2 text-xs"> · Updated {getTimeSince(statsLastRefresh.toISOString())}</span>
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={statsLoading} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Total Users */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                      <p className="text-2xl font-bold mt-1">{stats?.totalUsers ?? '-'}</p>
                      {stats && (
                        <p className="text-xs text-green-600 flex items-center gap-0.5 mt-1">
                          <UserPlus className="w-3 h-3" /> +{stats.newUsersToday} today
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Online Now */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        Online Now
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                      </p>
                      <p className="text-2xl font-bold mt-1 text-green-600">{stats?.onlineNow ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((stats.onlineNow / stats.totalUsers) * 100)}% of users
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Wifi className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Today */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Active Today</p>
                      <p className="text-2xl font-bold mt-1">{stats?.activeToday ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((stats.activeToday / stats.totalUsers) * 100)}% of total
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Activity className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active This Week */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Active This Week</p>
                      <p className="text-2xl font-bold mt-1">{stats?.activeThisWeek ?? '-'}</p>
                      {stats && (
                        <p className="text-xs text-blue-600 flex items-center gap-0.5 mt-1">
                          <TrendingUp className="w-3 h-3" /> +{stats.newUsersThisWeek} new
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                      <Flame className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Users */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Premium Users</p>
                      <p className="text-2xl font-bold mt-1 text-amber-600">{stats?.premiumUsers ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% of total
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Crown className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* New This Week */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">New This Week</p>
                      <p className="text-2xl font-bold mt-1">{stats?.newUsersThisWeek ?? '-'}</p>
                      {stats && stats.activeToday > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.newUsersToday} joined today
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                      <UserPlus className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Average Streak */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Avg Streak</p>
                      <p className="text-2xl font-bold mt-1">{stats?.averageStreak ?? '-'}</p>
                      {stats && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg XP: {stats.averageXp.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inactive 7-13 Days */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Inactive 7-13d</p>
                      <p className="text-2xl font-bold mt-1 text-orange-600">{stats?.inactive7Days ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-orange-500">
                          {Math.round((stats.inactive7Days / stats.totalUsers) * 100)}% of users
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inactive 14-29 Days */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Inactive 14-29d</p>
                      <p className="text-2xl font-bold mt-1 text-amber-600">{stats?.inactive14Days ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-amber-500">
                          {Math.round((stats.inactive14Days / stats.totalUsers) * 100)}% of users
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inactive 30+ Days */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Inactive 30d+</p>
                      <p className="text-2xl font-bold mt-1 text-red-600">{stats?.inactive30Days ?? '-'}</p>
                      {stats && stats.totalUsers > 0 && (
                        <p className="text-xs text-red-500">
                          {Math.round((stats.inactive30Days / stats.totalUsers) * 100)}% of users
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <WifiOff className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* ====== TOP USERS SECTION ====== */}
        {stats && (stats.topStreakHolders?.length > 0 || stats.topXpEarners?.length > 0 || stats.topConsistentUsers?.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Top Performers - Award Your Best Learners
                </CardTitle>
                <CardDescription>Recognize and reward your most dedicated users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Top Streak Holders */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" /> Top Streaks
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {stats.topStreakHolders?.slice(0, 5).map((user, i) => (
                        <AwardUserRow 
                          key={user.id} 
                          user={user} 
                          type="streak" 
                          rank={i + 1} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Top XP Earners */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" /> Top XP
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {stats.topXpEarners?.slice(0, 5).map((user, i) => (
                        <AwardUserRow 
                          key={user.id} 
                          user={user} 
                          type="xp" 
                          rank={i + 1} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Most Consistent Users */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-500" /> Most Lessons
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {stats.topConsistentUsers?.slice(0, 5).map((user, i) => (
                        <AwardUserRow 
                          key={user.id} 
                          user={user} 
                          type="lessons" 
                          rank={i + 1} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ====== REAL-TIME ACTIVITY MONITOR ====== */}
        {stats && stats.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    Recent Activity
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">Auto-refreshing</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-40 overflow-y-auto">
                  {stats.recentActivity.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          <span className="text-muted-foreground">{activity.name}</span> {activity.action.toLowerCase()}{' '}
                          <span className="text-muted-foreground">{activity.entity}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{getTimeSince(activity.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ====== FILTER BAR ====== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1) }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1) }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={leagueFilter} onValueChange={(v) => { setLeagueFilter(v === 'all' ? '' : v) }}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="All Leagues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leagues</SelectItem>
                      {LEAGUES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {LEAGUE_CONFIG[l]?.emoji} {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={premiumFilter} onValueChange={(v) => { setPremiumFilter(v === 'all' ? '' : v) }}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="xp">XP</SelectItem>
                      <SelectItem value="level">Level</SelectItem>
                      <SelectItem value="streak">Streak</SelectItem>
                      <SelectItem value="lastActive">Last Active</SelectItem>
                      <SelectItem value="joined">Joined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {selecting && selectedIds.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                      <Button size="sm" variant="destructive" onClick={handleBulkBan} className="gap-1">
                        <Ban className="w-3 h-3" /> Ban
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
                    </motion.div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelecting(!selecting); setSelectedIds([]) }}
                    className="gap-1"
                  >
                    {selecting ? 'Cancel' : 'Select'}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{filteredUsers.length} users</span>
                  <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== USERS TABLE ====== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      {selecting && (
                        <TableHead className="w-10">
                          <Checkbox
                            checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                            onCheckedChange={(checked) => {
                              setSelectedIds(checked ? filteredUsers.map(u => u.id) : [])
                            }}
                          />
                        </TableHead>
                      )}
                      <TableHead className="w-10" />
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden lg:table-cell">League</TableHead>
                      <TableHead className="hidden lg:table-cell">XP</TableHead>
                      <TableHead className="hidden sm:table-cell">Streak</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden xl:table-cell">Last Active</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={12}>
                            <div className="h-10 bg-muted animate-pulse rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, i) => {
                        const statusInfo = getStatusInfo(user)
                        const leagueConf = LEAGUE_CONFIG[user.league]
                        return (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleViewUser(user.id)}
                          >
                            {selecting && (
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.includes(user.id)}
                                  onCheckedChange={() => toggleSelect(user.id)}
                                />
                              </TableCell>
                            )}
                            {/* Online indicator */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {user.isOnline ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="relative flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Online</TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="relative flex h-3 w-3">
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300 dark:bg-gray-600" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Offline · {getTimeSince(user.lastActiveAt)}</TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                            {/* Name */}
                            <TableCell>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium truncate max-w-[150px]">{user.name}</span>
                                {user.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                                {isUserRestricted(user) && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-900/20">RESTRICTED</Badge>
                                )}
                              </div>
                            </TableCell>
                            {/* Email */}
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm truncate max-w-[200px]">
                              {user.email}
                            </TableCell>
                            {/* Role */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'SUPPORT' ? 'outline' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                            </TableCell>
                            {/* League */}
                            <TableCell className="hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                              {leagueConf ? (
                                <Badge variant="outline" className={`text-xs gap-1 ${leagueConf.bgColor} ${leagueConf.color} border-0`}>
                                  {leagueConf.emoji} {user.league}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">{user.league}</span>
                              )}
                            </TableCell>
                            {/* XP */}
                            <TableCell className="hidden lg:table-cell text-sm">{user.xp.toLocaleString()}</TableCell>
                            {/* Streak */}
                            <TableCell className="hidden sm:table-cell text-sm">
                              <span className="flex items-center gap-1">🔥 {user.streak}</span>
                            </TableCell>
                            {/* Status */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Badge variant={statusInfo.variant} className={`text-xs ${statusInfo.variant === 'default' || statusInfo.variant === 'destructive' ? '' : statusInfo.color}`}>
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            {/* Last Active */}
                            <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                              {getTimeSince(user.lastActiveAt)}
                            </TableCell>
                            {/* Actions */}
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEdit(user)}>
                                    <Pencil className="w-4 h-4 mr-2" /> Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => { setFlagUser(user); setFlagReason(''); setFlagCustomReason('') }} className="text-amber-600">
                                    <Flag className="w-4 h-4 mr-2" /> Flag User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setRestrictUser(user); setRestrictReason('') }} className={isUserRestricted(user) ? 'text-primary' : 'text-orange-600'}>
                                    <ShieldOff className="w-4 h-4 mr-2" />
                                    {isUserRestricted(user) ? 'Unrestrict User' : 'Restrict User'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setBanUser(user)} className={user.isBanned ? 'text-primary' : 'text-destructive'}>
                                    {user.isBanned ? <ShieldOff className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                    {user.isBanned ? 'Unban User' : 'Ban User'}
                                  </DropdownMenuItem>
                                  {user.role !== 'ADMIN' && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => setDeleteUser(user)} className="text-destructive">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== INACTIVITY NOTIFICATIONS PANEL ====== */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-amber-200 dark:border-amber-800/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-500" />
                    Inactivity Reminders
                  </CardTitle>
                  <CardDescription>
                    Re-engage users who haven&apos;t been active with push notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchInactivityPreview}
                  disabled={inactivityLoading}
                  className="gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {inactivityLoading ? 'Loading...' : 'Preview Reminders'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSendReminders(undefined, true)}
                  disabled={sendingReminders}
                  className="gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingReminders ? 'Sending...' : 'Send All Reminders Now'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInactivityDialogOpen(true)}
                  className="gap-1.5"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                  Send by Interval
                </Button>
              </div>

              {/* Preview results */}
              <AnimatePresence>
                {inactivityData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Eligible Users Summary</h4>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">{inactivityData.newEligible} new</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">{inactivityData.totalEligible} total</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(inactivityData.byInterval).map(([key, data]) => (
                          <div key={key} className="rounded-md border p-2.5 text-center">
                            <p className="text-xs font-medium text-muted-foreground">{formatDurationHours(parseInt(key))}</p>
                            <p className="text-lg font-bold">{data.new}</p>
                            <p className="text-[10px] text-muted-foreground">{data.total} total</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ====== VIEW USER DIALOG ====== */}
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {viewUser?.name}
                {viewUser?.isOnline && (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>
                )}
                {viewUser?.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
              </DialogTitle>
              <DialogDescription>{viewUser?.email}</DialogDescription>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-4">
                {/* Status & Online */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusInfo(viewUser).variant}>{getStatusInfo(viewUser).label}</Badge>
                  <Badge variant="outline" className="text-xs">
                    {LEAGUE_CONFIG[viewUser.league]?.emoji} {viewUser.league}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last seen {getTimeSince(viewUser.lastActiveAt)}
                  </span>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge variant={viewUser.role === 'ADMIN' ? 'default' : viewUser.role === 'SUPPORT' ? 'outline' : 'secondary'}>{viewUser.role}</Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="font-bold text-lg">{viewUser.level}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total XP</p>
                    <p className="font-bold">{viewUser.xp.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Weekly XP</p>
                    <p className="font-bold text-blue-600">{viewUser.weeklyXp.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Gems</p>
                    <p className="font-bold">{viewUser.gems.toLocaleString()} 💎</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Streak</p>
                    <p className="font-bold">🔥 {viewUser.streak} (Best: {viewUser.longestStreak})</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Hearts</p>
                    <p className="font-bold">{viewUser.hearts}/{viewUser.maxHearts} <Heart className="w-3 h-3 inline text-red-500" /></p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Premium</p>
                    <Badge className={viewUser.isPremium ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : ''} variant={viewUser.isPremium ? 'default' : 'outline'}>
                      {viewUser.isPremium ? <><Crown className="w-3 h-3 mr-1" />Premium</> : 'Free'}
                    </Badge>
                  </div>
                </div>

                {/* League Progress */}
                {viewUser.league && LEAGUE_CONFIG[viewUser.league] && (
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        League Progress
                      </h4>
                      <Badge variant="outline" className="gap-1">
                        {LEAGUE_CONFIG[viewUser.league]?.emoji} {viewUser.league}
                      </Badge>
                    </div>
                    {(() => {
                      const currentIdx = LEAGUES.indexOf(viewUser.league as typeof LEAGUES[number])
                      const currentLeague = LEAGUES[currentIdx]
                      const nextLeague = currentIdx < LEAGUES.length - 1 ? LEAGUES[currentIdx + 1] : null
                      const currentXpReq = LEAGUE_CONFIG[currentLeague]?.xpRequired || 0
                      const nextXpReq = nextLeague ? LEAGUE_CONFIG[nextLeague]?.xpRequired || 0 : currentXpReq
                      const progress = nextLeague
                        ? Math.min(100, Math.round(((viewUser.xp - currentXpReq) / (nextXpReq - currentXpReq)) * 100))
                        : 100
                      return (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{LEAGUE_CONFIG[currentLeague]?.emoji} {currentLeague}</span>
                            <span>{viewUser.xp.toLocaleString()} XP</span>
                            {nextLeague && <span>{LEAGUE_CONFIG[nextLeague]?.emoji} {nextLeague}</span>}
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {nextLeague ? `${nextXpReq - viewUser.xp} XP to ${nextLeague}` : 'Max league reached!'}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Activity Stats */}
                <div className="p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4" />
                    Activity
                  </h4>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{viewUser.totalLessonsCompleted}</p>
                      <p className="text-[10px] text-muted-foreground">Lessons Done</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{viewUser.totalCoursesCompleted}</p>
                      <p className="text-[10px] text-muted-foreground">Courses Done</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{viewUser._count.enrollments}</p>
                      <p className="text-[10px] text-muted-foreground">Enrolled</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{viewUser._count.achievements}</p>
                      <p className="text-[10px] text-muted-foreground">Badges</p>
                    </div>
                  </div>

                  {/* Simple activity heatmap */}
                  <div className="mt-3 p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">Last 7 days activity (lessons completed)</p>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date()
                        date.setDate(date.getDate() - (6 - i))
                        const dayName = date.toLocaleDateString('en', { weekday: 'short' })
                        // Simulated activity pattern based on user data
                        const activity = viewUser.totalLessonsCompleted > 0
                          ? Math.min(5, Math.floor((viewUser.totalLessonsCompleted / 20) * (Math.random() * 0.7 + 0.3)))
                          : 0
                        const colors = ['bg-muted', 'bg-green-200 dark:bg-green-900', 'bg-green-300 dark:bg-green-800', 'bg-green-400 dark:bg-green-700', 'bg-green-500 dark:bg-green-600', 'bg-green-600 dark:bg-green-500']
                        return (
                          <div key={i} className="flex-1 text-center">
                            <div className={`h-6 rounded-sm ${colors[activity]}`} />
                            <p className="text-[9px] text-muted-foreground mt-1">{dayName}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Premium Info */}
                {viewUser.isPremium && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {viewUser.premiumExpiresAt
                        ? `Premium expires ${new Date(viewUser.premiumExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : 'Lifetime Premium'}
                    </p>
                    {(() => {
                      try {
                        const features = JSON.parse(viewUser.unlockedFeatures || '[]')
                        if (features.length > 0) return <p className="text-xs text-muted-foreground mt-1">{features.length} features unlocked</p>
                      } catch {}
                      return null
                    })()}
                  </div>
                )}

                <Separator />

                {/* Security Section */}
                <div className="p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <KeyRound className="w-4 h-4" />
                    Security
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Hashed Password</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted p-2 rounded-md font-mono truncate max-w-[300px]">
                          {showPasswordHash && viewUser.password
                            ? viewUser.password
                            : '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={() => setShowPasswordHash(!showPasswordHash)}
                          title={showPasswordHash ? 'Hide' : 'Show'}
                        >
                          {showPasswordHash ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        {viewUser.password && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => copyToClipboard(viewUser.password!)}
                            title="Copy"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Account Created</p>
                        <p className="text-xs font-medium">
                          {new Date(viewUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/50">
                        <p className="text-[10px] text-muted-foreground">Last Active</p>
                        <p className="text-xs font-medium">{getTimeSince(viewUser.lastActiveAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => {
                        setResetPasswordUser(viewUser)
                        setResetNewPassword('')
                      }}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset User Password
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleQuickAction(viewUser.id, 'sendReminder')}
                    >
                      <Mail className="w-3.5 h-3.5" /> Send Reminder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleQuickAction(viewUser.id, 'resetStreak')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Streak
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleQuickAction(viewUser.id, 'promoteLeague')}
                    >
                      <Award className="w-3.5 h-3.5" /> Promote League
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => { setViewUser(null); openEdit(viewUser) }}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ====== EDIT USER DIALOG ====== */}
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User: {editUser?.name}</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>League</Label>
                <Select value={editLeague} onValueChange={setEditLeague}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAGUES.map((l) => (
                      <SelectItem key={l} value={l}>{LEAGUE_CONFIG[l]?.emoji} {l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Premium Settings */}
              <div>
                <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Premium Settings
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-is-premium">Premium User</Label>
                    <Switch id="edit-is-premium" checked={editIsPremium} onCheckedChange={setEditIsPremium} />
                  </div>
                  <div className="space-y-2">
                    <Label>Premium Expiry (leave empty for lifetime)</Label>
                    <Input type="date" value={editPremiumExpiresAt} onChange={(e) => setEditPremiumExpiresAt(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Unlocked Premium Features</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/50 max-h-40 overflow-y-auto">
                      {(Object.keys(PREMIUM_FEATURES) as PremiumFeatureKey[]).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`feat-${key}`}
                            checked={editUnlockedFeatures.includes(key)}
                            onCheckedChange={(checked) => {
                              setEditUnlockedFeatures(prev =>
                                checked ? [...prev, key] : prev.filter(f => f !== key)
                              )
                            }}
                          />
                          <label htmlFor={`feat-${key}`} className="text-xs cursor-pointer leading-tight">
                            {PREMIUM_FEATURES[key].name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Game Stats */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Game Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Gems</Label>
                    <Input type="number" value={editGems} onChange={(e) => setEditGems(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>XP</Label>
                    <Input type="number" value={editXP} onChange={(e) => setEditXP(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Streak</Label>
                    <Input type="number" value={editStreak} onChange={(e) => setEditStreak(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Longest Streak</Label>
                    <Input type="number" value={editLongestStreak} onChange={(e) => setEditLongestStreak(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hearts</Label>
                    <Input type="number" value={editHearts} onChange={(e) => setEditHearts(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Hearts</Label>
                    <Input type="number" value={editMaxHearts} onChange={(e) => setEditMaxHearts(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== BAN CONFIRMATION ====== */}
        <Dialog open={!!banUser} onOpenChange={() => setBanUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{banUser?.isBanned ? 'Unban User' : 'Ban User'}</DialogTitle>
              <DialogDescription>
                Are you sure you want to {banUser?.isBanned ? 'unban' : 'ban'} <strong>{banUser?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBanUser(null)}>Cancel</Button>
              <Button variant={banUser?.isBanned ? 'default' : 'destructive'} onClick={handleBan}>
                {banUser?.isBanned ? 'Unban' : 'Ban'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== DELETE CONFIRMATION ====== */}
        <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete <strong>{deleteUser?.name}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== FLAG USER DIALOG ====== */}
        <Dialog open={!!flagUser} onOpenChange={(open) => { if (!open) { setFlagUser(null); setFlagReason(''); setFlagCustomReason('') } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-500" />
                Flag User: {flagUser?.name}
              </DialogTitle>
              <DialogDescription>
                Flag this user for review. The user will be notified.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Reason for flagging</Label>
                <div className="flex flex-wrap gap-2">
                  {FLAG_PRESET_REASONS.map((reason) => (
                    <Badge
                      key={reason}
                      variant={flagReason === reason ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFlagReason(reason)}
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
              {flagReason === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label>Custom reason</Label>
                  <Input
                    value={flagCustomReason}
                    onChange={(e) => setFlagCustomReason(e.target.value)}
                    placeholder="Enter the reason for flagging..."
                  />
                </motion.div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setFlagUser(null); setFlagReason(''); setFlagCustomReason('') }}>Cancel</Button>
              <Button
                onClick={handleFlag}
                disabled={flagSubmitting || (flagReason === 'Other' && !flagCustomReason.trim())}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {flagSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Flag className="w-4 h-4 mr-2" />}
                Flag User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== RESTRICT USER DIALOG ====== */}
        <Dialog open={!!restrictUser} onOpenChange={(open) => { if (!open) { setRestrictUser(null); setRestrictReason('') } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldOff className="w-5 h-5 text-orange-500" />
                {restrictUser && isUserRestricted(restrictUser) ? 'Unrestrict User' : 'Restrict User'}: {restrictUser?.name}
              </DialogTitle>
              <DialogDescription>
                {restrictUser && isUserRestricted(restrictUser)
                  ? 'Remove all restrictions from this user. They will regain access to all features.'
                  : 'Restrict this user by revoking all premium features. They will be notified.'}
              </DialogDescription>
            </DialogHeader>
            {!(restrictUser && isUserRestricted(restrictUser)) && (
              <div className="space-y-2">
                <Label>Reason for restriction (optional)</Label>
                <Input
                  value={restrictReason}
                  onChange={(e) => setRestrictReason(e.target.value)}
                  placeholder="e.g., Policy violation, suspicious activity..."
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setRestrictUser(null); setRestrictReason('') }}>Cancel</Button>
              <Button
                variant={restrictUser && isUserRestricted(restrictUser) ? 'default' : 'destructive'}
                onClick={handleRestrict}
                disabled={restrictSubmitting}
              >
                {restrictSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldOff className="w-4 h-4 mr-2" />}
                {restrictUser && isUserRestricted(restrictUser) ? 'Unrestrict' : 'Restrict'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ====== INACTIVITY INTERVAL DIALOG ====== */}
        <Dialog open={inactivityDialogOpen} onOpenChange={setInactivityDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Send Reminders by Interval
              </DialogTitle>
              <DialogDescription>
                Choose a specific inactivity interval to send reminders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {inactivityData ? (
                Object.entries(inactivityData.byInterval).map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">After {formatDurationHours(parseInt(key))} of inactivity</p>
                      <p className="text-xs text-muted-foreground">
                        {data.new} new eligible · {data.total} total · {data.alreadySent} already sent
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={data.new === 0 || sendingReminders}
                      onClick={() => {
                        handleSendReminders(parseInt(key))
                        setInactivityDialogOpen(false)
                      }}
                      className="gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" /> Send
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Click &quot;Preview Reminders&quot; first to see interval data</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ====== RESET PASSWORD DIALOG ====== */}
        <Dialog open={!!resetPasswordUser} onOpenChange={(open) => { if (!open) setResetPasswordUser(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-destructive" />
                Reset Password for {resetPasswordUser?.name}
              </DialogTitle>
              <DialogDescription>
                This will permanently change the user&apos;s password. They will need to use the new password to log in.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-reset-password">New Password</Label>
                <Input
                  id="admin-reset-password"
                  type="text"
                  placeholder="Min 6 characters"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="font-mono"
                />
                {resetNewPassword && resetNewPassword.length < 6 && (
                  <p className="text-xs text-destructive">Must be at least 6 characters</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ The user <span className="font-medium">{resetPasswordUser?.name}</span> ({resetPasswordUser?.email}) will be logged out and will need to use the new password.
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={resetPasswordSubmitting || resetNewPassword.length < 6}
                  onClick={handleAdminResetPassword}
                >
                  {resetPasswordSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
