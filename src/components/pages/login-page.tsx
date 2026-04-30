'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, BookOpen, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { PublicLayout } from '@/components/layout/app-layout'
import { useSoundEffect } from '@/hooks/use-sound'

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const { navigateTo, replaceWith } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playCorrect = useSoundEffect('levelUp')
  const playWrong = useSoundEffect('wrong')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [platformName, setPlatformName] = useState('SkoolarPlay')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [showResend, setShowResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    async function fetchPublicSettings() {
      try {
        const res = await fetch('/api/public/settings')
        if (res.ok) {
          const data = await res.json()
          setPlatformName(data.settings?.platformName || 'SkoolarPlay')
          setLogoUrl(data.settings?.loginPageLogoUrl || null)
        }
      } catch {
        // Use defaults
      }
    }
    fetchPublicSettings()
  }, [])

  useEffect(() => {
    if (error?.includes('verify')) {
      setShowResend(false)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setShowResend(false)
    setResendMessage('')
    playOpen()
    const success = await login(email, password)
    if (success) {
      playCorrect()
      // Get the user from auth store to determine redirect
      const user = useAuthStore.getState().user
      if (user?.role === 'ADMIN') {
        replaceWith('admin')
      } else if (user?.role === 'TEACHER') {
        replaceWith('teacher-dashboard')
      } else {
        replaceWith('dashboard')
      }
    } else {
      playWrong()
      if (error?.includes('verify')) {
        setShowResend(true)
      }
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Please enter your email address first')
      return
    }
    setResending(true)
    setResendMessage('')
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setResendMessage('Verification code sent! Check your inbox.')
      } else {
        setResendMessage(data.error || 'Failed to resend verification')
      }
    } catch {
      setResendMessage('An error occurred')
    } finally {
      setResending(false)
    }
  }

  const LogoComponent = logoUrl ? (
    <img 
      src={logoUrl} 
      alt={platformName}
      className="w-14 h-14 rounded-2xl object-contain bg-primary/10"
    />
  ) : (
    <GraduationCap className="w-8 h-8 text-primary-foreground" />
  )

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl" />
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
                  {LogoComponent}
                </motion.div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Sign in to continue learning
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Resend Verification - Show when user needs to verify */}
              {showResend && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm"
                >
                  <div className="flex flex-col gap-2">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Need to verify your email?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={handleResendVerification}
                        disabled={resending || !email}
                      >
                        {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend Code'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigateTo('verify-email')}
                      >
                        Enter Code
                      </Button>
                    </div>
                    {resendMessage && (
                      <p className={`text-xs ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                        {resendMessage}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={playClick}
                    required
                    className="h-12 rounded-xl bg-muted/50"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => { playClick(); navigateTo('forgot-password') }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={playClick}
                      required
                      className="h-12 rounded-xl bg-muted/50 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-card text-muted-foreground">or</span>
                </div>
              </div>

              {/* Register Link */}
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigateTo('register')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>

              {/* Educator Button */}
              <button
                onClick={() => { playClick(); navigateTo('teacher-login') }}
                className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">I&apos;m an Educator</span>
                <BookOpen className="w-4 h-4 text-emerald-600" />
              </button>
            </CardContent>
          </Card>

          {/* Back link */}
          <p className="text-center mt-4">
            <button
              onClick={() => navigateTo('landing')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </button>
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  )
}
