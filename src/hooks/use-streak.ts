'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Snowflake, Flame } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'

export function useStreak() {
  const { user, updateUser } = useAuthStore()
  const [hasFreeze, setHasFreeze] = useState(false)
  const [freezeUsed, setFreezeUsed] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkStreakFreeze = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const res = await fetch('/api/streak/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      setHasFreeze(data.hasFreeze)

      if (data.used) {
        setFreezeUsed(true)
        toast.success(data.message, {
          duration: 5000,
          icon: '❄️',
        })
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    // Check streak freeze on mount
    if (user?.id) {
      checkStreakFreeze()
    }
  }, [user?.id, checkStreakFreeze])

  return {
    hasFreeze,
    freezeUsed,
    loading,
    checkStreakFreeze,
  }
}
