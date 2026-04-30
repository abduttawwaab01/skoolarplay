'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Trophy,
  Swords,
  Users,
  Settings,
  Megaphone,
  Check,
  CheckCheck,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications, type Notification } from '@/hooks/use-notifications'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

const typeIcons: Record<string, React.ElementType> = {
  ACHIEVEMENT: Trophy,
  QUEST: Swords,
  SOCIAL: Users,
  SYSTEM: Settings,
  PROMO: Megaphone,
  INFO: Bell,
}

const typeColors: Record<string, string> = {
  ACHIEVEMENT: 'bg-yellow-500/10 text-yellow-600',
  QUEST: 'bg-purple-500/10 text-purple-600',
  SOCIAL: 'bg-blue-500/10 text-blue-600',
  SYSTEM: 'bg-gray-500/10 text-gray-600',
  PROMO: 'bg-green-500/10 text-green-600',
  INFO: 'bg-primary/10 text-primary',
}

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

function NotificationItem({ notification, onMarkRead }: { notification: Notification; onMarkRead: (id: string) => void }) {
  const { navigateTo } = useAppStore()
  const Icon = typeIcons[notification.type] || Bell
  const colorClass = typeColors[notification.type] || typeColors.INFO
  const playNotification = useSoundEffect('notification')

  const handleClick = () => {
    if (!notification.isRead) {
      playNotification()
      onMarkRead(notification.id)
    }
    if (notification.link) {
      // Track ad click for announcements with links
      if (notification.type === 'PROMO' || notification.type === 'INFO') {
        fetch('/api/ads/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adId: notification.id }),
        }).catch(() => { /* silent fail */ })
      }
      // If link starts with http, open in new tab; otherwise navigate internally
      if (notification.link.startsWith('http://') || notification.link.startsWith('https://')) {
        window.open(notification.link, '_blank', 'noopener,noreferrer')
      } else {
        navigateTo(notification.link as Parameters<typeof navigateTo>[0])
      }
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full text-left p-3 rounded-xl hover:bg-muted/50 transition-colors group ${
        !notification.isRead ? 'bg-primary/[0.03]' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium line-clamp-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </p>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</span>
            {notification.link && (
              <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                <ExternalLink className="w-2.5 h-2.5" />
                {notification.link.startsWith('http') ? 'Visit' : 'Open'}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'}`} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs text-primary font-medium">{unreadCount} new</span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllRead()}
                  className="text-xs text-primary hover:text-primary/80 rounded-full h-7 px-2"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications list */}
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-sm font-medium">You&apos;re all caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.slice(0, 15).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
