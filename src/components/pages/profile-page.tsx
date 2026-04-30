'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Zap,
  Trophy,
  Flame,
  Gem,
  BookOpen,
  Award,
  Calendar,
  Edit3,
  Settings,
  Bell,
  Globe,
  Shield,
  ChevronRight,
  Star,
  ScrollText,
  Loader2,
  X,
  Check,
  Trash2,
  Users,
  Search as SearchIcon,
  UserPlus,
  ArrowLeft,
  Camera,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundStore } from '@/store/sound-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SoundSettings } from '@/components/shared/sound-settings'
import { PlanBadge, getUserTier } from '@/components/shared/plan-badge'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  avatar: string | null
  bio: string | null
  gems: number
  xp: number
  streak: number
  longestStreak: number
  hearts: number
  maxHearts: number
  level: number
  createdAt: string
  lastActiveAt: string
  isPremium?: boolean
  planTier?: string
}

interface ProfileStats {
  enrolledCourses: number
  completedCourses: number
  achievements: number
  totalAchievements: number
  certificates: number
}

interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  earnedAt: string
}

interface Certificate {
  id: string
  courseId: string
  courseName: string
  earnedAt: string
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

export function ProfilePage() {
  const { user } = useAuthStore()
  const { navigateTo, replaceWith, goBack } = useAppStore()
  const { isMuted, toggleMute: toggleSoundMute } = useSoundStore()
  const playOpen = useSoundEffect('open')
  const playClick = useSoundEffect('click')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(!isMuted)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Friends feature state
  const [followers, setFollowers] = useState<any[]>([])
  const [following, setFollowing] = useState<any[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [friendsLoading, setFriendsLoading] = useState(true)

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch('/api/user/friends')
        if (res.ok) {
          const data = await res.json()
          setFollowers(data.followers || [])
          setFollowing(data.following || [])
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error)
      } finally {
        setFriendsLoading(false)
      }
    }
    if (user?.id) {
      fetchFriends()
    }
  }, [user?.id])

  const handleFollow = async (targetId: string) => {
    try {
      const res = await fetch('/api/user/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
      })
      if (res.ok) {
        toast.success("Followed successfully!")
        // Move from suggestions to following (simple mock update)
        const followedUser = suggestions.find(s => s.id === targetId)
        if (followedUser) {
          setSuggestions(suggestions.filter(s => s.id !== targetId))
          setFollowing([...following, followedUser])
        }
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to follow")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const handleUnfollow = async (targetId: string) => {
    try {
      const res = await fetch(`/api/user/friends?targetId=${targetId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        toast.success("Unfollowed successfully!")
        setFollowing(following.filter(f => f.id !== targetId))
      } else {
        toast.error("Failed to unfollow")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  useEffect(() => {
    playOpen()
  }, [])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/user/profile')
        
        if (res.status === 401) {
          // Unauthorized - redirect to login
          useAuthStore.getState().logout()
          replaceWith('login')
          return
        }
        
        const data = await res.json()
        
        if (!res.ok || data.error) {
          console.error('Failed to fetch profile:', data.error)
          return
        }
        
        setProfile(data.user)
        setStats(data.stats)
        setAchievements(data.achievements || [])
        setCertificates(data.certificates || [])
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) return <ProfileSkeleton />

  const isAdmin = profile?.role === 'ADMIN'
  const isTeacher = profile?.role === 'TEACHER'
  const isSupport = profile?.role === 'SUPPORT'
  const isStudent = !isAdmin && !isTeacher && !isSupport

  const initials = profile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP'

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently'

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Back Button for Admin */}
      {user?.role === 'ADMIN' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigateTo('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Admin</span>
        </motion.button>
      )}

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="relative group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary flex items-center justify-center text-3xl md:text-4xl font-bold text-primary-foreground shadow-lg overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                {/* Camera upload button */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      setUploadingAvatar(true)
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        
                        const res = await fetch('/api/admin/upload/announcement', {
                          method: 'POST',
                          body: formData,
                        })
                        
                        if (res.ok) {
                          const data = await res.json()
                          const avatarUrl = data.url || data.fileUrl
                          
                          // Update profile with new avatar
                          const updateRes = await fetch('/api/user/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ avatar: avatarUrl }),
                          })
                          
                          if (updateRes.ok) {
                            const updateData = await updateRes.json()
                            setProfile(updateData.user)
                            useAuthStore.setState((state) => ({
                              user: state.user ? { ...state.user, avatar: avatarUrl } : null
                            }))
                            toast.success('Avatar updated!')
                            playClick()
                          } else {
                            toast.error('Failed to save avatar')
                          }
                        } else {
                          toast.error('Failed to upload image')
                        }
                      } catch {
                        toast.error('Failed to upload image')
                      } finally {
                        setUploadingAvatar(false)
                      }
                    }}
                  />
                  {uploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </label>
                {profile?.level && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center text-xs font-bold shadow">
                    {profile.level}
                  </div>
                )}
              </motion.div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold">{profile?.name || user?.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 mb-1">
                  <PlanBadge tier={getUserTier(profile?.isPremium || (user as any)?.isPremium || false)} size="medium" />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    {profile?.email || user?.email}
                  </div>
                  <Badge variant={profile?.role === 'ADMIN' ? 'default' : profile?.role === 'SUPPORT' ? 'outline' : 'secondary'} className="rounded-full text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {profile?.role === 'ADMIN' ? 'Admin' : profile?.role === 'TEACHER' ? 'Teacher' : profile?.role === 'SUPPORT' ? 'Support Agent' : 'Student'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Member since {memberSince}
                </p>

                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      playClick()
                      setEditName(profile?.name || '')
                      setEditBio(profile?.bio || '')
                      setEditDialogOpen(true)
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto md:mx-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="friends">Friends & Followers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 mt-6">

      {/* Stats Grid - Only show for students */}
      {isStudent && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            icon: Zap,
            label: 'Total XP',
            value: profile?.xp?.toLocaleString() || '0',
            color: 'bg-amber-500/10 text-amber-600',
          },
          {
            icon: Flame,
            label: 'Longest Streak',
            value: `${profile?.longestStreak || 0} days`,
            color: 'bg-orange-500/10 text-orange-600',
          },
          {
            icon: BookOpen,
            label: 'Courses Completed',
            value: stats?.completedCourses || 0,
            color: 'bg-green-500/10 text-green-600',
          },
          {
            icon: Award,
            label: 'Achievements',
            value: `${stats?.achievements || 0}/${stats?.totalAchievements || 0}`,
            color: 'bg-purple-500/10 text-purple-600',
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
      )}

      {/* Level Progress - Only show for students */}
      {isStudent && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Level Progress</h3>
              <span className="text-sm font-bold text-primary">
                Level {profile?.level || 1}
              </span>
            </div>
            <Progress
              value={((profile?.xp || 0) % 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {(profile?.xp || 0) % 100} / 100 XP to Level {(profile?.level || 1) + 1}
            </p>
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Achievements - Only show for students */}
      {isStudent && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Achievements</h3>
              <Badge variant="secondary" className="rounded-full text-xs">
                {stats?.achievements || 0}/{stats?.totalAchievements || 0}
              </Badge>
            </div>

            {achievements.length === 0 ? (
              <div className="text-center py-6">
                <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No achievements yet. Start learning to earn some!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{achievement.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Certificates - Only show for students */}
      {isStudent && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Certificates</h3>
              <Badge variant="secondary" className="rounded-full text-xs">
                {certificates.length}
              </Badge>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-6">
                <ScrollText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Complete courses to earn certificates!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      playClick()
                      navigateTo('certificate', { certificateId: cert.id })
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <ScrollText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{cert.courseName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Earned {new Date(cert.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      )}

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Settings</h3>

            <div className="space-y-4">
              {/* Language Preference */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-xs text-muted-foreground">English</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <Separator />

              {/* Notifications */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Daily reminders & updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <Separator />

                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Achievements, level-ups & digests</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotificationsEnabled}
                    onCheckedChange={async (checked) => {
                      setEmailNotificationsEnabled(checked)
                      try {
                        const res = await fetch('/api/user/settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ emailNotifications: checked }),
                        })
                        if (res.ok) {
                          toast.success(checked ? 'Email notifications enabled' : 'Email notifications disabled')
                        }
                      } catch {
                        toast.error('Failed to update settings')
                        setEmailNotificationsEnabled(!checked)
                      }
                    }}
                  />
                </div>

                <Separator />

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sound Effects</p>
                    <p className="text-xs text-muted-foreground">In-app sounds</p>
                  </div>
                </div>
                <Switch
                  checked={soundEffectsEnabled}
                  onCheckedChange={(checked) => {
                    setSoundEffectsEnabled(checked)
                    toggleSoundMute()
                  }}
                />
              </div>

              <Separator />

              {/* Sound Settings */}
              <SoundSettings />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="border-destructive/20 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete your account? This action cannot be undone. All your data including progress, courses, and achievements will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">Type <strong>DELETE</strong> to confirm</Label>
                      <Input
                        id="confirm-delete"
                        value={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.value)}
                        placeholder="DELETE"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          setDeleting(true)
                          try {
                            const res = await fetch('/api/user/delete', { method: 'DELETE' })
                            if (res.ok) {
                              window.location.href = '/?deleted=true'
                            } else {
                              const data = await res.json()
                              toast.error(data.error || 'Failed to delete account')
                            }
                          } catch (error) {
                            toast.error('Failed to delete account')
                          } finally {
                            setDeleting(false)
                          }
                        }}
                        disabled={confirmDelete !== 'DELETE' || deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? 'Deleting...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

        </TabsContent>
        <TabsContent value="friends" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Following & Followers List */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Following ({following.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {friendsLoading ? <Skeleton className="h-20 w-full" /> : (
                      following.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">You are not following anyone yet.</p>
                      ) : (
                        following.map(friend => (
                          <div key={friend.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {friend.avatar ? <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" /> : friend.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{friend.name}</p>
                                <p className="text-xs text-muted-foreground">Lvl {friend.level}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleUnfollow(friend.id)}>
                              Unfollow
                            </Button>
                          </div>
                        ))
                      )
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Followers ({followers.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {friendsLoading ? <Skeleton className="h-20 w-full" /> : (
                      followers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No followers yet.</p>
                      ) : (
                        followers.map(follower => (
                          <div key={follower.id} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                              {follower.avatar ? <img src={follower.avatar} alt={follower.name} className="w-full h-full rounded-full object-cover" /> : follower.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{follower.name}</p>
                              <p className="text-xs text-muted-foreground">Lvl {follower.level}</p>
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions */}
              <div className="space-y-6">
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-500" />
                      Suggested Friends
                    </CardTitle>
                    <CardDescription>Find learners in the same league!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {friendsLoading ? <Skeleton className="h-40 w-full" /> : (
                      suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No suggestions right now.</p>
                      ) : (
                        suggestions.map(suggested => (
                          <div key={suggested.id} className="flex items-center justify-between p-2 rounded-xl bg-background shadow-sm border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {suggested.avatar ? <img src={suggested.avatar} alt={suggested.name} className="w-full h-full rounded-full object-cover" /> : suggested.name[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{suggested.name}</p>
                                <p className="text-xs text-muted-foreground">{suggested.league} League</p>
                              </div>
                            </div>
                            <Button size="sm" onClick={() => handleFollow(suggested.id)} className="shrink-0 bg-blue-500 hover:bg-blue-600 text-white">
                              Follow
                            </Button>
                          </div>
                        ))
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea
                id="edit-bio"
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={300}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {editBio.length}/300
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label>Email</Label>
              <span className="text-sm text-muted-foreground">{profile?.email}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-1.5" />
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={saving || !editName.trim() || editName.trim() === profile?.name && editBio.trim() === (profile?.bio || '')}
                onClick={async () => {
                  setSaving(true)
                  try {
                    const res = await fetch('/api/user/profile', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: editName.trim(), bio: editBio.trim() || null }),
                    })
                    if (res.ok) {
                      const data = await res.json()
                      setProfile((prev: any) => prev ? { ...prev, name: data.user.name, bio: data.user.bio } : prev)
                      // Update auth store too
                      useAuthStore.getState().updateUser({ name: data.user.name, bio: data.user.bio })
                      playCorrect()
                      toast.success('Profile updated successfully!')
                      setEditDialogOpen(false)
                    } else {
                      playWrong()
                      toast.error('Failed to update profile')
                    }
                  } catch (error) {
                    playWrong()
                    toast.error('Failed to update profile')
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
