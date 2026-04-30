'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  Search,
  Bell,
  Gem,
  Zap,
  Flame,
  Heart,
  Home,
  BookOpen,
  Store,
  Trophy,
  User,
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Volume2,
  VolumeX,
  Menu,
  X,
  WifiOff,
  RefreshCw,
  Users,
  FileText,
  PlusCircle,
  Loader2,
  Gamepad2,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Slider } from '@/components/ui/slider'
import { useSoundStore } from '@/store/sound-store'
import { SoundEnablePrompt } from '@/components/shared/sound-enable-prompt'
import { NotificationCenter } from '@/components/shared/notification-center'
import { AIAssistant } from '@/components/shared/ai-assistant'
import { AnnouncementBanner } from '@/components/shared/announcement-banner'
import { useServiceWorker, useOfflineStatus } from '@/hooks/use-service-worker'
import { toast } from 'sonner'

const REFILL_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour in milliseconds

function StatBadge({ icon: Icon, value, label, color, onClick }: { icon: React.ElementType; value: number | string; label: string; color?: string; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
      title={label}
      onClick={onClick}
    >
      <Icon className={`w-4 h-4 ${color || 'text-primary'}`} />
      <span className="text-sm font-bold">{value}</span>
    </motion.button>
  )
}

function HeartsRefillButton() {
  const { user, updateHearts, updateUser } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [canRefill, setCanRefill] = useState(false)
  const [isRefilling, setIsRefilling] = useState(false)
  const [remainingHours, setRemainingHours] = useState(0)
  const [remainingMinutes, setRemainingMinutes] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [heartCount, setHeartCount] = useState(user?.hearts || 0)
  const [maxHearts, setMaxHearts] = useState(user?.maxHearts || 5)
  const [isFull, setIsFull] = useState(false)
  const autoRefillAttempted = useRef(false)

  const checkRefillStatus = useCallback(async () => {
    if (!user) return
    
    // Reset auto-refill flag when manually checking status
    autoRefillAttempted.current = false
    
    setHeartCount(user.hearts)
    setMaxHearts(user.maxHearts)

    if (user.hearts >= (user.isPremium ? 999 : user.maxHearts)) {
      setCanRefill(false)
      setIsFull(true)
      return
    }

    try {
      const res = await fetch('/api/user/heart-refill')
      if (res.ok) {
        const data = await res.json()
        setCanRefill(data.canRefill)
        setIsFull(data.isFull || false)
        setRemainingHours(data.remainingHours || 0)
        setRemainingMinutes(data.remainingMinutes || 0)
        setRemainingSeconds(data.remainingSeconds || 0)
      }
    } catch (error) {
      console.error('Failed to check refill status:', error)
    }
  }, [user])

  useEffect(() => {
    checkRefillStatus()
    const interval = setInterval(checkRefillStatus, 30000)
    return () => clearInterval(interval)
  }, [checkRefillStatus])

  useEffect(() => {
    if (!canRefill && (remainingHours > 0 || remainingMinutes > 0 || remainingSeconds > 0)) {
      const timer = setTimeout(() => {
        if (remainingSeconds > 0) {
          setRemainingSeconds(prev => prev - 1)
        } else if (remainingMinutes > 0) {
          setRemainingMinutes(prev => prev - 1)
          setRemainingSeconds(59)
        } else if (remainingHours > 0) {
          setRemainingHours(prev => prev - 1)
          setRemainingMinutes(59)
          setRemainingSeconds(59)
        }
      }, 1000)
      return () => clearTimeout(timer)
    } else if (remainingHours === 0 && remainingMinutes === 0 && remainingSeconds === 0 && !autoRefillAttempted.current) {
      // Timer reached 0 - try auto-refill once (API will validate if cooldown is complete)
      autoRefillAttempted.current = true
      fetch('/api/user/heart-refill', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHeartCount(data.hearts)
            setIsFull(true)
            setCanRefill(false)
            updateUser({ hearts: data.hearts, maxHearts: data.maxHearts })
            updateHearts(data.hearts, data.maxHearts)
            toast.success(data.message || 'Hearts automatically refilled!')
          }
        })
        .catch(() => {})
        .finally(() => {
          setTimeout(() => { autoRefillAttempted.current = false }, 5000) // Reset after 5 seconds
        })
    }
  }, [canRefill, remainingHours, remainingMinutes, remainingSeconds, checkRefillStatus, updateUser, updateHearts])

  const handleRefill = async () => {
    if (isFull) {
      return
    }
    
    if (!canRefill || isRefilling) {
      navigateTo('shop')
      return
    }
    
    setIsRefilling(true)
    try {
      const res = await fetch('/api/user/heart-refill', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        setHeartCount(data.hearts)
        setIsFull(true)
        setCanRefill(false)
        updateUser({ hearts: data.hearts, maxHearts: data.maxHearts })
        updateHearts(data.hearts, data.maxHearts)
        toast.success(data.message || 'All hearts refilled!')
        checkRefillStatus()
      } else {
        toast.error(data.error || 'Failed to refill hearts')
        checkRefillStatus()
      }
    } catch (error) {
      toast.error('Failed to refill hearts')
    } finally {
      setIsRefilling(false)
    }
  }

  const formatTime = () => {
    if (remainingHours > 0) {
      return `${remainingHours}h ${remainingMinutes}m`
    }
    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!user) return null

  const effectiveMaxHearts = user.isPremium ? 999 : maxHearts

  return (
    <motion.button
      whileHover={{ scale: canRefill ? 1.05 : 1 }}
      whileTap={{ scale: canRefill ? 0.95 : 1 }}
      onClick={handleRefill}
      disabled={isFull || (!canRefill && !isRefilling)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
        isFull
          ? 'bg-green-100 dark:bg-green-900/30 cursor-default'
          : canRefill
          ? 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 cursor-pointer'
          : 'bg-muted/50 cursor-not-allowed opacity-80'
      }`}
      title={isFull ? 'Hearts are full' : canRefill ? 'Refill all hearts' : `Next refill in ${formatTime()}`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(effectiveMaxHearts, 5) }).map((_, i) => (
          <Heart
            key={i}
            className={`w-4 h-4 ${
              i < heartCount
                ? 'fill-red-500 text-red-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
      {isRefilling ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : isFull ? (
        <span className="text-xs text-green-600 font-medium">Full</span>
      ) : canRefill ? (
        <PlusCircle className="w-4 h-4 text-red-500" />
      ) : (
        <span className="text-xs text-muted-foreground font-medium">
          {formatTime()}
        </span>
      )}
    </motion.button>
  )
}

