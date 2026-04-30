'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: (filters?: { type?: string; unread?: boolean }) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()

  const fetchNotifications = useCallback(async (filters?: { type?: string; unread?: boolean }) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.set('type', filters.type)
      if (filters?.unread) params.set('unread', 'true')
      const res = await fetch(`/api/notifications?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/read/${id}`, { method: 'POST' })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id && notifications.length === 0 && !loading) {
      fetchNotifications()
    }
  }, [user?.id, notifications.length, loading])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
  }
}
