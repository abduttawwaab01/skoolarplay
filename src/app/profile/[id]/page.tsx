'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Trophy,
  Star,
  Flame,
  Gem,
  BookOpen,
  Target,
  Calendar,
  Mail,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { PlanBadge, type PlanTier } from '@/components/shared/plan-badge'
import { getLevelInfo } from '@/lib/level-system'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  level: number
  xp: number
  streak: number
  longestStreak: number
  gems: number
  totalLessonsCompleted: number
  totalCoursesCompleted: number
  totalExamsCompleted: number
  league: string
  planTier: string
  createdAt: string
  isPremium: boolean
  _count: {
    achievements: number
    enrollments: number
    followers: number
    following: number
  }
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userId = params.id as string

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${userId}/profile`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'User not found')
        return
      }
      const data = await res.json()
      setProfile(data.user)
    } catch {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full mb-4" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'This user does not exist'}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const levelInfo = getLevelInfo(profile.xp)
  const isOwnProfile = currentUser?.id === profile.id

  const leagueColors: Record<string, string> = {
    BRONZE: 'bg-amber-700',
    SILVER: 'bg-gray-400',
    GOLD: 'bg-yellow-500',
    PLATINUM: 'bg-blue-300',
    DIAMOND: 'bg-cyan-400',
    SAPPHIRE: 'bg-blue-600',
    RUBY: 'bg-red-600',
    OBSIDIAN: 'bg-gray-900',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 max-w-4xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {profile.isPremium && (
                <Badge className="absolute -bottom-1 -right-1 bg-amber-500">
                  PRO
                </Badge>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <PlanBadge tier={profile.planTier as PlanTier} />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </span>
                {profile.bio && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {profile.bio}
                  </span>
                )}
              </div>
            </div>

            {isOwnProfile && (
              <Button onClick={() => navigateTo('profile')}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{profile.level}</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{profile.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{profile.totalLessonsCompleted}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gem className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{profile.gems}</p>
            <p className="text-xs text-muted-foreground">Gems</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Level Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {levelInfo.level}</span>
                <span className="text-muted-foreground">
                  {levelInfo.xpToNext} XP to next level
                </span>
              </div>
              <Progress value={levelInfo.progress} className="h-3" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge className={leagueColors[profile.league] || 'bg-gray-500'}>
                {profile.league}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Longest streak: {profile.longestStreak} days
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Courses Completed</span>
                <span className="font-medium">{profile.totalCoursesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Exams Completed</span>
                <span className="font-medium">{profile.totalExamsCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Achievements</span>
                <span className="font-medium">{profile._count.achievements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="font-medium">{profile._count.followers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
