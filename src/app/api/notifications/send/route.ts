import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// Simple in-memory rate limiter: max 5 notifications per user per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }
  entry.count++
  return false
}

// Clean up stale entries every 5 minutes (guarded to prevent duplicates on hot reload)
if (typeof globalThis !== 'undefined') {
  (globalThis as Record<string, unknown>).__notifyRateLimitCleanup ??= setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) rateLimitMap.delete(key)
    }
  }, 5 * 60 * 1000)
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, message, type, link } = body
    const userId = body.userId || session.user.id

    // Only allow admins to send to other users
    if (userId !== session.user.id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cannot send notifications to other users' }, { status: 403 })
    }

    // Rate limiting check
    if (isRateLimited(userId)) {
      return NextResponse.json({ error: 'Too many notifications. Please wait a minute.' }, { status: 429 })
    }

    if (!title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedTitle = typeof title === 'string' ? title.slice(0, 200).trim() : ''
    const sanitizedMessage = typeof message === 'string' ? message.slice(0, 1000).trim() : ''

    if (!sanitizedTitle || !sanitizedMessage) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    const validTypes = ['INFO', 'ACHIEVEMENT', 'QUEST', 'SOCIAL', 'SYSTEM', 'PROMO', 'REWARD']
    const notificationType = validTypes.includes(type) ? type : 'INFO'

    const notification = await db.notification.create({
      data: {
        userId,
        title: sanitizedTitle,
        message: sanitizedMessage,
        type: notificationType,
        link: link || null,
      },
    })

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
