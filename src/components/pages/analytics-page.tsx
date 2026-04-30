'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  BookOpen,
  Flame,
  Zap,
  Gem,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { useAppStore } from '@/store/app-store'

interface OverallStats {
  totalXP: number
  level: number
  streak: number
  gems: number
  totalCourses: number
  averageScore: number
  totalLessonsCompleted: number
}

interface SubjectPerf {
  name: string
  averageScore: number
  completed: number
  total: number
  icon: string | null
  color: string | null
  recentScores: number[]
}

interface AnalyticsData {
  overall: OverallStats
  subjectPerformance: SubjectPerf[]
  strengths: SubjectPerf[]
  weaknesses: SubjectPerf[]
  predictedGrades: { subject: string; grade: string; score: number; confidence: number }[]
  overallAverage: number
  calendar: { date: string; count: number }[]
  performanceTrend: { date: string; score: number }[]
  examSummary: { totalExams: number; passedExams: number; averageScore: number; bestScore: number }
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getGradeColor(grade: string) {
  const colors: Record<string, string> = {
    A1: 'bg-green-100 text-green-700 border-green-200',
    B2: 'bg-green-100 text-green-600 border-green-200',
    B3: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    C4: 'bg-blue-100 text-blue-600 border-blue-200',
    C5: 'bg-blue-100 text-blue-500 border-blue-200',
    C6: 'bg-sky-100 text-sky-600 border-sky-200',
    D7: 'bg-yellow-100 text-yellow-600 border-yellow-200',
    E8: 'bg-orange-100 text-orange-600 border-orange-200',
    F9: 'bg-red-100 text-red-600 border-red-200',
  }
  return colors[grade] || 'bg-muted text-muted-foreground border'
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function AnalyticsPage() {
  const { user } = useAuthStore()
  const { goBack } = useAppStore()
  const playOpen = useSoundEffect('open')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics')
        if (res.ok) {
          const json = await res.json()
          setData(json)
          playOpen()
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <AnalyticsSkeleton />

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Could not load analytics data. Start learning to see your progress!
      </div>
    )
  }

  const { overall, subjectPerformance, strengths, weaknesses, predictedGrades, calendar, performanceTrend, examSummary } = data

  // Max count for calendar
  const maxCount = Math.max(...calendar.map((c) => c.count), 1)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            📊 My Learning Analytics
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Track your progress and identify areas for improvement
        </p>
      </motion.div>

      {/* Overall Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: Zap, label: 'Total XP', value: overall.totalXP.toLocaleString(), color: 'bg-amber-500/10 text-amber-600' },
          { icon: Award, label: 'Level', value: `${overall.level}`, color: 'bg-purple-500/10 text-purple-600' },
          { icon: BookOpen, label: 'Courses', value: `${overall.totalCourses}`, color: 'bg-blue-500/10 text-blue-600' },
          { icon: Target, label: 'Avg Score', value: `${overall.averageScore}%`, color: overall.averageScore >= 60 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Subject Performance Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Subject Performance
        </h2>
        {subjectPerformance.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No subject data yet. Start learning to see your performance!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjectPerformance.map((subject, i) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${subject.color || '#008751'}15` }}
                        >
                          {subject.icon || '📚'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{subject.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.completed}/{subject.total} lessons
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(subject.averageScore)}`}>
                          {subject.averageScore}%
                        </p>
                      </div>
                    </div>

                    {/* Mini bar chart */}
                    {subject.recentScores.length > 0 && (
                      <div className="flex items-end gap-1 h-8 mt-2">
                        {subject.recentScores.map((score, j) => (
                          <div
                            key={j}
                            className={`flex-1 rounded-sm ${getScoreBg(score)} opacity-80`}
                            style={{ height: `${Math.max(4, score)}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${getScoreBg(subject.averageScore)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.total > 0 ? (subject.completed / subject.total) * 100 : 0}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Strengths & Weaknesses + Predicted Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths & Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Strengths & Weaknesses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strengths.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                    🟢 Strongest Subjects
                  </p>
                  {strengths.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-green-600">#{i + 1}</span>
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs rounded-full">
                        {s.averageScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Complete some lessons to see your strengths!</p>
              )}

              {weaknesses.length > 0 && strengths.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                    🔴 Needs Improvement
                  </p>
                  {weaknesses.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-600">#{i + 1}</span>
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs rounded-full">
                        {s.averageScore}%
                      </Badge>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    💡 Focus on these to improve your overall performance!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Predicted WAEC Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4" /> Predicted Exam Grades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictedGrades.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Predicted</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${getScoreColor(data.overallAverage)}`}>
                        {data.overallAverage}%
                      </span>
                      <Badge className={`border text-xs rounded-full ${getGradeColor(
                        data.overallAverage >= 75 ? 'A1' : data.overallAverage >= 70 ? 'B2' : data.overallAverage >= 65 ? 'B3' : data.overallAverage >= 60 ? 'C4' : data.overallAverage >= 55 ? 'C5' : data.overallAverage >= 50 ? 'C6' : data.overallAverage >= 45 ? 'D7' : data.overallAverage >= 40 ? 'E8' : 'F9'
                      )}`}>
                        {data.overallAverage >= 75 ? 'A1' : data.overallAverage >= 70 ? 'B2' : data.overallAverage >= 65 ? 'B3' : data.overallAverage >= 60 ? 'C4' : data.overallAverage >= 55 ? 'C5' : data.overallAverage >= 50 ? 'C6' : data.overallAverage >= 45 ? 'D7' : data.overallAverage >= 40 ? 'E8' : 'F9'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {predictedGrades.map((pg) => (
                      <div key={pg.subject} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[140px]">{pg.subject}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pg.confidence > 60 ? getScoreBg(pg.score) : 'bg-gray-400'}`}
                              style={{ width: `${pg.score}%` }}
                            />
                          </div>
                          <Badge className={`border text-xs rounded-full px-2 ${getGradeColor(pg.grade)}`}>
                            {pg.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Based on your lesson performance. Complete more lessons for higher confidence.
                  </p>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Complete lessons to get predicted grades
                </div>
              )}

              {/* Exam Summary */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">📝 Exam Performance</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{examSummary.totalExams}</p>
                    <p className="text-xs text-muted-foreground">Exams Taken</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{examSummary.passedExams}</p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{examSummary.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">Avg Score</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-bold">{examSummary.bestScore}%</p>
                    <p className="text-xs text-muted-foreground">Best Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Learning Streak Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Learning Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {calendar.map((day) => {
                const intensity = day.count === 0 ? 0 : day.count <= 1 ? 1 : day.count <= 3 ? 2 : day.count <= 5 ? 3 : 4
                const colors = ['bg-muted', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800']
                return (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-colors`}
                    title={`${day.date}: ${day.count} lessons`}
                  />
                )
              })}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {['bg-muted', 'bg-green-200', 'bg-green-400', 'bg-green-600', 'bg-green-800'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Performance Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceTrend.length > 0 ? (
              <div className="relative h-48">
                <svg width="100%" height="100%" viewBox="0 0 400 160" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((line) => (
                    <g key={line}>
                      <line
                        x1="0" y1={160 - (line / 100) * 140 - 10}
                        x2="400" y2={160 - (line / 100) * 140 - 10}
                        stroke="currentColor"
                        className="text-muted/30"
                        strokeWidth="0.5"
                      />
                      <text
                        x="2" y={160 - (line / 100) * 140 - 14}
                        className="fill-muted-foreground text-[8px]"
                      >
                        {line}%
                      </text>
                    </g>
                  ))}

                  {/* Data line */}
                  {performanceTrend.length > 1 && (() => {
                    const points = performanceTrend.map((d, i) => {
                      const x = (i / (performanceTrend.length - 1)) * 390 + 5
                      const y = 160 - (d.score / 100) * 140 - 10
                      return `${x},${y}`
                    }).join(' ')

                    return (
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#008751"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    )
                  })()}

                  {/* Data points */}
                  {performanceTrend.map((d, i) => {
                    const x = performanceTrend.length > 1
                      ? (i / (performanceTrend.length - 1)) * 390 + 5
                      : 200
                    const y = 160 - (d.score / 100) * 140 - 10
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={d.score >= 60 ? '#008751' : '#EF4444'}
                      />
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Complete some lessons to see your trend!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
