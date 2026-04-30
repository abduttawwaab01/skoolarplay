import { useEffect, useState, useCallback, useRef } from 'react'

interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  pendingReload: boolean
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    pendingReload: false,
  })

  const deferredReloadRef = useRef<(() => void) | null>(null)

  // Check if user is in a protected session (exam, lesson, etc.)
  const isInProtectedSession = useCallback((): boolean => {
    try {
      // Check for exam session
      const examSession = sessionStorage.getItem('exam-session-active')
      if (examSession) return true

      // Check for lesson session
      const lessonSession = sessionStorage.getItem('lesson-session-active')
      if (lessonSession) return true

      // Check for video lesson session
      const videoSession = sessionStorage.getItem('video-lesson-session-active')
      if (videoSession) return true

      return false
    } catch {
      return false
    }
  }, [])

  // Perform safe reload that respects protected sessions
  const safeReload = useCallback(() => {
    if (isInProtectedSession()) {
      // Set flag to reload after session ends
      setStatus(prev => ({ ...prev, pendingReload: true }))
      
      // Store the reload function for later
      deferredReloadRef.current = () => {
        window.location.reload()
      }
      
      console.log('[ServiceWorker] Reload deferred - user is in protected session')
      return false
    }
    
    // Safe to reload immediately
    window.location.reload()
    return true
  }, [isInProtectedSession])

  // Clear deferred reload when session ends
  const clearDeferredReload = useCallback(() => {
    if (deferredReloadRef.current) {
      // Small delay to ensure session is properly cleared
      setTimeout(() => {
        if (!isInProtectedSession() && deferredReloadRef.current) {
          console.log('[ServiceWorker] Executing deferred reload')
          deferredReloadRef.current()
          deferredReloadRef.current = null
        }
      }, 100)
    }
  }, [isInProtectedSession])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    
    if (!isSupported) {
      setTimeout(() => setStatus(prev => ({ ...prev, isSupported: false })), 0)
      return
    }

    setTimeout(() => setStatus(prev => ({ ...prev, isSupported: true })), 0)

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        setStatus(prev => ({
          ...prev,
          isRegistered: true,
          registration,
        }))

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus(prev => ({ ...prev, isUpdateAvailable: true }))
              }
            })
          }
        })

        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error)
      })

    // Handle controller change (new SW activated) - with protected session check
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      safeReload()
    })
  }, [safeReload])

  // Listen for session end events to trigger deferred reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If page is unloading and there's a pending reload, clear the deferred reload
      deferredReloadRef.current = null
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const updateServiceWorker = useCallback(() => {
    // Check if in protected session before updating
    if (isInProtectedSession()) {
      console.log('[ServiceWorker] Update blocked - user is in protected session')
      setStatus(prev => ({ ...prev, pendingReload: true }))
      return false
    }

    if (status.registration?.waiting) {
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    return true
  }, [status.registration, isInProtectedSession])

  const forceReloadNow = useCallback(() => {
    // Force reload even if in protected session (use with caution)
    window.location.reload()
  }, [])

  const executeDeferredReload = useCallback(() => {
    clearDeferredReload()
  }, [clearDeferredReload])

  const cancelDeferredReload = useCallback(() => {
    deferredReloadRef.current = null
    setStatus(prev => ({ ...prev, pendingReload: false }))
  }, [])

  const cacheCourses = useCallback(() => {
    if (status.registration?.active) {
      status.registration.active.postMessage({ type: 'CACHE_COURSES' })
    }
  }, [status.registration])

  const clearCache = useCallback(() => {
    if (status.registration?.active) {
      status.registration.active.postMessage({ type: 'CLEAR_CACHE' })
    }
  }, [status.registration])

  return {
    ...status,
    updateServiceWorker,
    forceReloadNow,
    executeDeferredReload,
    cancelDeferredReload,
    cacheCourses,
    clearCache,
    isInProtectedSession,
  }
}

export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setTimeout(() => setIsOffline(!navigator.onLine), 0)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}

// Helper function to check if any session is active (can be used anywhere)
export function isAnySessionActive(): boolean {
  try {
    return !!(
      sessionStorage.getItem('exam-session-active') ||
      sessionStorage.getItem('lesson-session-active') ||
      sessionStorage.getItem('video-lesson-session-active')
    )
  } catch {
    return false
  }
}
