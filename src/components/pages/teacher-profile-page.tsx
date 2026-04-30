'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  MessageSquare,
  Calendar,
  Loader2,
} from 'lucide-react'
import { subjectColors } from '@/components/shared/teacher-components'
import { TeacherBookingModal } from '@/components/shared/teacher-booking-modal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface TeacherProfile {
  id: string
  userId: string
  bio: string | null
  subjects: string
  experience: string | null
  rating: number
  totalStudents: number
  totalCourses: number
  isVerified: boolean
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

interface Course {
  id: string
  title: string
  description: string | null
  price: number | null
  isFree: boolean
  enrollments: number
  rating: number
  status: string
  icon: string | null
  color: string | null
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className={`font-medium text-muted-foreground ml-1 ${size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

export function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  const { goBack, params, navigateTo } = useAppStore()
  const { isAuthenticated } = useAuthStore()
  const playClick = useSoundEffect('click')

  const teacherId = params?.teacherId

  useEffect(() => {
    if (teacherId) {
      fetchProfile()
      fetchReviews()
    }
  }, [teacherId])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data.teacher || data)
        setCourses(data.courses || [])
      }
    } catch (error) {
      console.error('Failed to fetch teacher profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewComment.trim()) return
    setSubmittingReview(true)
    playClick()
    try {
      const res = await fetch(`/api/teachers/${teacherId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() }),
      })
      if (res.ok) {
        setReviewOpen(false)
        setReviewRating(0)
        setReviewComment('')
        fetchReviews()
        fetchProfile()
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setSubmittingReview(false)
    }
  }

  const getRatingBreakdown = () => {
    const breakdown = [0, 0, 0, 0, 0]
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating - 1]++
      }
    })
    return breakdown
  }

  const parseSubjects = (subjects: string): string[] => {
    try {
      return JSON.parse(subjects)
    } catch {
      return [subjects]
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={goBack} className="rounded-full mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="font-semibold mb-1">Teacher not found</h3>
            <p className="text-sm text-muted-foreground">This teacher profile could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const subjects = parseSubjects(profile.subjects)
  const ratingBreakdown = getRatingBreakdown()
  const totalReviews = reviews.length

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">Teacher Profile</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 border-3 border-primary/20 shadow-md">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                    {profile.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-xl font-bold">{profile.user.name}</h2>
                  {profile.isVerified && (
                    <Badge className="text-[10px] rounded-full bg-primary/10 text-primary border-0">
                      <CheckCircle className="w-3 h-3 mr-0.5" />
                      Verified
                    </Badge>
                  )}
                </div>
                <StarRating rating={profile.rating} size="md" />
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {subjects.map((subject) => {
                    const colorClass = subjectColors[subject] || 'bg-muted text-muted-foreground'
                    return (
                      <Badge key={subject} variant="secondary" className={`text-[10px] rounded-full ${colorClass} border-0`}>
                        {subject}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => { playClick(); navigateTo('messages', { with: profile.user.id }) }}
                    variant="outline"
                    className="rounded-full gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button
                    onClick={() => { playClick(); setReviewOpen(true) }}
                    className="rounded-full bg-primary hover:bg-primary/90 gap-1.5"
                  >
                    <Star className="w-4 h-4" />
                    Review
                  </Button>
                  <Button
                    onClick={() => { playClick(); setBookingOpen(true) }}
                    className="rounded-full bg-yellow-500 hover:bg-yellow-600 shadow text-white gap-1.5"
                  >
                    <Calendar className="w-4 h-4" />
                    Book 1-on-1
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="text-center p-3 bg-card/80 rounded-xl">
                <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.totalStudents}</p>
                <p className="text-[11px] text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-3 bg-card/80 rounded-xl">
                <BookOpen className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.totalCourses}</p>
                <p className="text-[11px] text-muted-foreground">Courses</p>
              </div>
              <div className="text-center p-3 bg-card/80 rounded-xl">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{profile.rating.toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Published Courses ({courses.length})
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ backgroundColor: course.color || '#6366f1' }}
                      >
                        {course.icon || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate">{course.title}</h3>
                          {course.isFree ? (
                            <Badge className="text-[9px] rounded-full bg-green-500/10 text-green-600 border-0 shrink-0">Free</Badge>
                          ) : (
                            <Badge className="text-[9px] rounded-full bg-primary/10 text-primary border-0 shrink-0">
                              ₦{course.price?.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{course.enrollments} enrolled</span>
                          </div>
                          {course.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span>{course.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Reviews ({totalReviews})
        </h2>
        <Card>
          <CardContent className="p-4 md:p-6">
            {/* Rating Summary */}
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              <div className="text-center sm:text-left shrink-0">
                <p className="text-4xl font-bold">{profile.rating.toFixed(1)}</p>
                <StarRating rating={profile.rating} size="md" />
                <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingBreakdown[star - 1]
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs w-3 text-muted-foreground">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 * (5 - star) }}
                          className="h-full bg-yellow-400 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Individual Reviews */}
            {reviews.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {review.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium">{review.user.name}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(review.createdAt).toLocaleDateString('en-NG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} />
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Write Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>Share your experience learning from {profile.user.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Star Selector */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Your Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (reviewHover || reviewRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {reviewRating > 0 && (
                  <span className="text-sm text-muted-foreground self-center ml-2">
                    {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Your Review</Label>
              <Textarea
                placeholder="Tell us about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="rounded-xl min-h-[80px]"
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              disabled={submittingReview || reviewRating === 0 || !reviewComment.trim()}
              className="w-full rounded-xl h-10 bg-primary hover:bg-primary/90"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Booking Modal */}
      <TeacherBookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        teacherId={profile.id} 
        teacherName={profile.user.name} 
      />
    </div>
  )
}
