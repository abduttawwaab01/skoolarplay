'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Eye, EyeOff, Loader2, Check, X, BookOpen, Award } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { PublicLayout } from '@/components/layout/app-layout'
import { InvestorCarousel } from '@/components/shared/investor-carousel'
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

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
]

const SUBJECT_OPTIONS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Computer Science',
  'French',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Geography',
  'History',
  'Literature in English',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Civic Education',
  'Agricultural Science',
  'Further Mathematics',
]

export function TeacherRegisterPage() {
  const { login, isLoading, error, clearError } = useAuthStore()
  const { navigateTo, replaceWith } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const playCorrect = useSoundEffect('levelUp')
  const playWrong = useSoundEffect('wrong')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const passwordMatch = password && confirmPassword && password === confirmPassword
  const passwordMismatch = !!(password && confirmPassword && password !== confirmPassword)

  const toggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    playOpen()

    if (password !== confirmPassword) return
    if (subjects.length === 0) return
    if (!experience) return

    try {
      const res = await fetch('/api/auth/teacher-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          subjects: subjects.join(', '),
          experience,
          bio: bio || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        playWrong()
        useAuthStore.setState({ error: data.error || 'Registration failed' })
        return
      }

      // Auto-login after successful registration
      playCorrect()
      const success = await login(email, password)
      if (success) {
        replaceWith('teacher-dashboard')
      } else {
        replaceWith('teacher-login')
      }
    } catch {
      playWrong()
      useAuthStore.setState({ error: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg relative"
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 md:p-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center mb-3"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold">Educator Registration</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Join SkoolarPlay and start teaching
                </p>
                {/* Free badge */}
                <Badge className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 text-xs font-medium">
                  <Award className="w-3 h-3 mr-1" />
                  Registration is always free for educators
                </Badge>
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
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Full Name</Label>
                  <Input
                    id="teacher-name"
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

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
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

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="teacher-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min. 8 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={playClick}
                      required
                      minLength={8}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-confirm-password">Confirm Password</Label>
                  <Input
                    id="teacher-confirm-password"
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

                {/* Subjects Multi-Select */}
                <div className="space-y-2">
                  <Label>Subjects <span className="text-destructive">*</span></Label>
                  <p className="text-xs text-muted-foreground">Select the subjects you can teach</p>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {SUBJECT_OPTIONS.map((subject) => (
                      <Badge
                        key={subject}
                        variant={subjects.includes(subject) ? 'default' : 'outline'}
                        className={`cursor-pointer text-xs transition-all ${
                          subjects.includes(subject)
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'hover:bg-emerald-50'
                        }`}
                        onClick={() => toggleSubject(subject)}
                      >
                        {subjects.includes(subject) && <Check className="w-3 h-3 mr-1" />}
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  {subjects.length === 0 && (
                    <p className="text-xs text-destructive">Please select at least one subject</p>
                  )}
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level <span className="text-destructive">*</span></Label>
                  <select
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    onFocus={playClick}
                    required
                    className="flex h-12 w-full rounded-xl border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="" disabled>Select your experience level</option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Bio (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="teacher-bio">Short Bio <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea
                    id="teacher-bio"
                    placeholder="Tell students a bit about yourself and your teaching style..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    onFocus={playClick}
                    maxLength={300}
                    rows={3}
                    className="rounded-xl bg-muted/50 resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="teacher-terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="teacher-terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <button type="button" className="text-primary hover:underline">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                    {' '}as an educator on SkoolarPlay.
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !name || !email || !password || !confirmPassword || !termsAccepted || passwordMismatch || subjects.length === 0 || !experience}
                  className="w-full h-12 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating educator account...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Create Educator Account
                    </>
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an educator account?{' '}
                <button
                  onClick={() => navigateTo('teacher-login')}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
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
