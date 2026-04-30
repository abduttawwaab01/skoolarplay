'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Zap,
  Gem,
  Trophy,
  Users,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Star,
  Loader2,
  Download,
  Crown,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { isFeatureUnlocked } from '@/lib/premium'
import { PremiumGate } from '@/components/shared/premium-gate'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface Lesson {
  id: string
  title: string
  type: string
  order: number
  xpReward: number
  gemReward: number
  questionCount: number
  isCompleted: boolean
  isCurrent: boolean
  isLocked: boolean
  isPremium: boolean
}

interface Module {
  id: string
  title: string
  order: number
  isPremium: boolean
  lessons: Lesson[]
}

interface CourseData {
  id: string
  title: string
  description: string | null
  icon: string | null
  color: string | null
  difficulty: string
  isPremium: boolean
  category: { id: string; name: string; icon: string | null; color: string | null }
  enrollmentCount: number
  totalModules: number
  totalLessons: number
  completedLessons: number
  progress: number
  isEnrolled: boolean
  currentModuleIndex: number
  currentLessonIndex: number
  modules: Module[]
}

const lessonTypeIcon: Record<string, React.ElementType> = {
  QUIZ: HelpCircle,
  VIDEO: Video,
  READING: FileText,
  MIXED: BookOpen,
  REVIEW: Star,
}

const lessonTypeColor: Record<string, string> = {
  QUIZ: 'bg-purple-100 text-purple-600',
  VIDEO: 'bg-blue-100 text-blue-600',
  READING: 'bg-green-100 text-green-600',
  MIXED: 'bg-orange-100 text-orange-600',
  REVIEW: 'bg-amber-100 text-amber-600',
}

function CourseSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 rounded-2xl" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function ModuleNode({
  module,
  courseProgress,
  isExpanded,
  onToggle,
  onLessonClick,
  canDownload,
  onDownloadLesson,
  userIsPremium,
}: {
  module: Module
  courseProgress: number
  isExpanded: boolean
  onToggle: () => void
  onLessonClick: (lesson: Lesson) => void
  canDownload: boolean
  onDownloadLesson: (lesson: Lesson, e?: React.MouseEvent) => void
  userIsPremium: boolean
}) {
  const completedCount = (module.lessons || []).filter((l) => l.isCompleted && l.type !== 'REVIEW').length
  const totalCount = (module.lessons || []).filter((l) => l.type !== 'REVIEW').length
  const moduleProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const isModuleComplete = completedCount === totalCount
  const isModuleStarted = completedCount > 0
  const hasCurrentLesson = (module.lessons || []).some((l) => l.isCurrent)
  const isAllLocked = (module.lessons || []).filter(l => l.type !== 'REVIEW').every((l) => l.isLocked || (l.isPremium && !userIsPremium))
  const moduleIsPremiumLocked = module.isPremium && !userIsPremium

  return (
    <div className="relative">
      {/* Module Card */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all ${
          isAllLocked
            ? 'bg-muted/50 border-muted opacity-60'
            : isModuleComplete
            ? 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30'
            : hasCurrentLesson
            ? 'bg-primary/5 border-primary/30 shadow-sm'
            : 'bg-card border-border hover:border-primary/20 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Module Status Circle */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg font-bold transition-all ${
              isAllLocked
                ? 'bg-muted text-muted-foreground'
                : isModuleComplete
                ? 'bg-green-500 text-white'
                : hasCurrentLesson
                ? 'bg-primary text-primary-foreground animate-skill-node-hover shadow-lg shadow-primary/20'
                : isModuleStarted
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isModuleComplete ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isAllLocked ? (
              <Lock className="w-5 h-5" />
            ) : (
              completedCount
            )}
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base">{module.title}</h3>
              {moduleIsPremiumLocked && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount}/{totalCount} lessons
            </p>
            {moduleProgress > 0 && moduleProgress < 100 && (
              <div className="mt-2 w-full max-w-[200px]">
                <Progress value={moduleProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.button>

      {/* Lessons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="ml-6 mt-2 pl-6 border-l-2 border-primary/20 space-y-2 pb-2">
              {(module.lessons || []).map((lesson, li) => {
                const LessonIcon = lessonTypeIcon[lesson.type] || HelpCircle
                const lessonIsPremiumLocked = lesson.isPremium && !userIsPremium
                const isReview = lesson.type === 'REVIEW'
                
                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: li * 0.05 }}
                    onClick={() => !lessonIsLocked && onLessonClick(lesson)}
                    disabled={lessonIsLocked}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                      lessonIsLocked
                        ? 'opacity-40 cursor-not-allowed'
                        : isReview
                        ? 'bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10'
                        : lesson.isCompleted
                        ? 'hover:bg-green-50 dark:hover:bg-green-500/10'
                        : lesson.isCurrent
                        ? 'bg-primary/5 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Lesson Node */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        lesson.isCompleted
                          ? 'bg-green-500 text-white'
                          : lesson.isCurrent
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : lessonIsLocked
                          ? 'bg-muted text-muted-foreground'
                          : isReview
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : lessonIsLocked ? (
                        lessonIsPremiumLocked ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5" />
                      ) : (
                        <LessonIcon className="w-4 h-4" />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                        {lesson.isPremium && (
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className={`rounded-full text-[10px] px-1.5 ${lessonTypeColor[lesson.type] || ''}`}>
                          {lesson.type}
                        </Badge>
                        {lesson.questionCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {lesson.questionCount} questions
                          </span>
                        )}
                        {lessonIsPremiumLocked && (
                          <span className="text-[10px] text-amber-500 font-medium">Premium</span>
                        )}
                      </div>
                    </div>

                    {/* Rewards + Download */}
                    {!lessonIsLocked && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
                          <Zap className="w-3 h-3" />
                          {lesson.xpReward}
                        </div>
                        <div className="flex items-center gap-0.5 text-[10px] text-blue-500">
                          <Gem className="w-3 h-3" />
                          {lesson.gemReward}
                        </div>
                        <button
                          onClick={(e) => onDownloadLesson(lesson, e)}
                          className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          title={canDownload ? 'Download lesson' : 'Premium required to download'}
                        >
                          <div className="relative">
                            <Download className="w-3.5 h-3.5" />
                            {!canDownload && (
                              <Crown className="w-2 h-2 text-amber-500 absolute -top-1 -right-1" />
                            )}
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Play button for current lesson */}
                    {lesson.isCurrent && !lessonIsLocked && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CoursePage() {
  const { params, navigateTo, goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playSlide = useSoundEffect('slide')
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const courseId = params?.courseId as string
  const { user } = useAuthStore()
  const isPremium = (user as any)?.isPremium || false
  const premiumExpiresAt = (user as any)?.premiumExpiresAt || null
  let parsedFeatures: string[] = []
  try { parsedFeatures = JSON.parse((user as any)?.unlockedFeatures || '[]') } catch {}
  const canDownload = isFeatureUnlocked(isPremium, premiumExpiresAt, parsedFeatures, 'DOWNLOAD_LESSONS')

  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      setError('No course specified')
      return
    }

    async function fetchCourse() {
      try {
        console.log('[CoursePage] Fetching course:', courseId)
        const res = await fetch(`/api/courses/${courseId}`)
        console.log('[CoursePage] API response status:', res.status)

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          console.error('[CoursePage] API error:', data)

          if (res.status === 404) {
            setError('Course not found')
          } else if (data.requiresPremium) {
            setError('This course is for premium members only. Upgrade to SkoolarPlay+ to access it.')
          } else if (res.status === 401) {
            setError('Please log in to access this course')
          } else if (res.status === 403) {
            setError('You do not have permission to access this course')
          } else {
            setError('Failed to load course. Please try again.')
          }
          return
        }

        const data = await res.json()
        console.log('[CoursePage] Course data received:', data.course?.title)

        if (!data.course) {
          setError('Course data is invalid')
          return
        }

        setCourse(data.course)

        // Auto-expand current module
        if (data.course.modules && data.course.modules.length > 0) {
          const currentModule = data.course.modules[data.course.currentModuleIndex || 0]
          if (currentModule) {
            setExpandedModules(new Set([currentModule.id]))
          }
        }
      } catch (err: any) {
        console.error('[CoursePage] Error fetching course:', err)
        setError(err.message || 'Failed to load course. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [courseId])

  const handleEnroll = async () => {
    if (!courseId || enrolling) return
    setEnrolling(true)
    playClick()
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        // Refetch course data
        const courseRes = await fetch(`/api/courses/${courseId}`)
        const courseData = await courseRes.json()
        setCourse(courseData.course)
      } else {
        if (data.requiresPremium) {
          toast.error('This course is for premium members only. Upgrade to SkoolarPlay+ to enroll.')
        } else {
          setError(data.error || 'Failed to enroll')
        }
      }
    } catch {
      setError('Failed to enroll')
    } finally {
      setEnrolling(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    playOpen()
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleLessonClick = (lesson: Lesson) => {
    playClick()
    
    // Check if lesson is premium and user is not premium
    if (lesson.isPremium && !isPremium) {
      toast.info('This lesson is premium. Upgrade to SkoolarPlay+ to access it.', {
        action: {
          label: 'Upgrade',
          onClick: () => {
            // Navigate to shop or premium page
          },
        },
      })
      return
    }
    
    // Route based on lesson type
    if (lesson.type === 'VIDEO') {
      navigateTo('video-lesson', { courseId, lessonId: lesson.id })
    } else if (lesson.type === 'READING' || lesson.type === 'MIXED') {
      navigateTo('lesson-note', { courseId, lessonId: lesson.id })
    } else {
      navigateTo('lesson', { courseId, lessonId: lesson.id })
    }
  }

  const handleDownloadLesson = async (lesson: Lesson, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!canDownload) {
      toast.info('Premium subscription required to download lessons')
      return
    }
    try {
      const res = await fetch(`/api/lessons/download?lessonId=${lesson.id}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const filename = `${lesson.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Lesson downloaded successfully')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to download lesson')
      }
    } catch {
      toast.error('Failed to download lesson')
    }
  }

  const handleDownloadAll = async () => {
    if (!course || !canDownload) {
      toast.info('Premium subscription required to download lessons')
      return
    }
    const allLessonIds = (course.modules || []).flatMap((m) => (m.lessons || []).map((l) => l.id))
    if (allLessonIds.length === 0) {
      toast.error('No lessons to download')
      return
    }
    try {
      const res = await fetch('/api/lessons/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonIds: allLessonIds }),
      })
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_lessons.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success(`${allLessonIds.length} lessons downloaded`)  
      } else {
        toast.error('Failed to download lessons')
      }
    } catch {
      toast.error('Failed to download lessons')
    }
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'BEGINNER': return 'bg-green-100 text-green-700'
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700'
      case 'ADVANCED': return 'bg-red-100 text-red-700'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) return <CourseSkeleton />

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <Button onClick={goBack} variant="outline" className="rounded-full">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="ghost"
          onClick={goBack}
          className="rounded-full -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </motion.div>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-3xl shrink-0">
                {course.icon || '📚'}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {course.category.name}
                  </Badge>
                  <Badge className={`rounded-full text-xs ${difficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </Badge>
                  {course.isPremium && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1">
                      <Crown className="w-3 h-3" /> Premium
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
                {course.description && (
                  <p className="text-sm text-muted-foreground max-w-2xl">{course.description}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    {course.totalModules} modules, {course.totalLessons} lessons
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {course.enrollmentCount} learners
                  </div>
                </div>

                {/* Progress (if enrolled) */}
                {course.isEnrolled && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">Progress</span>
                      <span className="text-xs text-muted-foreground">
                        {course.completedLessons}/{course.totalLessons} lessons ({course.progress}%)
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2.5" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enroll / Continue Button */}
          {!course.isEnrolled && (
            <div className="p-4 md:p-6 border-t">
              {course.isPremium && !isPremium ? (
                <Button
                  onClick={() => toast.info('Upgrade to SkoolarPlay+ to enroll in this course')}
                  disabled={enrolling}
                  className="w-full md:w-auto rounded-full h-12 px-8 text-base font-semibold bg-amber-500 hover:bg-amber-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Enroll
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full md:w-auto rounded-full h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      Enroll for Free
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Learning Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold mb-0">Learning Path</h2>
          {course.isEnrolled && course.totalLessons > 0 && (
            <PremiumGate feature="DOWNLOAD_LESSONS" fallback={
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download All ({course.totalLessons})
              </Button>
            }>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAll}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download All ({course.totalLessons})
              </Button>
            </PremiumGate>
          )}
        </div>

        <div className="space-y-3 max-w-2xl">
          {(course.modules || []).map((module, i) => (
            <ModuleNode
              key={module.id}
              module={module}
              courseProgress={course.progress}
              isExpanded={expandedModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              onLessonClick={handleLessonClick}
              canDownload={canDownload}
              onDownloadLesson={handleDownloadLesson}
              userIsPremium={isPremium}
            />
          ))}
        </div>

        {course.modules.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No modules available yet for this course.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
