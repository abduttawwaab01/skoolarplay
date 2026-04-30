'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, AlertTriangle, Settings, RefreshCw, ShieldOff, Loader2, KeyRound, Sparkles, Lock, GraduationCap, Database, Wifi } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface AdminSettingsData {
  id: string
  platformName: string
  dailyXpGoal: number
  maxHearts: number
  heartRefillHours: number
  gemEarnRate: number
  xpMultiplier: number
  maintenanceMode: boolean
  allowRegistration: boolean
  enforceLessonOrder: boolean
  allowLessonSkip: boolean
  requireCompletionExam: boolean
  completionExamPassMark: number
  completionExamAttempts: number
  aiEnabled: boolean
  aiRateLimitPerMinute: number
  aiRateLimitPerDay: number
  aiMaxContextMessages: number
  aiModel: string
  cacheTTLMinutes: number
  enableOfflineMode: boolean
  batchSyncInterval: number
  defaultCutoffScore: number
  preloaderDurationSeconds: number
  loginPageLogoUrl: string | null
  navBarLogoUrl: string | null
  footerLogoUrl: string | null
  requireEmailVerification: boolean
  autoVerifyNewUsers: boolean
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local form state
  const [platformName, setPlatformName] = useState('')
  const [dailyXpGoal, setDailyXpGoal] = useState('')
  const [maxHearts, setMaxHearts] = useState('')
  const [heartRefillHours, setHeartRefillHours] = useState('')
  const [gemEarnRate, setGemEarnRate] = useState('')
  const [xpMultiplier, setXpMultiplier] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [allowRegistration, setAllowRegistration] = useState(true)
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [autoVerifyNewUsers, setAutoVerifyNewUsers] = useState(false)

  // AI Settings state
  const [aiEnabled, setAiEnabled] = useState(true)
  const [aiRateLimitPerMinute, setAiRateLimitPerMinute] = useState('10')
  const [aiRateLimitPerDay, setAiRateLimitPerDay] = useState('100')
  const [aiMaxContextMessages, setAiMaxContextMessages] = useState('20')
  const [aiModel] = useState('default')
  const [savingAI, setSavingAI] = useState(false)

  // Reset confirmation
  const [resetDialog, setResetDialog] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetSubmitting, setResetSubmitting] = useState(false)

  // Lesson order & completion exam settings
  const [enforceLessonOrder, setEnforceLessonOrder] = useState(true)
  const [allowLessonSkip, setAllowLessonSkip] = useState(false)
  const [requireCompletionExam, setRequireCompletionExam] = useState(true)
  const [completionExamPassMark, setCompletionExamPassMark] = useState('60')
  const [completionExamAttempts, setCompletionExamAttempts] = useState('3')
  const [savingLesson, setSavingLesson] = useState(false)
  const [savingExam, setSavingExam] = useState(false)

  // Cache settings
  const [cacheTTLMinutes, setCacheTTLMinutes] = useState('30')
  const [enableOfflineMode, setEnableOfflineMode] = useState(true)
  const [batchSyncInterval, setBatchSyncInterval] = useState('5')
  const [savingCache, setSavingCache] = useState(false)
  const [defaultCutoffScore, setDefaultCutoffScore] = useState('70')

  // Preloader settings
  const [preloaderDurationSeconds, setPreloaderDurationSeconds] = useState('3')

  // Branding settings
  const [loginPageLogoUrl, setLoginPageLogoUrl] = useState('')
  const [navBarLogoUrl, setNavBarLogoUrl] = useState('')
  const [footerLogoUrl, setFooterLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  
  // Certificate settings
  const [founderName, setFounderName] = useState('')
  const [founderTitle, setFounderTitle] = useState('')
  const [founderSignatureUrl, setFounderSignatureUrl] = useState('')
  const [certificatePlatformUrl, setCertificatePlatformUrl] = useState('')
  const [certificateTemplate, setCertificateTemplate] = useState('standard')
  const [premiumCertificateEnabled, setPremiumCertificateEnabled] = useState(true)
  const [premiumCertificateBadge, setPremiumCertificateBadge] = useState('PREMIUM')

  // Danger zone passphrase
  const [passphraseInput, setPassphraseInput] = useState('')
  const [passphraseDialog, setPassphraseDialog] = useState(false)
  const [hasPassphrase, setHasPassphrase] = useState<boolean | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        setPlatformName(data.settings.platformName)
        setDailyXpGoal(data.settings.dailyXpGoal.toString())
        setMaxHearts(data.settings.maxHearts.toString())
        setHeartRefillHours(data.settings.heartRefillHours.toString())
        setGemEarnRate(data.settings.gemEarnRate.toString())
        setXpMultiplier(data.settings.xpMultiplier.toString())
        setMaintenanceMode(data.settings.maintenanceMode)
        setAllowRegistration(data.settings.allowRegistration)
        setRequireEmailVerification(data.settings.requireEmailVerification !== false)
        setAutoVerifyNewUsers(data.settings.autoVerifyNewUsers === true)
        setHasPassphrase(!!data.settings.dangerZonePassphrase)
        // AI settings
        setAiEnabled(data.settings.aiEnabled !== false)
        setAiRateLimitPerMinute(String(data.settings.aiRateLimitPerMinute || 10))
        setAiRateLimitPerDay(String(data.settings.aiRateLimitPerDay || 100))
        setAiMaxContextMessages(String(data.settings.aiMaxContextMessages || 20))
        // Lesson order
        setEnforceLessonOrder(data.settings.enforceLessonOrder !== false)
        setAllowLessonSkip(data.settings.allowLessonSkip === true)
        // Completion exam
        setRequireCompletionExam(data.settings.requireCompletionExam !== false)
        setCompletionExamPassMark(String(data.settings.completionExamPassMark || 60))
        setCompletionExamAttempts(String(data.settings.completionExamAttempts || 3))
        // Cache settings
        setCacheTTLMinutes(String(data.settings.cacheTTLMinutes || 30))
        setEnableOfflineMode(data.settings.enableOfflineMode !== false)
        setBatchSyncInterval(String(data.settings.batchSyncInterval || 5))
        // Default cutoff
        setDefaultCutoffScore(String(data.settings.defaultCutoffScore || 70))
        // Preloader duration
        setPreloaderDurationSeconds(String(data.settings.preloaderDurationSeconds || 3))
        // Branding settings
        setLoginPageLogoUrl(data.settings?.loginPageLogoUrl || '')
        setNavBarLogoUrl(data.settings?.navBarLogoUrl || '')
        setFooterLogoUrl(data.settings?.footerLogoUrl || '')
        setFaviconUrl(data.settings?.faviconUrl || '')
        // Certificate settings
        setFounderName(data.settings?.founderName || 'Abdut Tawwab')
        setFounderTitle(data.settings?.founderTitle || 'Founder & CEO')
        setFounderSignatureUrl(data.settings?.founderSignatureUrl || '')
        setCertificatePlatformUrl(data.settings?.certificatePlatformUrl || '')
        setCertificateTemplate(data.settings?.certificateTemplate || 'standard')
        setPremiumCertificateEnabled(data.settings?.premiumCertificateEnabled ?? true)
        setPremiumCertificateBadge(data.settings?.premiumCertificateBadge || 'PREMIUM')
      }
    } catch {
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          dailyXpGoal: parseInt(dailyXpGoal) || 50,
          maxHearts: parseInt(maxHearts) || 5,
          heartRefillHours: parseInt(heartRefillHours) || 4,
          gemEarnRate: parseFloat(gemEarnRate) || 1.0,
          xpMultiplier: parseFloat(xpMultiplier) || 1.0,
          maintenanceMode,
          allowRegistration,
          loginPageLogoUrl: loginPageLogoUrl.trim() || null,
          navBarLogoUrl: navBarLogoUrl.trim() || null,
          footerLogoUrl: footerLogoUrl.trim() || null,
          faviconUrl: faviconUrl.trim() || null,
          // Certificate settings
          founderName: founderName.trim() || 'Abdut Tawwab',
          founderTitle: founderTitle.trim() || 'Founder & CEO',
          founderSignatureUrl: founderSignatureUrl.trim() || null,
          certificatePlatformUrl: certificatePlatformUrl.trim() || null,
          certificateTemplate,
          premiumCertificateEnabled,
          premiumCertificateBadge: premiumCertificateBadge.trim() || 'PREMIUM',
        }),
      })
      if (res.ok) {
        toast.success('Settings saved successfully')
        fetchSettings()
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleMaintenance = async (value: boolean) => {
    setMaintenanceMode(value)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: value }),
      })
      toast.success(value ? 'Maintenance mode enabled' : 'Maintenance mode disabled')
    } catch {
      toast.error('Failed to toggle maintenance mode')
    }
  }

  const handleToggleRegistration = async (value: boolean) => {
    setAllowRegistration(value)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowRegistration: value }),
      })
      toast.success(value ? 'Registration enabled' : 'Registration disabled')
    } catch {
      toast.error('Failed to toggle registration')
    }
  }

  const handleToggleEmailVerification = async (value: boolean) => {
    setRequireEmailVerification(value)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requireEmailVerification: value }),
      })
      toast.success(value ? 'Email verification required' : 'Email verification disabled')
    } catch {
      toast.error('Failed to toggle email verification')
    }
  }

  const handleToggleAutoVerify = async (value: boolean) => {
    setAutoVerifyNewUsers(value)
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoVerifyNewUsers: value }),
      })
      toast.success(value ? 'Auto-verify enabled - users will be verified automatically' : 'Auto-verify disabled')
    } catch {
      toast.error('Failed to toggle auto-verify')
    }
  }

  const handleResetData = async () => {
    if (resetConfirm !== 'DELETE ALL DATA') {
      toast.error('Please type DELETE ALL DATA to confirm')
      return
    }

    // Check if passphrase is set
    if (hasPassphrase === null) {
      toast.error('Please wait while we check the danger zone configuration...')
      return
    }

    if (!hasPassphrase) {
      toast.error('Please set a Danger Zone passphrase first in the Danger Zone page.')
      setResetDialog(false)
      setResetConfirm('')
      return
    }

    // Ask for passphrase
    setResetDialog(false)
    setPassphraseDialog(true)
  }

  const handlePassphraseSubmit = async () => {
    if (!passphraseInput) {
      toast.error('Please enter the Danger Zone passphrase')
      return
    }

    setResetSubmitting(true)
    try {
      const res = await fetch('/api/admin/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'resetSystem',
          passphrase: passphraseInput,
        }),
      })

      if (res.ok) {
        toast.success('All user data has been reset.')
        setPassphraseDialog(false)
        setPassphraseInput('')
        setResetConfirm('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to reset data. Check your passphrase.')
      }
    } catch {
      toast.error('Failed to reset data')
    } finally {
      setResetSubmitting(false)
    }
  }

  const handleSaveAISettings = async () => {
    setSavingAI(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiEnabled,
          aiRateLimitPerMinute: parseInt(aiRateLimitPerMinute) || 10,
          aiRateLimitPerDay: parseInt(aiRateLimitPerDay) || 100,
          aiMaxContextMessages: parseInt(aiMaxContextMessages) || 20,
          aiModel: 'default',
        }),
      })
      if (res.ok) {
        toast.success('AI settings saved successfully')
      } else {
        toast.error('Failed to save AI settings')
      }
    } catch {
      toast.error('Failed to save AI settings')
    } finally {
      setSavingAI(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse"><CardContent className="p-6 h-64" /></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Platform Settings
          </CardTitle>
          <CardDescription>Configure the core platform parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="SkoolarPlay"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Daily XP Goal</Label>
              <Input
                type="number"
                value={dailyXpGoal}
                onChange={(e) => setDailyXpGoal(e.target.value)}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">Target XP for daily streak completion</p>
            </div>
            <div className="space-y-2">
              <Label>Max Hearts</Label>
              <Input
                type="number"
                value={maxHearts}
                onChange={(e) => setMaxHearts(e.target.value)}
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">Maximum hearts a user can have</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Heart Refill (hours)</Label>
              <Input
                type="number"
                value={heartRefillHours}
                onChange={(e) => setHeartRefillHours(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Gem Earn Rate</Label>
              <Input
                type="number"
                step="0.1"
                value={gemEarnRate}
                onChange={(e) => setGemEarnRate(e.target.value)}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">Multiplier for gem rewards</p>
            </div>
            <div className="space-y-2">
              <Label>XP Multiplier</Label>
              <Input
                type="number"
                step="0.1"
                value={xpMultiplier}
                onChange={(e) => setXpMultiplier(e.target.value)}
                placeholder="1.0"
              />
              <p className="text-xs text-muted-foreground">Multiplier for XP rewards</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Branding Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Custom Branding
          </CardTitle>
          <CardDescription>Upload custom logos for your platform (leave empty to use defaults)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Login Page Logo URL</Label>
            <Input
              value={loginPageLogoUrl}
              onChange={(e) => setLoginPageLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-muted-foreground">Logo displayed on login and register pages</p>
          </div>

          <div className="space-y-2">
            <Label>Navigation Bar Logo URL</Label>
            <Input
              value={navBarLogoUrl}
              onChange={(e) => setNavBarLogoUrl(e.target.value)}
              placeholder="https://example.com/nav-logo.png"
            />
            <p className="text-xs text-muted-foreground">Logo displayed in the navigation bar</p>
          </div>

          <div className="space-y-2">
            <Label>Footer Logo URL</Label>
            <Input
              value={footerLogoUrl}
              onChange={(e) => setFooterLogoUrl(e.target.value)}
              placeholder="https://example.com/footer-logo.png"
            />
            <p className="text-xs text-muted-foreground">Logo displayed in the footer</p>
          </div>

          <div className="space-y-2">
            <Label>Favicon URL</Label>
            <Input
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico"
            />
            <p className="text-xs text-muted-foreground">Custom favicon for browser tab (ico, png, svg)</p>
          </div>

          <Separator />

          {/* Certificate Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Certificate Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Configure how certificates appear to students</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Founder Name</Label>
              <Input
                value={founderName}
                onChange={(e) => setFounderName(e.target.value)}
                placeholder="Abdut Tawwab"
              />
              <p className="text-xs text-muted-foreground">Name displayed on certificates</p>
            </div>

            <div className="space-y-2">
              <Label>Founder Title</Label>
              <Input
                value={founderTitle}
                onChange={(e) => setFounderTitle(e.target.value)}
                placeholder="Founder & CEO"
              />
              <p className="text-xs text-muted-foreground">Title/position on certificates</p>
            </div>

            <div className="space-y-2">
              <Label>Signature Image URL</Label>
              <Input
                value={founderSignatureUrl}
                onChange={(e) => setFounderSignatureUrl(e.target.value)}
                placeholder="https://example.com/signature.png"
              />
              <p className="text-xs text-muted-foreground">Signature image for certificates</p>
            </div>

            <div className="space-y-2">
              <Label>Verification URL</Label>
              <Input
                value={certificatePlatformUrl}
                onChange={(e) => setCertificatePlatformUrl(e.target.value)}
                placeholder="https://skoolarplay.com/cert/verify"
              />
              <p className="text-xs text-muted-foreground">URL for certificate verification</p>
            </div>

            <div className="space-y-2">
              <Label>Certificate Template</Label>
              <Select value={certificateTemplate} onValueChange={setCertificateTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (Basic)</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Default certificate style</p>
            </div>

            <div className="space-y-2">
              <Label>Premium Badge Text</Label>
              <Input
                value={premiumCertificateBadge}
                onChange={(e) => setPremiumCertificateBadge(e.target.value)}
                placeholder="PREMIUM"
              />
              <p className="text-xs text-muted-foreground">Text shown on premium certificates</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <Label className="text-base font-medium">Premium Certificates</Label>
              <p className="text-sm text-muted-foreground">Only premium users can get premium certificates</p>
            </div>
            <Switch
              checked={premiumCertificateEnabled}
              onCheckedChange={setPremiumCertificateEnabled}
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2 min-w-[120px]">
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Branding'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Assistant Settings
          </CardTitle>
          <CardDescription>Configure the AI Tutor assistant for students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable AI Assistant</Label>
              <p className="text-sm text-muted-foreground">Allow students to use the AI Tutor chat</p>
            </div>
            <Switch
              checked={aiEnabled}
              onCheckedChange={setAiEnabled}
            />
          </div>

          {aiEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rate Limit / Minute</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={aiRateLimitPerMinute}
                    onChange={(e) => setAiRateLimitPerMinute(e.target.value)}
                    placeholder="10"
                  />
                  <p className="text-xs text-muted-foreground">Max messages per minute per user</p>
                </div>
                <div className="space-y-2">
                  <Label>Rate Limit / Day</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10000"
                    value={aiRateLimitPerDay}
                    onChange={(e) => setAiRateLimitPerDay(e.target.value)}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground">Max messages per day per user</p>
                </div>
                <div className="space-y-2">
                  <Label>Max Context Messages</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={aiMaxContextMessages}
                    onChange={(e) => setAiMaxContextMessages(e.target.value)}
                    placeholder="20"
                  />
                  <p className="text-xs text-muted-foreground">Conversation history sent to AI</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">AI Model</Label>
                  <p className="text-xs text-muted-foreground">Currently active AI model</p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {aiModel}
                </Badge>
              </div>
            </motion.div>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveAISettings} disabled={savingAI} className="gap-2 min-w-[140px]">
              {savingAI ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {savingAI ? 'Saving...' : 'Save AI Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Order Enforcement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Lesson Order Enforcement
          </CardTitle>
          <CardDescription>Control how students progress through lessons</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enforce Sequential Lesson Order</Label>
              <p className="text-sm text-muted-foreground">Students must complete and pass each lesson before the next unlocks. No skipping allowed.</p>
            </div>
            <Switch checked={enforceLessonOrder} onCheckedChange={setEnforceLessonOrder} />
          </div>

          {enforceLessonOrder && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Allow Premium Users to Skip</Label>
                  <p className="text-xs text-muted-foreground">Premium subscribers can bypass the lesson order lock</p>
                </div>
                <Switch checked={allowLessonSkip} onCheckedChange={setAllowLessonSkip} />
              </div>
            </motion.div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Default Lesson Pass Score (Cutoff)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                max="100"
                className="w-24"
                value={defaultCutoffScore}
                onChange={(e) => setDefaultCutoffScore(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">% — minimum score to pass a lesson</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={async () => {
              setSavingLesson(true)
              try {
                const res = await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    enforceLessonOrder,
                    allowLessonSkip,
                    defaultCutoffScore: parseInt(defaultCutoffScore) || 70,
                  }),
                })
                if (res.ok) toast.success('Lesson order settings saved')
                else toast.error('Failed to save')
              } catch { toast.error('Failed to save') }
              finally { setSavingLesson(false) }
            }} disabled={savingLesson} className="gap-2 min-w-[140px]">
              {savingLesson ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingLesson ? 'Saving...' : 'Save Lesson Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Completion Exam Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Completion Exam Requirements
          </CardTitle>
          <CardDescription>Control exam requirements before certificate issuance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Require Completion Exam</Label>
              <p className="text-sm text-muted-foreground">Students must pass an exam before earning a certificate (both free and premium)</p>
            </div>
            <Switch checked={requireCompletionExam} onCheckedChange={setRequireCompletionExam} />
          </div>

          {requireCompletionExam && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Pass Mark</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      className="w-24"
                      value={completionExamPassMark}
                      onChange={(e) => setCompletionExamPassMark(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">% minimum</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum score required on the completion exam</p>
                </div>
                <div className="space-y-2">
                  <Label>Max Exam Attempts</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={completionExamAttempts}
                    onChange={(e) => setCompletionExamAttempts(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum times a student can attempt the exam</p>
                </div>
              </div>
            </motion.div>
          )}

          <Separator />

          <div className="flex justify-end">
            <Button onClick={async () => {
              setSavingExam(true)
              try {
                const res = await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    requireCompletionExam,
                    completionExamPassMark: parseInt(completionExamPassMark) || 60,
                    completionExamAttempts: parseInt(completionExamAttempts) || 3,
                  }),
                })
                if (res.ok) toast.success('Completion exam settings saved')
                else toast.error('Failed to save')
              } catch { toast.error('Failed to save') }
              finally { setSavingExam(false) }
            }} disabled={savingExam} className="gap-2 min-w-[140px]">
              {savingExam ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingExam ? 'Saving...' : 'Save Exam Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stay-Free-Forever Cache Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Stay-Free-Forever Optimization
          </CardTitle>
          <CardDescription>Reduce backend costs with client-side caching and offline support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Offline Mode</Label>
              <p className="text-sm text-muted-foreground">Allow students to access cached content without internet</p>
            </div>
            <Switch checked={enableOfflineMode} onCheckedChange={setEnableOfflineMode} />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cache TTL (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="1440"
                value={cacheTTLMinutes}
                onChange={(e) => setCacheTTLMinutes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How long cached data is valid</p>
            </div>
            <div className="space-y-2">
              <Label>Batch Sync Interval (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={batchSyncInterval}
                onChange={(e) => setBatchSyncInterval(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How often to sync pending changes</p>
            </div>
            <div className="space-y-2">
              <Label>Preloader Duration (seconds)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={preloaderDurationSeconds}
                onChange={(e) => setPreloaderDurationSeconds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">How long welcome screen shows</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">How it works</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Client-side caching stores course data, categories, and other semi-static content in the browser. This reduces server load and API calls by up to 80%, while real-time features like notifications and scores continue to sync normally.
            </p>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={async () => {
              setSavingCache(true)
              try {
                const res = await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    cacheTTLMinutes: parseInt(cacheTTLMinutes) || 30,
                    enableOfflineMode,
                    batchSyncInterval: parseInt(batchSyncInterval) || 5,
                    preloaderDurationSeconds: parseInt(preloaderDurationSeconds) || 3,
                  }),
                })
                if (res.ok) toast.success('Cache settings saved')
                else toast.error('Failed to save')
              } catch { toast.error('Failed to save') }
              finally { setSavingCache(false) }
            }} disabled={savingCache} className="gap-2 min-w-[140px]">
              {savingCache ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {savingCache ? 'Saving...' : 'Save Cache Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="w-5 h-5 text-primary" />
            Platform Controls
          </CardTitle>
          <CardDescription>Manage platform access and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Allow Registration</Label>
              <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
            </div>
            <Switch checked={allowRegistration} onCheckedChange={handleToggleRegistration} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify email before login</p>
            </div>
            <Switch checked={requireEmailVerification} onCheckedChange={handleToggleEmailVerification} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Auto-Verify New Users</Label>
              <p className="text-sm text-muted-foreground">Automatically verify users (bypass email verification)</p>
            </div>
            <Switch checked={autoVerifyNewUsers} onCheckedChange={handleToggleAutoVerify} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, non-admin users will see a maintenance page
              </p>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={handleToggleMaintenance}
            />
          </div>
          {maintenanceMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
            >
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Maintenance mode is active</span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                Users will see a maintenance page instead of the app.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Reset All User Data</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all user progress, achievements, and purchases. This cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setResetDialog(true)}
              className="shrink-0"
            >
              Reset Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onOpenChange={(open) => { if (!open) { setResetDialog(false); setResetConfirm('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reset All User Data
            </DialogTitle>
            <DialogDescription>
              This will permanently delete ALL user progress, achievements, purchases, and leaderboard entries.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Type &quot;DELETE ALL DATA&quot; to confirm</Label>
            <Input
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="DELETE ALL DATA"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetDialog(false); setResetConfirm('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={resetConfirm !== 'DELETE ALL DATA'}
              onClick={handleResetData}
            >
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Passphrase Verification Dialog */}
      <Dialog open={passphraseDialog} onOpenChange={(open) => { if (!open) { setPassphraseDialog(false); setPassphraseInput('') } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-destructive" />
              Danger Zone Passphrase Required
            </DialogTitle>
            <DialogDescription>
              Enter your Danger Zone passphrase to confirm the system reset.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Passphrase</Label>
              <Input
                type="password"
                value={passphraseInput}
                onChange={(e) => setPassphraseInput(e.target.value)}
                placeholder="Enter your danger zone passphrase"
                onKeyDown={(e) => { if (e.key === 'Enter') handlePassphraseSubmit() }}
              />
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive font-medium">⚠️ This will permanently reset the entire system. All non-admin users, courses, progress, and data will be deleted.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPassphraseDialog(false); setPassphraseInput('') }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePassphraseSubmit}
              disabled={!passphraseInput || resetSubmitting}
            >
              {resetSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Confirm Full Reset'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
