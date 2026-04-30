'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Flame, Clock, BookOpen, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WeeklyGoalData {
  weeklyXp: number
  weeklyXpGoal: number
  xpProgress: number
  lessonsCompletedThisWeek: number
  timeSpentMinutes: number
  streak: number
  league: string
  daysToNextLeague: number | null
  totalLessonsCompleted: number
  totalCoursesCompleted: number
  motivationalMessage: string
  daysRemainingInWeek: number
}

export function WeeklyGoalsWidget() {
  const [data, setData] = useState<WeeklyGoalData | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch('/api/weekly-goals')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (error) {
        console.error('Failed to fetch weekly goals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  if (loading || !data) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (data.xpProgress / 100) * circumference

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          {/* Compact view */}
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring */}
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#xpGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#008751" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold leading-none">{data.xpProgress}%</span>
                <span className="text-[10px] text-muted-foreground">of goal</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Weekly Goal</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {data.weeklyXp.toLocaleString()} / {data.weeklyXpGoal.toLocaleString()} XP
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{data.lessonsCompletedThisWeek}</span>
                  <span className="text-muted-foreground">lessons</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                  </motion.div>
                  <span className="font-medium">{data.streak}</span>
                  <span className="text-muted-foreground">days</span>
                </div>
              </div>

              {data.daysToNextLeague !== null && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {data.daysToNextLeague} days to next league
                </p>
              )}
            </div>

            {/* Expand toggle */}
            <div className="shrink-0">
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded detailed view */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t space-y-4">
                {/* Motivational message */}
                <div className="bg-gradient-to-r from-primary/5 to-amber-500/5 rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">{data.motivationalMessage}</p>
                </div>

                {/* Detailed stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weekly XP</p>
                      <p className="font-bold text-sm">{data.weeklyXp.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                      <p className="font-bold text-sm">{data.lessonsCompletedThisWeek}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Time Spent</p>
                      <p className="font-bold text-sm">{data.timeSpentMinutes}m</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="font-bold text-sm">{data.streak} days</p>
                    </div>
                  </div>
                </div>

                {/* XP progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Weekly Progress</span>
                    <span className="font-medium">{data.xpProgress}%</span>
                  </div>
                  <Progress value={data.xpProgress} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {data.daysRemainingInWeek} day{data.daysRemainingInWeek !== 1 ? 's' : ''} remaining this week
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
