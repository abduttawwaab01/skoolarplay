'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Trophy,
  Swords,
  Users,
  Settings,
  Megaphone,
  CheckCheck,
  Trash2,
  Filter,
  Inbox,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  ACHIEVEMENT: { icon: Trophy, color: 'bg-yellow-500/10 text-yellow-600', label: 'Achievement' },
  QUEST: { icon: Swords, color: 'bg-purple-500/10 text-purple-600', label: 'Quest' },
  SOCIAL: { icon: Users, color: 'bg-blue-500/10 text-blue-600', label: 'Social' },
  SYSTEM: { icon: Settings, color: 'bg-gray-500/10 text-gray-600', label: 'System' },
  PROMO: { icon: Megaphone, color: 'bg-green-500/10 text-green-600', label: 'Promo' },
  INFO: { icon: Bell, color: 'bg-primary/10 text-primary', label: 'Info' },
}

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'ACHIEVEMENT', label: 'Achievements' },
  { key: 'QUEST', label: 'Quests' },
  { key: 'SOCIAL', label: 'Social' },
  { key: 'SYSTEM', label: 'System' },
]

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const { goBack } = useAppStore()
  const { notifications, loading, fetchNotifications, markAsRead, markAllRead, deleteNotification } = useNotifications()
  const playNotification = useSoundEffect('notification')
  const playClick = useSoundEffect('click')
  const playSlide = useSoundEffect('slide')

  const handleVisitLink = (notification: Notification) => {
    if (!notification.link) return
    playClick()
    // Track ad click for announcements with links
    if (notification.type === 'PROMO' || notification.type === 'INFO') {
      fetch('/api/ads/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: notification.id }),
      }).catch(() => { /* silent fail */ })
    }
    if (!notification.isRead) markAsRead(notification.id)
    if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
      window.open(notification.link, '_blank', 'noopener,noreferrer')
    } else {
      const { navigateTo } = useAppStore.getState()
      navigateTo(notification.link as any)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !n.isRead
    return n.type === activeFilter
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="rounded-full text-xs h-8"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {filterTabs.map((tab) => {
              const count = tab.key === 'all'
                ? notifications.length
                : tab.key === 'unread'
                  ? unreadCount
                  : notifications.filter((n) => n.type === tab.key).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs ${activeFilter === tab.key ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="text-5xl mb-4">
                {activeFilter === 'unread' ? '📭' : '🎉'}
              </div>
              <h3 className="font-semibold mb-1">
                {activeFilter === 'unread' ? 'All caught up!' : 'No notifications'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'unread'
                  ? "You've read all your notifications."
                  : 'No notifications in this category yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.INFO
            const Icon = config.icon
            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
              >
                <Card className={`overflow-hidden transition-colors hover:shadow-sm ${!notification.isRead ? 'border-primary/20 bg-primary/[0.02]' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold">{notification.title}</p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { playSlide(); markAsRead(notification.id) }}
                                className="w-7 h-7 rounded-full"
                              >
                                <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="w-7 h-7 rounded-full hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</span>
                          <Badge variant="outline" className="text-[10px] rounded-full h-4 px-1.5">
                            {config.label}
                          </Badge>
                          {notification.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisitLink(notification)}
                              className="ml-auto h-7 px-2 text-xs text-primary hover:text-primary/80 rounded-full gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {notification.link.startsWith('http') ? 'Visit' : 'Open'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </motion.div>
    </div>
  )
}
