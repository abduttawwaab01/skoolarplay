'use client'

import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, Check, X, BookOpen, ArrowLeft, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { PublicLayout } from '@/components/layout/app-layout'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Has uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Has lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Has number', met: /[0-9]/.test(password) },
      { label: 'Has special character', met: /[^A-Za-z0-9]/.test(password) },
    ]
  }, [password])

  const strength = checks.filter((c) => c.met).length

  const strengthColor = strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-orange-500' : strength <= 3 ? 'bg-yellow-500' : strength <= 4 ? 'bg-lime-500' : 'bg-green-500'
  const strengthText = strength <= 1 ? 'Very Weak' : strength <= 2 ? 'Weak' : strength <= 3 ? 'Fair' : strength <= 4 ? 'Strong' : 'Very Strong'

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${strengthColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className={`text-xs font-medium ${strength >= 4 ? 'text-green-600' : strength >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
          {strengthText}
        </span>
      </div>
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            {check.met ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <X className="w-3.5 h-3.5 text-muted-foreground/40" />
            )}
            <span className={`text-xs ${check.met ? 'text-green-600' : 'text-muted-foreground'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuthStore()
  const { navigateTo, replaceWith, goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playCorrect = useSoundEffect('levelUp')
  const playWrong = useSoundEffect('wrong')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Verification states
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Legal Modal States
  const [legalOpen, setLegalOpen] = useState(false)
  const [legalTitle, setLegalTitle] = useState('')
  const [legalText, setLegalText] = useState('')
  const [legalLoading, setLegalLoading] = useState(false)

  const openLegal = async (type: 'terms' | 'privacy') => {
    setLegalOpen(true)
    setLegalTitle(type === 'terms' ? 'Terms of Service' : 'Privacy Policy')
    setLegalLoading(true)
    try {
      const res = await fetch('/api/settings/legal')
      if (res.ok) {
        const data = await res.json()
        setLegalText(type === 'terms' ? data.termsOfService : data.privacyPolicy)
      } else {
        setLegalText('Failed to load document.')
      }
    } catch {
      setLegalText('Failed to load document.')
    } finally {
      setLegalLoading(false)
    }
  }

  const passwordMatch = password && confirmPassword && password === confirmPassword
  const passwordMismatch = !!(password && confirmPassword && password !== confirmPassword)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all filled
    if (newCode.every(digit => digit) && index === 5) {
      handleVerifyEmail(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyEmail = async (code?: string) => {
    const finalCode = code || verificationCode.join('')
    if (finalCode.length !== 6) {
      setVerificationError('Please enter all 6 digits')
      return
    }
    
    setVerifying(true)
    setVerificationError('')
    
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: finalCode, email: registeredEmail }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        playCorrect()
        toast.success('Email verified! You can now log in.')
        setTimeout(() => replaceWith('login'), 1500)
      } else {
        playWrong()
        setVerificationError(data.error || 'Invalid verification code')
      }
    } catch {
      playWrong()
      setVerificationError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const resendVerificationCode = async () => {
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      })
      
      if (res.ok) {
        toast.success('Verification code sent again!')
      } else {
        toast.error('Failed to resend code')
      }
    } catch {
      toast.error('Failed to resend code')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    playOpen()

    if (password !== confirmPassword) {
      return
    }

    const success = await register(name, email, password, referralCode)
    if (success) {
      playCorrect()
      setRegisteredEmail(email)
      setRegistrationSuccess(true)
      setShowVerification(true)
      toast.success("Account created! Please verify your email.")
    } else {
      playWrong()
    }
  }

  // Show email verification screen after registration
  if (showVerification || registrationSuccess) {
    return (
      <PublicLayout>
        <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-md relative"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8 text-center">
                {/* Back button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setShowVerification(false); setRegistrationSuccess(false) }} 
                  className="absolute top-4 left-4 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                
                <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We sent a 6-digit verification code to<br />
                  <span className="font-medium text-foreground">{registeredEmail}</span>
                </p>
                
                {/* Code input */}
                <div className="flex justify-center gap-2 mb-4">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-input rounded-lg focus:border-primary focus:outline-none"
                    />
                  ))}
                </div>
                
                {/* Error message */}
                {verificationError && (
                  <p className="text-red-500 text-sm mb-4">{verificationError}</p>
                )}
                
                {/* Verify button */}
                <Button 
                  onClick={() => handleVerifyEmail()}
                  disabled={verifying || verificationCode.some(d => !d)}
                  className="w-full mb-4"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
                
                {/* Resend code */}
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?{' '}
                  <button 
                    onClick={resendVerificationCode}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend
                  </button>
                </p>
                
                {/* Skip and login later */}
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    variant="ghost" 
                    onClick={() => replaceWith('login')}
                    className="w-full text-muted-foreground"
                  >
                    Verify Later - Go to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-yellow-500/5 blur-3xl" />
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
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3"
                >
                  <GraduationCap className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Start your learning journey today
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={playClick}
                    required
                    className="h-12 rounded-xl bg-muted/50"
                    autoComplete="name"
                  />
                </div>

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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={playClick}
                      required
                      className="h-12 rounded-xl bg-muted/50 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={playClick}
                    required
                    className={`h-12 rounded-xl bg-muted/50 ${passwordMatch ? 'border-green-500' : passwordMismatch ? 'border-destructive' : ''}`}
                    autoComplete="new-password"
                  />
                  {passwordMatch && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                  {passwordMismatch && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <X className="w-3 h-3" /> Passwords don&apos;t match
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Got a referral code?"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    onFocus={playClick}
                    className="h-12 rounded-xl bg-muted/50"
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); openLegal('terms'); }} className="text-primary hover:underline">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" onClick={(e) => { e.preventDefault(); openLegal('privacy'); }} className="text-primary hover:underline">Privacy Policy</button>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !name || !email || !password || !confirmPassword || !termsAccepted || passwordMismatch}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{' '}
                <button
                  onClick={() => navigateTo('login')}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </CardContent>
          </Card>

          {/* Educator Card */}
          <Card className="mt-4 border-0 shadow-md bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 cursor-pointer transition-colors" onClick={() => { playClick(); navigateTo('teacher-register') }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-900">I&apos;m an Educator</p>
                <p className="text-xs text-emerald-700/70">Create an educator account to start teaching</p>
              </div>
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
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

      {/* Legal Dialog */}
      <Dialog open={legalOpen} onOpenChange={setLegalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{legalTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 bg-muted/30 rounded-md whitespace-pre-wrap text-sm text-foreground/80 font-mono">
            {legalLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              legalText
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setLegalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  )
}
