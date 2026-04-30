'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  Wallet,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Users,
  GraduationCap,
  BookOpen,
  Loader2,
  CreditCard,
  Banknote,
  ArrowRight,
  BarChart3,
  Trophy,
  Target,
  CheckCircle2,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface DashboardData {
  teacher: {
    id: string
    status: string
    totalEarnings: number
    availableBalance: number
    pendingPayouts: number
    commissionRate: number
  } | null
  courses: Array<{
    id: string
    title: string
    description: string | null
    status: string
    enrollments: number
    rating: number
    price: number | null
    isFree: boolean
  }>
  recentReviews: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    user: {
      name: string
      avatar: string | null
    }
    course: {
      title: string
    }
  }>
  payouts: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    reference: string
  }>
  earningsSummary: {
    totalEarnings: number
    availableBalance: number
    pendingPayouts: number
    commissionRate: number
  }
  analytics: {
    totalStudents: number
    totalEnrollments: number
    totalCompletions: number
    avgCompletionRate: number
    avgRating: number
    totalReviews: number
  }
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-500/10 text-gray-600',
  PUBLISHED: 'bg-green-500/10 text-green-600',
  UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-600',
  UNLISTED: 'bg-orange-500/10 text-orange-600',
}

const payoutStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  PROCESSING: 'bg-blue-500/10 text-blue-600',
  COMPLETED: 'bg-green-500/10 text-green-600',
  FAILED: 'bg-red-500/10 text-red-600',
}

