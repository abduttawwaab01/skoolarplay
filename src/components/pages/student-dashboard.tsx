'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame,
  Zap,
  Gem,
  Heart,
  Play,
  ChevronRight,
  Trophy,
  Star,
  BookOpen,
  Sparkles,
  Clock,
  Target,
  Globe,
  Beaker,
  Palette,
  Briefcase,
  Code2,
  GraduationCap,
  BarChart3,
  FileText,
  Compass,
  Users,
  Bell,
  GraduationCap as GradCap,
  SpellCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundStore } from '@/store/sound-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { WeeklyGoalsWidget } from '@/components/shared/weekly-goals-widget'
import { DailyTip } from '@/components/shared/daily-tip'
import { StreakFreezeBanner } from '@/components/shared/streak-freeze-banner'
import { PlanBadge, type PlanTier } from '@/components/shared/plan-badge'
import { PremiumGate } from '@/components/shared/premium-gate'

interface Enrollment {
  id: string
  courseId: string
  title: string
  icon: string | null
  color: string | null
  difficulty: string
  category: { name: string; icon: string | null }
  totalLessons: number
  completedLessons: number
  progress: number
  currentLessonId: string | null
}

interface DailyChallenge {
  id: string
  title: string
  description: string | null
  type: string
  xpReward: number
  gemReward: number
  completed: boolean
}

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  description: string | null
  courseCount: number
}

interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  earnedAt: string
}

