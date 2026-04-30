'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const { navigateTo, replaceWith, params } = useAppStore()
  const searchParams = useSearchParams()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Extract token from multiple sources
  useEffect(() => {
    const extractToken = async () => {
      // 1. Check URL params (from redirect)
      const urlToken = searchParams?.get('token')
      if (urlToken) {
        setToken(urlToken)
        setIsValidating(false)
        return
      }

      // 2. Check URL params (alternative param name)
      const accessToken = searchParams?.get('accessToken')
      if (accessToken) {
        setToken(accessToken)
        setIsValidating(false)
        return
      }

      // 3. Check sessionStorage (from auth/reset-password page)
      const storedToken = sessionStorage.getItem('supabase_reset_token')
      if (storedToken) {
        setToken(storedToken)
        // Clear the stored token
        sessionStorage.removeItem('supabase_reset_token')
        sessionStorage.removeItem('supabase_refresh_token')
        setIsValidating(false)
        return
      }

      // 4. Check app store params
      const storeToken = params?.token as string | undefined
      if (storeToken) {
        setToken(storeToken)
        setIsValidating(false)
        return
      }

      // No token found
      setIsValidating(false)
    }

    extractToken()
  }, [searchParams, params])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error('No reset token provided. Please request a new password reset link.')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      toast.error('Password must contain at least one letter')
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least one number')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken: token, // Send as accessToken, not token
          newPassword 
        }),
      })

      if (res.ok) {
        setIsSuccess(true)
        toast.success('Password reset successfully!')
        setTimeout(() => {
          replaceWith('login')
        }, 2500)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12 bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-green-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative"
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 md:p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3"
              >
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl font-bold">Reset Password</h1>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Enter your new password below
              </p>
            </div>

            {!token && !isSuccess ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Invalid or Expired Link</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    This password reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigateTo('forgot-password')}
                >
                  Request New Link
                </Button>
              </div>
            ) : isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Password Reset!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your password has been successfully reset. Redirecting to login...
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => replaceWith('login')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 8 chars, letter + number"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-muted/50 pl-10 pr-10"
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 8 && (
                    <p className="text-xs text-destructive">Must be at least 8 characters</p>
                  )}
                  {newPassword && newPassword.length >= 8 && !/[a-zA-Z]/.test(newPassword) && (
                    <p className="text-xs text-destructive">Must contain at least one letter</p>
                  )}
                  {newPassword && newPassword.length >= 8 && /[a-zA-Z]/.test(newPassword) && !/[0-9]/.test(newPassword) && (
                    <p className="text-xs text-destructive">Must contain at least one number</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-muted/50 pl-10 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                  {confirmPassword && confirmPassword === newPassword && (
                    <p className="text-xs text-green-600">Passwords match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword !== confirmPassword ||
                    newPassword.length < 8
                  }
                  className="w-full h-12 rounded-xl font-semibold text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}

            {!isSuccess && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigateTo('login')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3 inline mr-1" />
                  Back to Login
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