function MobileNav() {
  const { currentPage, navigateTo } = useAppStore()
  const { user } = useAuthStore()

  const navItems = [
    { icon: Home, label: 'Home', page: 'dashboard' as const },
    { icon: BookOpen, label: 'Courses', page: 'courses' as const },
    { icon: Gamepad2, label: 'Games', page: 'game-center' as const },
    { icon: Store, label: 'Shop', page: 'shop' as const },
    { icon: Trophy, label: 'Ranks', page: 'leaderboard' as const },
    { icon: User, label: 'Profile', page: 'profile' as const },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm md:hidden safe-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.page
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateTo(item.page)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors min-w-[56px] touch-target ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function SoundToggle() {
  const { isMuted, sfxVolume, toggleMute, setSfxVolume } = useSoundStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Sound Settings</span>
          <button
            onClick={toggleMute}
            className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 font-medium"
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Effects</span>
              <span className="text-[10px] text-muted-foreground">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <Slider
              value={[sfxVolume * 100]}
              min={0}
              max={100}
              step={1}
              disabled={isMuted}
              onValueChange={([v]) => setSfxVolume(v / 100)}
              className="w-full"
            />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TopNavbar() {
  const { user, logout } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'SP'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold hidden sm:block text-green-gradient">
            SkoolarPlay
          </span>
        </motion.button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, topics..."
              className="pl-9 bg-muted/50 border-0 rounded-full focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile search toggle */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="flex md:hidden items-center mx-2 overflow-hidden"
            >
              <Input
                placeholder="Search..."
                className="w-48 bg-muted/50 border-0 rounded-full text-sm"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side stats and actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Gems */}
          <StatBadge icon={Gem} value={user?.gems || 0} label="Gems" color="text-yellow-500" onClick={() => navigateTo('shop')} />

          {/* XP */}
          <StatBadge icon={Zap} value={user?.xp || 0} label="XP" color="text-amber-500" onClick={() => navigateTo('shop')} />

          {/* Streak */}
          <div className="hidden sm:block">
            <StatBadge icon={Flame} value={user?.streak || 0} label="Streak" color="text-orange-500" onClick={() => navigateTo('shop')} />
          </div>

          {/* Hearts with refill */}
          <HeartsRefillButton />

          {/* Notification bell */}
          <NotificationCenter />

          {/* Sound toggle */}
          <SoundToggle />

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <Avatar className="w-8 h-8 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {user?.role === 'ADMIN' && (
                  <Badge variant="default" className="mt-1 text-xs">Admin</Badge>
                )}
                {user?.role === 'TEACHER' && (
                  <Badge variant="outline" className="mt-1 text-xs">Teacher</Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              
              {/* ADMIN MENU - Show only for admins */}
              {user?.role === 'ADMIN' ? (
                <>
                  <DropdownMenuItem onClick={() => navigateTo('admin')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('admin-settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo('profile')}>
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigateTo('landing') }} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
              <DropdownMenuItem onClick={() => navigateTo('profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('notifications')}>
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('feed')}>
                <Users className="w-4 h-4 mr-2" />
                Activity Feed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('surveys')}>
                <FileText className="w-4 h-4 mr-2" />
                Surveys
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('study-groups')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Study Groups
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('share-gems')}>
                <Gem className="w-4 h-4 mr-2" />
                Gift Gems
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo('donate')}>
                <Heart className="w-4 h-4 mr-2" />
                Support Us
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigateTo('landing') }} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isOffline = useOfflineStatus()
  const { isUpdateAvailable, updateServiceWorker, isInProtectedSession } = useServiceWorker()
  const [showUpdateWarning, setShowUpdateWarning] = useState(false)

  useEffect(() => {
    if (isUpdateAvailable) {
      // Check if user is in protected session
      if (isInProtectedSession()) {
        // Show warning that update will happen after session
        toast.info(
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>A new version is available. Update will be applied after you finish your current session.</span>
          </div>,
          { duration: 5000 }
        )
        setShowUpdateWarning(true)
      } else {
        // Safe to update
        toast.success(
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>A new version is available!</span>
            <button
              onClick={() => {
                const success = updateServiceWorker()
                if (success) {
                  window.location.reload()
                }
              }}
              className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
            >
              Update Now
            </button>
          </div>,
          { duration: Infinity }
        )
      }
    }
  }, [isUpdateAvailable, updateServiceWorker, isInProtectedSession])

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-amber-500 text-amber-950 py-2 px-4 flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <TopNavbar />
      <AnnouncementBanner />
      <main className="pb-20 md:pb-4 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
      <SoundEnablePrompt />
      <AIAssistant />
    </div>
  )
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { navigateTo } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-green-gradient">
              SkoolarPlay
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigateTo('login')}
              className="rounded-full px-4"
            >
              Log In
            </Button>
            <Button
              onClick={() => navigateTo('register')}
              className="rounded-full px-4 bg-primary hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
