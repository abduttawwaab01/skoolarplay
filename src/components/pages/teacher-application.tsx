'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  GraduationCap,
  CheckCircle,
  Clock,
  BookOpen,
  Loader2,
  Sparkles,
  Award,
  Users,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'

const subjectOptions = [
  'Mathematics',
  'English Language',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Nigerian Languages',
  'History',
  'Geography',
  'Economics',
  'Government',
  'Civic Education',
  'Technology & Coding',
  'Business Studies',
  'Arts & Design',
  'Music',
  'French',
  'Arabic',
  'CRK',
  'IRK',
]

const experienceOptions = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years',
]

export function TeacherApplicationPage() {
  const [form, setForm] = useState({
    bio: '',
    subjects: [] as string[],
    experience: '',
    reason: '',
    sampleTitle: '',
    sampleDescription: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const { goBack } = useAppStore()
  const { user } = useAuthStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')

  useEffect(() => {
    checkExistingProfile()
  }, [])

  const checkExistingProfile = async () => {
    try {
      const res = await fetch('/api/teachers/profile')
      if (res.ok) {
        const data = await res.json()
        if (data.profile) {
          setHasProfile(true)
        }
      }
    } catch (error) {
      console.error('Failed to check profile:', error)
    }
  }

  const toggleSubject = (subject: string) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleSubmit = async () => {
    if (form.bio.length < 100 || form.subjects.length === 0 || !form.experience || !form.reason) return

    setSubmitting(true)
    playClick()
    try {
      const res = await fetch('/api/teachers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Failed to submit application:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Submitted! 🎉</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to become a teacher on SkoolarPlay. Our team will review your application and get back to you within 3-5 business days.
          </p>
          <Button onClick={goBack} className="rounded-full bg-primary hover:bg-primary/90">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    )
  }

  if (hasProfile) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-lg mx-auto">
        <Button variant="ghost" onClick={goBack} className="rounded-full mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Application Already Submitted</h2>
            <p className="text-sm text-muted-foreground">
              You&apos;ve already submitted your teacher application. Our team is reviewing it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Become a Teacher on SkoolarPlay</h1>
          <p className="text-sm text-muted-foreground">Share your knowledge and inspire learners</p>
        </div>
      </motion.div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-yellow-500" />
              Requirements
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { icon: Clock, text: 'Active account for 30+ days' },
                { icon: BookOpen, text: 'Completed at least 5 courses' },
                { icon: CheckCircle, text: 'No bans or warnings' },
                { icon: Users, text: 'Strong subject knowledge' },
              ].map((req) => (
                <div key={req.text} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-muted-foreground">{req.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Application Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4 space-y-5">
            {/* Bio */}
            <div>
              <Label className="text-sm font-medium">
                Bio <span className="text-destructive">*</span>
              </Label>
              <p className="text-[11px] text-muted-foreground mb-1.5">
                Tell students about yourself, your teaching experience, and passion (min 100 characters)
              </p>
              <Textarea
                placeholder="I am a passionate mathematics teacher with over 5 years of experience helping Nigerian students excel in WAEC and JAMB exams..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl min-h-[100px]"
                rows={4}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-[11px] ${form.bio.length >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {form.bio.length}/100 min
                </span>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <Label className="text-sm font-medium">
                Subjects <span className="text-destructive">*</span>
              </Label>
              <p className="text-[11px] text-muted-foreground mb-2">Select all subjects you can teach</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjectOptions.map((subject) => (
                  <label
                    key={subject}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      form.subjects.includes(subject)
                        ? 'bg-primary/5 border-primary/30 text-primary'
                        : 'hover:bg-muted border-transparent'
                    }`}
                  >
                    <Checkbox
                      checked={form.subjects.includes(subject)}
                      onCheckedChange={() => toggleSubject(subject)}
                      className="rounded-md"
                    />
                    <span className="text-xs font-medium">{subject}</span>
                  </label>
                ))}
              </div>
              {form.subjects.length === 0 && (
                <p className="text-[11px] text-destructive mt-1">Select at least one subject</p>
              )}
            </div>

            {/* Experience */}
            <div>
              <Label className="text-sm font-medium">
                Teaching Experience <span className="text-destructive">*</span>
              </Label>
              <Select value={form.experience} onValueChange={(val) => setForm({ ...form, experience: val })}>
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((exp) => (
                    <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Why teach */}
            <div>
              <Label className="text-sm font-medium">
                Why do you want to teach? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="I want to teach because I believe every Nigerian student deserves quality education..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="rounded-xl mt-1.5"
                rows={3}
              />
            </div>

            {/* Sample Lesson */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Sample Lesson
              </Label>
              <p className="text-[11px] text-muted-foreground mb-2">Describe a lesson you would create</p>
              <div className="space-y-2">
                <Input
                  placeholder="e.g., Introduction to Algebra for WAEC"
                  value={form.sampleTitle}
                  onChange={(e) => setForm({ ...form, sampleTitle: e.target.value })}
                  className="rounded-xl"
                />
                <Textarea
                  placeholder="Brief description of the lesson content, objectives, and teaching approach..."
                  value={form.sampleDescription}
                  onChange={(e) => setForm({ ...form, sampleDescription: e.target.value })}
                  className="rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting || form.bio.length < 100 || form.subjects.length === 0 || !form.experience || !form.reason}
                className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
