'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Flag, Video, Award, Swords, Trophy, Store, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface FeatureFlag {
  id: string
  key: string
  name: string
  enabled: boolean
  createdAt: string
}

const flagIcons: Record<string, React.ElementType> = {
  VIDEO_LESSONS: Video,
  CERTIFICATES: Award,
  DAILY_CHALLENGES: Swords,
  LEADERBOARD: Trophy,
  SHOP: Store,
  SOCIAL_FEATURES: Users,
}

const flagDescriptions: Record<string, string> = {
  VIDEO_LESSONS: 'Enable video lesson content for courses. Students can watch educational videos before taking quizzes.',
  CERTIFICATES: 'Enable certificate generation when students complete a course. Certificates can be shared and downloaded.',
  DAILY_CHALLENGES: 'Enable daily challenges that give students fresh content and bonus XP/gems every day.',
  LEADERBOARD: 'Enable the competitive leaderboard showing top students by XP. Includes daily, weekly, and all-time rankings.',
  SHOP: 'Enable the gem shop where students can purchase power-ups, streak freezes, boosts, and cosmetic items.',
  SOCIAL_FEATURES: 'Enable social and community features like friend lists, messaging, and collaborative learning.',
}

export function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)

  const [addDialog, setAddDialog] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/feature-flags')
      if (res.ok) {
        const data = await res.json()
        setFlags(data.flags)
      }
    } catch {
      toast.error('Failed to fetch feature flags')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlags() }, [fetchFlags])

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      const res = await fetch(`/api/admin/feature-flags/${flag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !flag.enabled }),
      })
      if (res.ok) {
        toast.success(`${flag.name} ${flag.enabled ? 'disabled' : 'enabled'}`)
        fetchFlags()
      }
    } catch {
      toast.error('Failed to toggle flag')
    }
  }

  const handleAdd = async () => {
    if (!newKey || !newName) {
      toast.error('Key and name are required')
      return
    }
    try {
      const res = await fetch('/api/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.toUpperCase().replace(/\s+/g, '_'), name: newName }),
      })
      if (res.ok) {
        toast.success('Feature flag created')
        setAddDialog(false)
        setNewKey('')
        setNewName('')
        setNewDescription('')
        fetchFlags()
      }
    } catch {
      toast.error('Failed to create feature flag')
    }
  }

  const enabledCount = flags.filter(f => f.enabled).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Flag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Flags</p>
              <p className="text-2xl font-bold">{flags.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <div className="w-5 h-5 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enabled</p>
              <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <div className="w-5 h-5 rounded-full bg-gray-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Disabled</p>
              <p className="text-2xl font-bold text-muted-foreground">{flags.length - enabledCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Feature Flags</h2>
        <Button onClick={() => setAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Flag
        </Button>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-24" /></Card>
          ))
        ) : flags.map((flag, i) => {
          const Icon = flagIcons[flag.key] || Flag
          const description = flagDescriptions[flag.key]
          return (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${flag.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`w-5 h-5 ${flag.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{flag.name}</h3>
                          <code className="text-xs px-2 py-0.5 rounded bg-muted font-mono">{flag.key}</code>
                          <Badge variant={flag.enabled ? 'outline' : 'secondary'} className={flag.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}>
                            {flag.enabled ? 'ON' : 'OFF'}
                          </Badge>
                        </div>
                        {description && (
                          <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleToggle(flag)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Add Flag Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Feature Flag</DialogTitle>
            <DialogDescription>Create a new feature flag to control platform features.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Flag Key</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g., NEW_FEATURE"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Use uppercase letters and underscores. Will be auto-formatted.</p>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., New Feature" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Create Flag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
