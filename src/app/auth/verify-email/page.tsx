'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const { navigateTo } = useAppStore()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed. The link may have expired.')
      }
    } catch {
      setStatus('error')
      setMessage('An error occurred during verification')
    }
  }, [])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please request a new one.')
      return
    }
    verifyEmail(token)
  }, [token, verifyEmail])

  const goToLogin = () => {
    navigateTo('login')
  }

  const goToRegister = () => {
    navigateTo('register')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
                <h2 className="text-xl font-bold mb-2">Verifying Email...</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                <p className="text-muted-foreground mb-6">
                  {message || 'Your email has been verified successfully!'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  You can now login with your account.
                </p>
                <Button className="w-full" onClick={goToLogin}>
                  Continue to Login
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground mb-6">
                  {message || 'The verification link is invalid or has expired.'}
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={goToLogin}>
                    Back to Login
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={goToRegister}
                  >
                    Create New Account
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
