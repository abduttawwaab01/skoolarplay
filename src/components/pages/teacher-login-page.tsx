'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { PublicLayout } from '@/components/layout/app-layout'
import { InvestorCarousel } from '@/components/shared/investor-carousel'
import { useSoundEffect } from '@/hooks/use-sound'

export function TeacherLoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const { navigateTo, replaceWith } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playCorrect = useSoundEffect('levelUp')
  const playWrong = useSoundEffect('wrong')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    playOpen()
    const success = await login(email, password)
    if (success) {
      playCorrect()
      // Navigate based on role
      const currentUser = useAuthStore.getState().user
      if (currentUser?.role === 'ADMIN') {
        replaceWith('admin')
      } else if (currentUser?.role === 'TEACHER') {
        replaceWith('teacher-dashboard')
      } else {
        replaceWith('dashboard')
      }
    } else {
      playWrong()
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl" />
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
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center mb-3"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold">Educator Sign In</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  I&apos;m an Educator
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-login-email">Email</Label>
                  <Input
                    id="teacher-login-email"
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
                    <Label htmlFor="teacher-login-password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={playClick}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="teacher-login-password"
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
                  className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Sign In as Educator
                    </>
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

              {/* Links */}
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  New here?{' '}
                  <button
                    onClick={() => navigateTo('teacher-register')}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Register as an Educator
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  Student?{' '}
                  <button
                    onClick={() => navigateTo('login')}
                    className="text-primary font-semibold hover:underline"
                  >
                    Sign in as Student
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Investor logos */}
          <div className="mt-8">
            <InvestorCarousel />
          </div>

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