const categoryIcons: Record<string, React.ElementType> = {
  Languages: Globe,
  STEM: Beaker,
  'Arts & Humanities': Palette,
  'Nigerian Studies': BookOpen,
  'Business & Finance': Briefcase,
  'Technology & Coding': Code2,
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 flex-1 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-64 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function StudentDashboard() {
  const { user } = useAuthStore()
  const { navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')
  const playSpinWheel = useSoundEffect('spinWheel')
  const playGemCollect = useSoundEffect('gemCollect')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [dailyXpGoal, setDailyXpGoal] = useState(50)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        const data = await res.json()
        setEnrollments(data.enrollments || [])
        setDailyChallenge(data.dailyChallenge)
        setCategories(data.categories || [])
        setRecentAchievements(data.recentAchievements || [])
        setDailyXpGoal(data.dailyXpGoal || 50)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])



  const difficultyColor = (d: string) => {
    switch (d) {
      case 'BEGINNER': return 'bg-green-100 text-green-700'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700'
      case 'ADVANCED': return 'bg-red-100 text-red-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) return <DashboardSkeleton />

  const firstName = user?.name?.split(' ')[0] || 'Learner'

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 rounded-full bg-yellow-500/10 translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Keep up the great work! You&apos;re on a {user?.streak || 0}-day streak.
              </p>
            </div>

            {/* Daily Goal Progress */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Daily Goal</span>
                </div>
                <span className="text-xs text-white/70">
                  {user?.xp || 0} / {dailyXpGoal} XP
                </span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((user?.xp || 0) / dailyXpGoal) * 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        {[
          {
            icon: Flame,
            label: 'Streak',
            value: `${user?.streak || 0} days`,
            color: 'bg-orange-500/10 text-orange-600',
            animate: user?.streak ? 'animate-flame-pulse' : '',
          },
          {
            icon: Zap,
            label: 'Total XP',
            value: user?.xp?.toLocaleString() || '0',
            color: 'bg-amber-500/10 text-amber-600',
          },
          {
            icon: Gem,
            label: 'Gems',
            value: user?.gems?.toLocaleString() || '0',
            color: 'bg-blue-500/10 text-blue-600',
            onClick: () => { playGemCollect(); navigateTo('shop') },
          },
          {
            icon: Heart,
            label: 'Hearts',
            value: `${user?.hearts || 0}/${user?.maxHearts || 5}`,
            color: 'bg-red-500/10 text-red-600',
          },
          {
            icon: Gem,
            label: 'Plan',
            value: (user?.planTier as PlanTier) || 'FREE',
            color: 'bg-purple-500/10 text-purple-600',
            isPlan: true,
          },
        ].map((stat) => (
          <motion.button
            key={stat.label}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={stat.onClick}
            className="p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow text-left"
          >
            {stat.isPlan ? (
              <div className="flex flex-col items-start">
                <PlanBadge tier={(user?.planTier as PlanTier) || 'FREE'} size="small" />
                <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2 ${stat.animate}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Premium Upgrade Banner for Free Users */}
      {!(user as any)?.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Upgrade to SkoolarPlay+</h3>
                    <p className="text-sm text-white/80">Unlock premium features, bonus XP, and more!</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigateTo('upgrade')}
                  className="bg-white text-amber-600 hover:bg-white/90 font-semibold"
                >
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className={`border-0 shadow-md overflow-hidden ${dailyChallenge.completed ? 'bg-muted/50' : ''}`}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className={`p-5 md:p-6 flex-1 ${dailyChallenge.completed ? '' : 'bg-gradient-to-r from-yellow-500/5 to-orange-500/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className={`w-5 h-5 ${dailyChallenge.completed ? 'text-muted-foreground' : 'text-yellow-500'}`} />
                    <Badge variant="secondary" className={`rounded-full text-xs ${dailyChallenge.completed ? '' : 'bg-yellow-500/10 text-yellow-700 border-0'}`}>
                      Daily Challenge
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{dailyChallenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {dailyChallenge.description || 'Complete today\'s challenge for bonus rewards!'}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">+{dailyChallenge.xpReward} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Gem className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">+{dailyChallenge.gemReward} Gems</span>
                    </div>
                  </div>
                  <Button
                    disabled={dailyChallenge.completed}
                    onClick={() => { playSpinWheel(); navigateTo('daily-challenge') }}
                    className={`rounded-full ${dailyChallenge.completed ? 'bg-muted text-muted-foreground' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                  >
                    {dailyChallenge.completed ? (
                      <>
                        <Star className="w-4 h-4 mr-1.5 fill-current" />
                        Completed!
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1.5" />
                        Start Challenge
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Free Spin Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-r from-[#008751] to-[#005E38] text-white cursor-pointer"
          onClick={() => navigateTo('spin-wheel')}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 md:p-5">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl"
                >
                  🎰
                </motion.div>
                <div>
                  <h3 className="font-bold">Free Spin Available!</h3>
                  <p className="text-white/80 text-xs">Spin the wheel for gems, XP & more</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.17 }}
      >
        <DailyTip />
      </motion.div>

      {/* Streak Freeze Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.175 }}
      >
        <StreakFreezeBanner />
      </motion.div>

      {/* Weekly Goals Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.185 }}
      >
        <WeeklyGoalsWidget />
      </motion.div>

      {/* Gamification Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="grid grid-cols-3 md:grid-cols-6 gap-2"
      >
        {[
          { icon: '🎯', label: 'Quests', page: 'quests' as const, bg: 'from-green-500/10 to-green-600/10', border: 'border-green-500/20' },
          { icon: '📅', label: 'Rewards', page: 'login-rewards' as const, bg: 'from-amber-500/10 to-amber-600/10', border: 'border-amber-500/20' },
          { icon: '🎁', label: 'Boxes', page: 'mystery-box' as const, bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20' },
          { icon: '⚔️', label: 'Boss', page: 'boss-battle' as const, bg: 'from-red-500/10 to-red-600/10', border: 'border-red-500/20' },
          { icon: '👥', label: 'Invite', page: 'referral' as const, bg: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20' },
          { icon: '🏆', label: 'Ranks', page: 'leaderboard' as const, bg: 'from-yellow-500/10 to-yellow-600/10', border: 'border-yellow-500/20' },
        ].map((item) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { playClick(); navigateTo(item.page) }}
            className={`p-3 rounded-xl bg-gradient-to-br ${item.bg} border ${item.border} flex flex-col items-center gap-1.5 text-center`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Active Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Courses</h2>
          <button
            onClick={() => navigateTo('learning-paths')}
            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {enrollments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">No courses yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our catalog and start learning today!
              </p>
              <Button
                onClick={() => { playClick(); navigateTo('courses') }}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Explore Courses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {enrollments.map((enrollment, i) => (
              <motion.div
                key={enrollment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="shrink-0 w-72"
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg`} style={{ backgroundColor: `${enrollment.color || '#008751'}15` }}>
                        {enrollment.icon === '🌐' ? '🌐' : enrollment.icon === '🧪' ? '🧪' : enrollment.icon === '🎨' ? '🎨' : enrollment.icon === '📚' ? '📚' : enrollment.icon === '💼' ? '💼' : enrollment.icon === '💻' ? '💻' : '📚'}
                      </div>
                      <Badge variant="secondary" className={`rounded-full text-[10px] ${difficultyColor(enrollment.difficulty)}`}>
                        {enrollment.difficulty}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">{enrollment.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{enrollment.category?.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={enrollment.progress} className="h-2" />
                      <span className="text-xs font-medium text-muted-foreground shrink-0">{enrollment.progress}%</span>
                    </div>
                    <div className="mt-auto pt-3">
                      <Button
                        onClick={() => { playClick(); navigateTo('course', { courseId: enrollment.courseId }) }}
                        className="w-full rounded-full h-9 text-sm bg-primary hover:bg-primary/90"
                      >
                        {enrollment.progress > 0 ? 'Continue' : 'Start Learning'}
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Links Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('analytics')}
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">📊 Analytics</p>
              <p className="text-xs text-muted-foreground">Track progress</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('vocabulary')}
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <SpellCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">📖 Vocabulary</p>
              <p className="text-xs text-muted-foreground">Expand words</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('exam-hub')}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-slate-500/10 border border-blue-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">📝 Exams</p>
              <p className="text-xs text-muted-foreground">WAEC, JAMB</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { playClick(); navigateTo('donate') }}
          className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">❤️ Support Us</p>
              <p className="text-xs text-muted-foreground">Donate</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('ide')}
          className="p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">💻 Code IDE</p>
              <p className="text-xs text-muted-foreground">Write & Run</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Learning Path Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.37 }}
      >
        <Card className="border-0 shadow-sm overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,135,81,0.08), rgba(245,158,11,0.08))' }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">🧭 Learning Path</h3>
                  <p className="text-xs text-muted-foreground">Choose your focused learning journey</p>
                </div>
              </div>
              <Button
                onClick={() => navigateTo('learning-paths')}
                className="rounded-full bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                Explore
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Browse Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Browse Categories</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[cat.name] || BookOpen
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { playClick(); navigateTo('courses', { categoryId: cat.id, categoryName: cat.name }) }}
                className="p-4 md:p-5 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{cat.courseCount} courses</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Social & Teacher Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.38 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {/* Study Groups Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('study-groups')}
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">👥 Study Groups</p>
              <p className="text-xs text-muted-foreground">Learn together</p>
            </div>
          </div>
        </motion.button>

        {/* Notifications Quick View */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('notifications')}
          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-sm">🔔 Notifications</p>
              <p className="text-xs text-muted-foreground">Stay updated</p>
            </div>
          </div>
        </motion.button>

        {/* Become a Teacher Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('teacher-application')}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-green-500/10 border border-primary/20 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <GradCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">👨‍🏫 Become a Teacher</p>
              <p className="text-xs text-muted-foreground">Share knowledge</p>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Achievements</h2>
            <button
              onClick={() => navigateTo('achievements')}
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
            {recentAchievements.map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-0 shadow-sm w-44 shrink-0 cursor-pointer" onClick={playGemCollect}>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <p className="text-xs font-semibold line-clamp-1">{achievement.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
