'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Code2,
  Globe,
  Briefcase,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Lock,
  Crown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface LearningPath {
  id: string
  title: string
  description: string | null
  type: string
  icon: string | null
  color: string | null
  totalCourses: number
  totalLessons: number
  completedCourses: number
  startedCourses: number
  progress: number
  isEnrolled: boolean
  estimatedHours: number
  difficulty: string
  isPremium: boolean
}

const pathIcons: Record<string, { icon: React.ElementType; emoji: string; gradient: string }> = {
  EXAM: { icon: GraduationCap, emoji: '🎓', gradient: 'from-blue-600 to-indigo-700' },
  SKILL: { icon: Code2, emoji: '💻', gradient: 'from-purple-600 to-pink-600' },
  LANGUAGE: { icon: Globe, emoji: '🌍', gradient: 'from-green-600 to-emerald-700' },
  BUSINESS: { icon: Briefcase, emoji: '💼', gradient: 'from-amber-600 to-orange-600' },
}

function PathsSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
    </div>
  )
}

export function LearningPathsPage() {
  const { navigateTo, goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)
  const [userIsPremium, setUserIsPremium] = useState(false)

  useEffect(() => {
    async function fetchPaths() {
      try {
        const res = await fetch('/api/learning-paths')
        if (res.ok) {
          const data = await res.json()
          setPaths(data.learningPaths || [])
          setUserIsPremium(data.userIsPremium ?? false)
        }
      } catch (err) {
        console.error('Failed to fetch learning paths:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPaths()
  }, [])

  const handleEnroll = async (pathId: string) => {
    setEnrollingId(pathId)
    try {
      const res = await fetch(`/api/learning-paths/${pathId}/enroll`, { method: 'POST' })
      if (res.ok) {
        setPaths((prev) =>
          prev.map((p) => (p.id === pathId ? { ...p, isEnrolled: true, startedCourses: p.totalCourses } : p))
        )
      }
    } catch (err) {
      console.error('Failed to enroll:', err)
    } finally {
      setEnrollingId(null)
    }
  }

  if (loading) return <PathsSkeleton />

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            🧭 Choose Your Learning Path
            {userIsPremium && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </Badge>
            )}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1 ml-12">
          Select a path to focus your learning journey
        </p>
      </motion.div>

      {/* Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paths.map((path, i) => {
          const config = pathIcons[path.type] || pathIcons.EXAM
          const Icon = config.icon

          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border-0 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full ${path.isEnrolled ? 'ring-2 ring-primary/30' : ''}`}>
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl mb-2">{config.emoji}</div>
                      {path.isPremium && (
                        <div className="bg-amber-500/20 backdrop-blur-sm rounded-full p-1.5">
                          <Crown className="w-5 h-5 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold">{path.title}</h3>
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">
                      {path.description || 'Master this subject area with curated courses'}
                    </p>
                    {path.isPremium && !userIsPremium && (
                      <Badge variant="secondary" className="mt-2 bg-amber-500/20 text-amber-200 text-[10px]">
                        Premium Path
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-bold">
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        {path.totalCourses}
                      </div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm font-bold">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {path.estimatedHours}h
                      </div>
                      <p className="text-xs text-muted-foreground">Est. Time</p>
                    </div>
                    <div className="text-center">
                      <Badge variant="secondary" className="text-[10px] rounded-full">
                        {path.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress */}
                  {path.isEnrolled && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">{path.progress}%</span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {path.completedCourses} of {path.totalCourses} courses completed
                      </p>
                    </div>
                  )}

                  {/* Action */}
                  <Button
                    onClick={() => {
                      playClick()
                      if (path.isPremium && !userIsPremium) {
                        navigateTo('shop')
                        return
                      }
                      if (path.isEnrolled) {
                        navigateTo('dashboard')
                      } else {
                        playOpen()
                        handleEnroll(path.id)
                      }
                    }}
                    disabled={enrollingId === path.id}
                    className={`w-full rounded-full h-10 font-semibold ${
                      path.isPremium && !userIsPremium
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-0'
                        : path.isEnrolled
                        ? 'bg-primary hover:bg-primary/90 text-white'
                        : `bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white border-0`
                    }`}
                  >
                    {enrollingId === path.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : path.isPremium && !userIsPremium ? (
                      <>
                        <Crown className="w-4 h-4 mr-1" />
                        Upgrade to Access
                      </>
                    ) : path.isEnrolled ? (
                      <>
                        Continue Learning
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Start Path
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {paths.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Compass className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Learning Paths Available</h3>
            <p className="text-muted-foreground">Learning paths are coming soon! Check back later.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Compass(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  )
}
