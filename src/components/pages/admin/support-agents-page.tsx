'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HeadphonesIcon, Plus, Trash2, Loader2, UserPlus, Mail, Lock, Shield, Eye, EyeOff, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// ==================== TYPES ====================

interface SupportAgent {
  id: string
  email: string
  name: string
  role: string
  isBanned: boolean
  lastActiveAt: string
  createdAt: string
  delegatedPermissions: string
}

const ALL_PERMISSIONS = [
  { key: 'users.view', label: 'View Users', category: 'Users' },
  { key: 'users.edit', label: 'Edit Users', category: 'Users' },
  { key: 'users.ban', label: 'Ban Users', category: 'Users' },
  { key: 'users.delete', label: 'Delete Users', category: 'Users' },
  { key: 'courses.manage', label: 'Manage Courses', category: 'Content' },
  { key: 'questions.manage', label: 'Manage Questions', category: 'Content' },
  { key: 'videos.manage', label: 'Manage Videos', category: 'Content' },
  { key: 'exams.manage', label: 'Manage Exams', category: 'Content' },
  { key: 'results.view', label: 'View Results', category: 'Content' },
  { key: 'announcements.send', label: 'Send Announcements', category: 'Content' },
  { key: 'sponsors.manage', label: 'Manage Sponsors', category: 'Community' },
  { key: 'investors.manage', label: 'Manage Investors', category: 'Community' },
  { key: 'volunteers.manage', label: 'Manage Volunteers', category: 'Community' },
  { key: 'donations.manage', label: 'Manage Donations', category: 'Community' },
  { key: 'feed.manage', label: 'Manage Feed', category: 'Community' },
  { key: 'groups.manage', label: 'Manage Groups', category: 'Community' },
  { key: 'analytics.view', label: 'View Analytics', category: 'Analytics' },
  { key: 'reports.view', label: 'View Reports', category: 'Analytics' },
  { key: 'surveys.manage', label: 'Manage Surveys', category: 'Analytics' },
  { key: 'settings.manage', label: 'Manage Settings', category: 'Settings' },
]

// ==================== HELPERS ====================

function getTimeSince(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return `${Math.floor(diffDay / 7)}w ago`
}

// ==================== COMPONENT ====================

export function AdminSupportAgentsPage() {
  const [agents, setAgents] = useState<SupportAgent[]>([])
  const [loading, setLoading] = useState(true)

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirmPassword, setCreateConfirmPassword] = useState('')
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [creating, setCreating] = useState(false)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<SupportAgent | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Permissions dialog state
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null)
  const [agentPermissions, setAgentPermissions] = useState<string[]>([])
  const [savingPermissions, setSavingPermissions] = useState(false)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/support-agents')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.supportAgents)
      } else {
        toast.error('Failed to fetch support agents')
      }
    } catch {
      toast.error('Failed to fetch support agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleCreate = async () => {
    if (!createName.trim()) {
      toast.error('Name is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createEmail)) {
      toast.error('Please enter a valid email')
      return
    }

    if (createPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (createPassword !== createConfirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/support-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.toLowerCase(),
          password: createPassword,
        }),
      })

      if (res.ok) {
        toast.success('Support agent created successfully')
        setCreateDialogOpen(false)
        setCreateName('')
        setCreateEmail('')
        setCreatePassword('')
        setCreateConfirmPassword('')
        fetchAgents()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create support agent')
      }
    } catch {
      toast.error('Failed to create support agent')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/support-agent/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success(`Support agent ${deleteTarget.name} deleted`)
        setDeleteTarget(null)
        fetchAgents()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete support agent')
      }
    } catch {
      toast.error('Failed to delete support agent')
    } finally {
      setDeleting(false)
    }
  }

  const openPermissionsDialog = (agent: SupportAgent) => {
    setSelectedAgent(agent)
    try {
      const perms = agent.delegatedPermissions ? JSON.parse(agent.delegatedPermissions) : []
      setAgentPermissions(perms)
    } catch {
      setAgentPermissions([])
    }
    setPermissionsDialogOpen(true)
  }

  const togglePermission = (key: string) => {
    if (agentPermissions.includes(key)) {
      setAgentPermissions(agentPermissions.filter(p => p !== key))
    } else {
      setAgentPermissions([...agentPermissions, key])
    }
  }

  const handleSavePermissions = async () => {
    if (!selectedAgent) return
    setSavingPermissions(true)
    try {
      const res = await fetch(`/api/admin/support-agent/${selectedAgent.id}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: agentPermissions }),
      })
      if (res.ok) {
        toast.success('Permissions updated')
        setPermissionsDialogOpen(false)
        fetchAgents()
      } else {
        toast.error('Failed to update permissions')
      }
    } catch {
      toast.error('Failed to update permissions')
    } finally {
      setSavingPermissions(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5" />
              Support Agent Management
            </h2>
            <p className="text-sm text-muted-foreground">
              Create and manage support agent accounts for delegated admin access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAgents} disabled={loading} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create Support Agent
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Support Agents</p>
                  <p className="text-2xl font-bold mt-1">{agents.length}</p>
                </div>
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <HeadphonesIcon className="w-5 h-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Active Agents</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {agents.filter(a => !a.isBanned).length}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Delegated Features</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">
                    3
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">User management, messaging, reports</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Delegated Features Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Delegated Features</CardTitle>
            <CardDescription className="text-xs">
              Support agents have access to the following admin features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <HeadphonesIcon className="w-4 h-4 text-violet-500" />
                  User Support
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  View user profiles, respond to reports, and assist with account issues
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Messaging
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Send notifications and communicate with users directly
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Report Management
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Review and resolve user reports and content moderation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agents Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Support Agents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <HeadphonesIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No support agents found</p>
                <p className="text-xs mt-1">Create your first support agent to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-violet-600">
                              {agent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{agent.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{agent.email}</TableCell>
                      <TableCell>
                        <Badge variant={agent.isBanned ? 'destructive' : 'default'}>
                          {agent.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {getTimeSince(agent.lastActiveAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(agent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openPermissionsDialog(agent)}
                            title="Manage permissions"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(agent)}
                            title="Delete support agent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Support Agent Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-500" />
              Create Support Agent
            </DialogTitle>
            <DialogDescription>
              Add a new support agent who will have delegated admin access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Full Name</Label>
              <Input
                id="agent-name"
                placeholder="John Doe"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="agent-email"
                  type="email"
                  placeholder="agent@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="agent-password"
                  type={showCreatePassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-confirm-password">Confirm Password</Label>
              <Input
                id="agent-confirm-password"
                type={showCreatePassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={createConfirmPassword}
                onChange={(e) => setCreateConfirmPassword(e.target.value)}
              />
              {createConfirmPassword && createConfirmPassword !== createPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={creating || !createName.trim() || !createEmail || !createPassword || createPassword !== createConfirmPassword}
              onClick={handleCreate}
              className="gap-1.5"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Agent
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Support Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this support agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-600">
                    {deleteTarget.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{deleteTarget.name}</p>
                  <p className="text-xs text-muted-foreground">{deleteTarget.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Permissions</DialogTitle>
            <DialogDescription>
              Set which features this support agent can access. They will only see the delegated features in their panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {['Users', 'Content', 'Community', 'Analytics', 'Settings'].map(category => {
              const categoryPerms = ALL_PERMISSIONS.filter(p => p.category === category)
              return (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {categoryPerms.map(perm => (
                      <button
                        key={perm.key}
                        onClick={() => togglePermission(perm.key)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          agentPermissions.includes(perm.key)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {perm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions} disabled={savingPermissions}>
              {savingPermissions ? 'Saving...' : 'Save Permissions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
