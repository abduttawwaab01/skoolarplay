import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedPaths = ['/api/admin']
const protectedPages = ['dashboard', 'course', 'profile', 'lesson', 'shop', 'leaderboard',
  'achievements', 'daily-challenge', 'analytics', 'learning-paths', 'vocabulary',
  'exam-hub', 'exam', 'ide', 'notifications', 'study-groups', 'study-group',
  'teacher-dashboard', 'teacher-course-create', 'teacher-payout', 'spin-wheel',
  'mystery-box', 'login-rewards', 'quests', 'boss-battle', 'certificate',
  'referral', 'share-gems', 'messages', 'feed', 'surveys', 'gem-history',
  'game-center', 'game-play']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is a protected API route
  const isProtectedApi = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedApi) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get('next-auth.session-token')?.value 
      || request.cookies.get('__Secure-next-auth.session-token')?.value
    
    // If no session token, return 401 for API routes (don't redirect)
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  // Let the request continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/admin/:path*',
  ],
}