export function TeacherDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teacher/dashboard')
      if (res.ok) {
        const json = await res.json()
        // Map API response to expected format
        const teacherData = json.earningsSummary || json.teacher
        const teacher: DashboardData['teacher'] = teacherData ? {
          id: json.profile?.id || '',
          status: json.profile?.status || 'APPROVED',
          totalEarnings: teacherData.totalEarnings || 0,
          availableBalance: teacherData.availableBalance || 0,
          pendingPayouts: teacherData.pendingPayouts || 0,
          commissionRate: teacherData.commissionRate || 15,
        } : null

        setData({
          teacher,
          courses: (json.courses || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description || null,
            status: c.status,
            enrollments: c.enrollments || c.enrollmentCount || 0,
            rating: c.rating || 0,
            price: c.price,
            isFree: c.isFree,
          })),
          recentReviews: json.recentReviews || [],
          payouts: (json.payouts || []).map((p: any) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            createdAt: p.requestedAt || p.createdAt,
            reference: p.reference || '',
          })),
          earningsSummary: json.earningsSummary || {},
          analytics: json.analytics || {
            totalStudents: 0,
            totalEnrollments: 0,
            totalCompletions: 0,
            avgCompletionRate: 0,
            avgRating: 0,
            totalReviews: 0,
          },
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCourseAction = async (courseId: string, action: string) => {
    setActionLoading(`${courseId}-${action}`)
    playClick()
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchDashboard()
      }
    } catch (error) {
      console.error('Failed to perform action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const deleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return
    setActionLoading(`${courseId}-delete`)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchDashboard()
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // No teacher profile - show apply card
  if (!loading && (!data || !data.teacher)) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 bg-gradient-to-br from-primary/10 via-card to-yellow-500/10">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Become a Teacher</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Share your knowledge and earn income by creating courses on SkoolarPlay. Apply now to get started!
              </p>
              <Button
                onClick={() => { playClick(); navigateTo('teacher-application') }}
                className="rounded-full bg-primary hover:bg-primary/90 gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Apply to Teach
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Teacher not approved
  if (!loading && data?.teacher?.status !== 'APPROVED') {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
              <p className="text-sm text-muted-foreground">
                Your teacher application is currently being reviewed. We&apos;ll notify you once it&apos;s approved.
              </p>
              <Badge className="mt-4 bg-yellow-500/10 text-yellow-600 border-0">
                {data?.teacher?.status || 'PENDING'}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const { teacher, courses, recentReviews, payouts, analytics } = data!

  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollments, 0)
  const avgCourseRating = courses.length > 0
    ? courses.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / Math.max(courses.filter(c => c.rating > 0).length, 1)
    : 0
  const completedPayouts = payouts.filter(p => p.status === 'COMPLETED')
  const totalPayoutAmount = completedPayouts.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">👨‍🏫 Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your courses, earnings, and reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { playClick(); navigateTo('messages') }}
            variant="outline"
            className="rounded-full gap-1.5"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Messages</span>
          </Button>
          <Button
            onClick={() => { playClick(); navigateTo('teacher-payout') }}
            variant="outline"
            className="rounded-full gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">Payouts</span>
          </Button>
        </div>
      </motion.div>

      {/* Earnings Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-lg font-bold">₦{teacher!.totalEarnings.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Total Earnings</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-lg font-bold">₦{teacher!.availableBalance.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Available Balance</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-lg font-bold">₦{teacher!.pendingPayouts.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Pending Payouts</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-lg font-bold">{teacher!.commissionRate}%</p>
            <p className="text-[11px] text-muted-foreground">Commission Rate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        <Button
          onClick={() => { playClick(); navigateTo('teacher-course-create') }}
          className="rounded-full bg-primary hover:bg-primary/90 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </Button>
        <Button
          onClick={() => { playClick(); navigateTo('teacher-payout') }}
          variant="outline"
          className="rounded-full gap-1.5"
        >
          <Banknote className="w-4 h-4" />
          Request Payout
        </Button>
        <Button
          onClick={() => { playClick(); navigateTo('teacher-payout') }}
          variant="outline"
          className="rounded-full gap-1.5"
        >
          <CreditCard className="w-4 h-4" />
          Edit Bank Details
        </Button>
      </motion.div>

      {/* Performance Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Student Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{analytics.totalStudents || totalEnrollments}</p>
                <p className="text-[11px] text-muted-foreground">Total Students</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{analytics.totalCompletions || 0}</p>
                <p className="text-[11px] text-muted-foreground">Completions</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{(analytics.avgRating || avgCourseRating).toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">Avg Rating</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 text-center">
                <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-xl font-bold">{courses.length}</p>
                <p className="text-[11px] text-muted-foreground">Courses</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Completion Rate</span>
                <span className="text-sm font-bold text-primary">{analytics.avgCompletionRate || 0}%</span>
              </div>
              <Progress value={analytics.avgCompletionRate || 0} className="h-3" />
              <p className="text-[11px] text-muted-foreground">
                {analytics.totalCompletions || 0} of {analytics.totalEnrollments || totalEnrollments} students have completed courses
              </p>
            </div>

            {/* Revenue Summary */}
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Revenue Summary
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                  <span className="text-sm font-bold text-green-600">₦{teacher!.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Available for Withdrawal</span>
                  <span className="text-sm font-bold text-primary">₦{teacher!.availableBalance.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Total Paid Out</span>
                  <span className="text-sm font-bold">₦{totalPayoutAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Platform Fee ({teacher!.commissionRate}%)</span>
                  <span className="text-sm font-bold text-muted-foreground">₦{Math.round(teacher!.totalEarnings * teacher!.commissionRate / (100 - teacher!.commissionRate)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Student Engagement */}
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Student Engagement
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border">
                  <Target className="w-4 h-4 text-primary mb-1" />
                  <p className="text-sm font-bold">{analytics.totalEnrollments || totalEnrollments}</p>
                  <p className="text-[10px] text-muted-foreground">Total Enrollments</p>
                </div>
                <div className="p-3 rounded-xl border">
                  <Star className="w-4 h-4 text-yellow-500 mb-1" />
                  <p className="text-sm font-bold">{analytics.totalReviews || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* My Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              My Courses ({courses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-sm text-muted-foreground mb-3">You haven&apos;t created any courses yet</p>
                <Button
                  onClick={() => { playClick(); navigateTo('teacher-course-create') }}
                  className="rounded-full bg-primary hover:bg-primary/90 gap-1.5"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courses.map((course) => {
                  const isLoading = actionLoading?.startsWith(course.id)
                  return (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-semibold truncate">{course.title}</h4>
                          <Badge className={`text-[9px] rounded-full border-0 shrink-0 ${statusColors[course.status] || ''}`}>
                            {course.status}
                          </Badge>
                          {course.isFree ? (
                            <Badge className="text-[9px] rounded-full bg-green-500/10 text-green-600 border-0 shrink-0">Free</Badge>
                          ) : course.price ? (
                            <Badge className="text-[9px] rounded-full bg-primary/10 text-primary border-0 shrink-0">
                              ₦{course.price.toLocaleString()}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {course.enrollments}
                          </span>
                          {course.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {course.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { playClick(); navigateTo('teacher-course-create', { courseId: course.id }) }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit className="w-3.5 h-3.5" />}
                        </Button>
                        {course.status === 'DRAFT' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCourseAction(course.id, 'submit')}
                              disabled={isLoading}
                              title="Submit for Review"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteCourse(course.id)}
                              disabled={isLoading}
                              title="Delete Draft"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {course.status === 'PUBLISHED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCourseAction(course.id, 'unpublish')}
                            disabled={isLoading}
                            title="Unpublish"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {course.status === 'UNLISTED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCourseAction(course.id, 'republish')}
                            disabled={isLoading}
                            title="Republish"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Reviews & Payouts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentReviews.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="pb-3 border-b last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{review.user.name}</span>
                        <div className="flex items-center">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-0.5">on &ldquo;{review.course.title}&rdquo;</p>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Payout History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {payouts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No payout history</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">₦{payout.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(payout.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge className={`text-[10px] rounded-full border-0 ${payoutStatusColors[payout.status] || ''}`}>
                        {payout.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
