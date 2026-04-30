'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, BookOpen, RefreshCw, Gift, X, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'

interface Announcement {
  id: string
  title: string
  content: string | null
  bannerType: string
  imageUrl: string | null
  targetUrl: string | null
  type: string
  priority: number
  dismissedBy: string
}

const bannerConfig: Record<string, {
  border: string
  bg: string
  icon: React.ElementType
  badge: string
  badgeColor: string
  iconBg: string
  iconColor: string
  gradient: string
}> = {
  FEATURE: {
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-emerald-950/40',
    icon: Sparkles,
    badge: 'NEW FEATURE',
    badgeColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/5 to-transparent',
  },
  COURSE: {
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-950/40 dark:via-blue-950/20 dark:to-blue-950/40',
    icon: BookOpen,
    badge: 'NEW COURSE',
    badgeColor: 'bg-blue-500 hover:bg-blue-600 text-white',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/5 to-transparent',
  },
  UPDATE: {
    border: 'border-purple-300 dark:border-purple-700',
    bg: 'bg-gradient-to-r from-purple-50 via-white to-purple-50 dark:from-purple-950/40 dark:via-purple-950/20 dark:to-purple-950/40',
    icon: RefreshCw,
    badge: 'UPDATE',
    badgeColor: 'bg-purple-500 hover:bg-purple-600 text-white',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500/5 to-transparent',
  },
  PROMO: {
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-amber-950/40 dark:via-amber-950/20 dark:to-amber-950/40',
    icon: Gift,
    badge: 'PROMO',
    badgeColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/5 to-transparent',
  },
}

const STORAGE_KEY = 'skoolarplay_dismissed_announcements'

function getLocalDismissedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return new Set(JSON.parse(stored) as string[])
  } catch { /* ignore */ }
  return new Set()
}

function addLocalDismissedId(id: string) {
  const ids = getLocalDismissedIds()
  ids.add(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
}

function isAnnouncementDismissed(ann: Announcement, userId: string | undefined): boolean {
  const localDismissed = getLocalDismissedIds()
  if (localDismissed.has(ann.id)) return true
  try {
    const serverDismissed: string[] = JSON.parse(ann.dismissedBy || '[]')
    if (userId && serverDismissed.includes(userId)) return true
  } catch { /* ignore */ }
  return false
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissingIds, setDismissingIds] = useState<Set<string>>(new Set())
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/announcements')
        if (res.ok && !cancelled) {
          const data = await res.json()
          setAnnouncements(data.announcements || [])
        }
      } catch {
        // Silent fail
      }
    }

    load()
    const id = setInterval(load, 60000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // Compute current announcement to show (first non-dismissed, non-dismissing)
  const currentAnnouncement = useMemo(() => {
    return announcements.find(
      (a) => !isAnnouncementDismissed(a, user?.id) && !dismissingIds.has(a.id)
    )
  }, [announcements, user?.id, dismissingIds])

  const config = currentAnnouncement
    ? bannerConfig[currentAnnouncement.bannerType] || bannerConfig.FEATURE
    : null

  const handleDismiss = async () => {
    if (!currentAnnouncement) return

    setDismissingIds((prev) => new Set(prev).add(currentAnnouncement.id))
    addLocalDismissedId(currentAnnouncement.id)

    try {
      await fetch('/api/announcements/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId: currentAnnouncement.id }),
      })
    } catch {
      // Silent fail
    }

    // Clean up dismissing state after animation
    setTimeout(() => {
      setDismissingIds((prev) => {
        const next = new Set(prev)
        next.delete(currentAnnouncement.id)
        return next
      })
    }, 400)
  }

  const handleLearnMore = () => {
    if (!currentAnnouncement?.targetUrl) return
    if (currentAnnouncement.targetUrl.startsWith('http')) {
      window.open(currentAnnouncement.targetUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = currentAnnouncement.targetUrl
    }
  }

  if (!currentAnnouncement || !config) return null

  const IconComp = config.icon

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentAnnouncement.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className={`relative border-b-2 ${config.border} ${config.bg}`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} pointer-events-none`} />

          <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
            <div className="flex items-center gap-3">
              <div className={`shrink-0 p-1.5 rounded-lg ${config.iconBg}`}>
                <IconComp className={`w-4 h-4 ${config.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${config.badgeColor} text-[10px] px-1.5 py-0 font-semibold tracking-wide shrink-0`}>
                    {config.badge}
                  </Badge>
                  <span className="text-sm font-semibold truncate">
                    {currentAnnouncement.title}
                  </span>
                </div>
                {currentAnnouncement.content && (
                  <div className="w-full overflow-visible mt-0.5 hidden sm:block">
                    <div className="w-[calc(100vw-20rem)] overflow-hidden">
                      <span className="inline-block animate-marquee whitespace-nowrap">
                        {currentAnnouncement.content}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {currentAnnouncement.imageUrl && (
                <img
                  src={currentAnnouncement.imageUrl}
                  alt=""
                  className="hidden md:block w-16 h-10 rounded-lg object-cover shrink-0 border border-border/50"
                />
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {currentAnnouncement.targetUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-7 px-2.5 text-xs font-medium ${config.iconColor} hover:${config.iconBg} gap-1`}
                    onClick={handleLearnMore}
                  >
                    Learn More
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={handleDismiss}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
