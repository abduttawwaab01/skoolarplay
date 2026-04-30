'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthResetPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // This page handles the redirect from Supabase password reset email
    // Supabase sends users to: /auth/reset-password#access_token=xxx&...
    // We need to extract the token and redirect to the SPA
    
    const hash = window.location.hash.substring(1) // Remove the leading #
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const expiresIn = params.get('expires_in')
    const tokenType = params.get('token_type')

    if (accessToken) {
      // Store tokens in sessionStorage for the SPA to pick up
      sessionStorage.setItem('supabase_reset_token', accessToken)
      if (refreshToken) {
        sessionStorage.setItem('supabase_refresh_token', refreshToken)
      }
      
      // Redirect to the SPA reset-password page
      window.location.href = `/?reset-password=1&token=${encodeURIComponent(accessToken)}`
    } else {
      // No token in hash, redirect to forgot-password
      setError('Invalid or expired reset link')
      setTimeout(() => {
        window.location.href = '/?forgot-password=1'
      }, 2000)
    }
    
    setReady(true)
  }, [])

  if (ready && error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <h1 className="text-xl font-bold">Password Reset Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Processing password reset...</p>
      </div>
    </div>
  )
}
