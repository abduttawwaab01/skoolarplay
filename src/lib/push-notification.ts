/**
 * Push Notification Utility
 * Manages push subscriptions and provides helper functions for push notifications.
 * Requires VAPID keys configured in environment variables.
 */

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

let vapidPublicKey: string | null = null

async function getVapidPublicKey(): Promise<string | null> {
  if (vapidPublicKey) return vapidPublicKey
  
  try {
    const res = await fetch('/api/push/vapid-key')
    if (res.ok) {
      const data = await res.json()
      vapidPublicKey = data.vapidKey || null
      return vapidPublicKey
    }
  } catch {}
  return null
}

/**
 * Subscribe a user to push notifications
 */
export async function subscribeUser(
  subscription: PushSubscriptionData
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    })

    if (res.ok) {
      return { success: true }
    }

    const data = await res.json()
    return { success: false, error: data.error || 'Failed to subscribe' }
  } catch {
    return { success: false, error: 'Network error' }
  }
}

/**
 * Unsubscribe a user from push notifications
 */
export async function unsubscribeUser(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    })

    if (res.ok) {
      return { success: true }
    }

    const data = await res.json()
    return { success: false, error: data.error || 'Failed to unsubscribe' }
  } catch {
    return { success: false, error: 'Network error' }
  }
}

/**
 * Request push notification permission from the browser
 * and subscribe if granted
 */
export async function requestNotificationPermission(): Promise<{
  granted: boolean
  subscription?: PushSubscription | null
  error?: string
}> {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notifications not supported in this browser' }
  }

  if (!('serviceWorker' in navigator)) {
    return { granted: false, error: 'Service workers not supported in this browser' }
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    return { granted: false, error: 'Notification permission denied' }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      return { granted: true, subscription }
    }

    const vapidKey = await getVapidPublicKey()
    if (!vapidKey) {
      return { granted: true, subscription: null, error: 'Push notifications not configured' }
    }

    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    const subData = newSubscription.toJSON()
    if (subData.endpoint && subData.keys) {
      await subscribeUser({
        endpoint: subData.endpoint,
        keys: {
          p256dh: subData.keys.p256dh!,
          auth: subData.keys.auth!,
        },
      })
    }

    return { granted: true, subscription: newSubscription }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to subscribe'
    return { granted: false, error: message }
  }
}

/**
 * Send push notification (admin only - triggers server-side broadcast)
 * This creates in-app notifications and would trigger actual push in production
 */
export async function sendPushNotification(params: {
  title: string
  message: string
  userIds?: string[]
  url?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/push/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (res.ok) {
      return { success: true }
    }

    const data = await res.json()
    return { success: false, error: data.error || 'Failed to send notification' }
  } catch {
    return { success: false, error: 'Network error' }
  }
}
