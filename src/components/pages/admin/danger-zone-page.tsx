'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  RefreshCw,
  ShieldAlert,
  Lock,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const deleteOptions = [
  { key: 'deleteStudents', label: 'All Students', icon: Users, description: 'Delete all student accounts and their associated data (progress, achievements, etc.)', confirmPhrase: 'DELETE ALL STUDENTS', color: 'text-red-600 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' },
  { key: 'deleteTeachers', label: 'All Teachers', icon: GraduationCap, description: 'Delete all teacher accounts and their courses, modules, and lessons', confirmPhrase: 'DELETE ALL TEACHERS', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800' },
  { key: 'deleteCourses', label: 'All Courses', icon: BookOpen, description: 'Delete all courses, modules, lessons, and questions from the platform', confirmPhrase: 'DELETE ALL COURSES', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' },
  { key: 'deleteProgress', label: 'All Progress Data', icon: Trophy, description: 'Delete all enrollments, lesson progress, certificates, achievements, exam attempts, and leaderboard entries', confirmPhrase: 'DELETE ALL PROGRESS', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800' },
]

export function DangerZonePage() {
  const [passphrase, setPassphrase] = useState('')
  const [passphraseVerified, setPassphraseVerified] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [newPassphrase, setNewPassphrase] = useState('')
  const [confirmNewPassphrase, setConfirmNewPassphrase] = useState('')
  const [showNewPassphrase, setShowNewPassphrase] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState<typeof deleteOptions[number] | null>(null)
  const [isSystemReset, setIsSystemReset] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [hasPassphrase, setHasPassphrase] = useState(false)
  const [settingPassphrase, setSettingPassphrase] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setHasPassphrase(!!data.settings.dangerZonePassphrase)
      }
    } catch {
      // ignore
    }
  }

  const handleSetPassphrase = async () => {
    if (newPassphrase.length < 8) {
      toast.error('Passphrase must be at least 8 characters')
      return
    }
    if (newPassphrase !== confirmNewPassphrase) {
      toast.error('Passphrases do not match')
      return
    }
    setSettingPassphrase(true)
    try {
      const res = await fetch('/api/admin/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'setPassphrase',
          newPassphrase,
        }),
      })
      if (res.ok) {
        toast.success('Danger zone passphrase set successfully')
        setHasPassphrase(true)
        setNewPassphrase('')
        setConfirmNewPassphrase('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to set passphrase')
      }
    } catch {
      toast.error('Failed to set passphrase')
    } finally {
      setSettingPassphrase(false)
    }
  }

  const handleVerifyPassphrase = async () => {
    if (!passphrase) {
      toast.error('Enter the passphrase')
      return
    }
    try {
      const res = await fetch('/api/admin/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'deleteStudents', // Use a dummy op — server checks passphrase first
          passphrase,
        }),
      })
      if (res.status === 403) {
        toast.error('Incorrect passphrase')
      } else if (res.ok) {
        // If it got through, undo it — or just check settings
        toast.success('Passphrase verified. Danger zone unlocked.')
        setPassphraseVerified(true)
      } else {
        // Any other error means passphrase was wrong or missing
        const err = await res.json()
        toast.error(err.error || 'Verification failed')
      }
    } catch {
      toast.error('Failed to verify passphrase')
    }
  }

  // Simpler verify: just check against settings directly
  const handleVerify = async () => {
    if (!passphrase) {
      toast.error('Enter the passphrase')
      return
    }
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings.dangerZonePassphrase === passphrase) {
          setPassphraseVerified(true)
          toast.success('Passphrase verified. Danger zone unlocked.')
        } else {
          toast.error('Incorrect passphrase')
        }
      }
    } catch {
      toast.error('Failed to verify passphrase')
    }
  }

  const handleDeleteAction = (option: typeof deleteOptions[number]) => {
    setSelectedAction(option)
    setIsSystemReset(false)
    setConfirmText('')
    setDialogOpen(true)
  }

  const handleSystemReset = () => {
    setIsSystemReset(true)
    setSelectedAction(null)
    setConfirmText('')
    setDialogOpen(true)
  }

  const executeAction = async () => {
    if (!passphraseVerified || !passphrase) return

    if (isSystemReset) {
      if (confirmText !== 'FULL SYSTEM RESET') {
        toast.error('Type "FULL SYSTEM RESET" to confirm')
        return
      }
    } else if (selectedAction) {
      if (confirmText !== selectedAction.confirmPhrase) {
        toast.error(`Type "${selectedAction.confirmPhrase}" to confirm`)
        return
      }
    }

    setExecuting(true)
    try {
      const operation = isSystemReset ? 'resetSystem' : selectedAction?.key || ''

      const res = await fetch('/api/admin/danger-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, passphrase }),
      })

      if (res.ok) {
        const data = await res.json()
        const detailStr = Object.entries(data.details || {})
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        toast.success(`${data.message} ${detailStr ? `(${detailStr})` : ''}`)
        setDialogOpen(false)
        setConfirmText('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    } finally {
      setExecuting(false)
    }
  }

  const getConfirmPhrase = () => {
    if (isSystemReset) return 'FULL SYSTEM RESET'
    return selectedAction?.confirmPhrase || ''
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header Warning */}
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
              This area contains irreversible destructive operations. All actions require passphrase verification and confirmation.
              Proceed with extreme caution.
            </p>
          </div>
        </div>
      </div>

      {/* Passphrase Setup (if not set) */}
      {!hasPassphrase && (
        <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Lock className="w-5 h-5" />
              Set Danger Zone Passphrase
            </CardTitle>
            <CardDescription>
              You must set a security passphrase before accessing danger zone operations. This protects against accidental data destruction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Passphrase</Label>
              <div className="relative">
                <Input
                  type={showNewPassphrase ? 'text' : 'password'}
                  value={newPassphrase}
                  onChange={(e) => setNewPassphrase(e.target.value)}
                  placeholder="Enter a strong passphrase (min 8 chars)"
                  className="font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassphrase(!showNewPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm Passphrase</Label>
              <Input
                type={showNewPassphrase ? 'text' : 'password'}
                value={confirmNewPassphrase}
                onChange={(e) => setConfirmNewPassphrase(e.target.value)}
                placeholder="Confirm passphrase"
                className="font-mono"
              />
              {newPassphrase && confirmNewPassphrase && newPassphrase === confirmNewPassphrase && newPassphrase.length >= 8 && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Passphrases match
                </p>
              )}
            </div>
            <Button onClick={handleSetPassphrase} disabled={settingPassphrase} className="gap-2 bg-amber-600 hover:bg-amber-700">
              {settingPassphrase ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {settingPassphrase ? 'Setting...' : 'Set Passphrase'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Passphrase Verification */}
      {hasPassphrase && !passphraseVerified && (
        <Card className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <ShieldAlert className="w-5 h-5" />
              Verify Identity
            </CardTitle>
            <CardDescription>
              Enter your danger zone passphrase to unlock destructive operations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showPassphrase ? 'text' : 'password'}
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter danger zone passphrase"
                  className="font-mono pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button onClick={handleVerify} variant="destructive">
                Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verified Warning */}
      {passphraseVerified && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Danger zone unlocked. Proceed with extreme caution.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPassphraseVerified(false)
                setPassphrase('')
              }}
              className="text-red-500 hover:text-red-700 h-8"
            >
              <Lock className="w-3 h-3 mr-1" />
              Lock
            </Button>
          </div>
        </motion.div>
      )}

      {/* Delete Options */}
      {passphraseVerified && (
        <>
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete Specific Data
              </CardTitle>
              <CardDescription>
                Selectively delete specific types of data. Each action requires confirmation. These actions are irreversible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deleteOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${option.color}`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{option.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shrink-0"
                    onClick={() => handleDeleteAction(option)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Full System Reset */}
          <Card className="border-2 border-red-500 dark:border-red-700 bg-red-50/30 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2 text-lg">
                <RefreshCw className="w-6 h-6" />
                FULL SYSTEM RESET
              </CardTitle>
              <CardDescription className="text-red-600 dark:text-red-500">
                This deletes ALL data except your admin account and settings. Courses, users, progress, certificates, payments — everything. This cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleSystemReset}
                className="gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Initialize Full System Reset
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-red-200 dark:border-red-800">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {isSystemReset ? 'Full System Reset' : `Delete ${selectedAction?.label}`}
            </DialogTitle>
            <DialogDescription>
              {isSystemReset
                ? 'This will permanently delete ALL non-admin data from the system. Only your admin account and settings will remain. This action is IRREVERSIBLE.'
                : `This will permanently delete ${selectedAction?.label} and all associated data. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive">
                Type &quot;{getConfirmPhrase()}&quot; below to confirm:
              </p>
            </div>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={getConfirmPhrase()}
              className="font-mono"
              onKeyDown={(e) => e.key === 'Enter' && executeAction()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={executing}
              onClick={executeAction}
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
