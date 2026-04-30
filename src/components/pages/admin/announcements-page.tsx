'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Megaphone, Info, AlertTriangle, Sparkles, BookOpen, RefreshCw, Gift, Calendar, Link2, ImageIcon, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string | null
  type: string
  isActive: boolean
  imageUrl: string | null
  bannerType: string
  targetUrl: string | null
  priority: number
  dismissedBy: string
  expiresAt: string | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
}

const bannerTypeConfig: Record<string, { color: string; icon: React.ElementType; bg: string; badge: string; badgeColor: string }> = {
  FEATURE: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: Sparkles,
    bg: 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800',
    badge: 'NEW FEATURE',
    badgeColor: 'bg-emerald-500 text-white',
  },
  COURSE: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: BookOpen,
    bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    badge: 'NEW COURSE',
    badgeColor: 'bg-blue-500 text-white',
  },
  UPDATE: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: RefreshCw,
    bg: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    badge: 'UPDATE',
    badgeColor: 'bg-purple-500 text-white',
  },
  PROMO: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: Gift,
    bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    badge: 'PROMO',
    badgeColor: 'bg-amber-500 text-white',
  },
}

const typeConfig: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  INFO: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Info, bg: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' },
  WARNING: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800' },
  PROMO: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: Sparkles, bg: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' },
}

export function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteAnn, setDeleteAnn] = useState<Announcement | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formType, setFormType] = useState('INFO')
  const [formBannerType, setFormBannerType] = useState('FEATURE')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formTargetUrl, setFormTargetUrl] = useState('')
  const [formPriority, setFormPriority] = useState('0')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formScheduledAt, setFormScheduledAt] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const [previewAnn, setPreviewAnn] = useState<Announcement | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data.announcements)
      }
    } catch {
      toast.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const resetForm = () => {
    setFormTitle('')
    setFormContent('')
    setFormType('INFO')
    setFormBannerType('FEATURE')
    setFormImageUrl('')
    setFormTargetUrl('')
    setFormPriority('0')
    setFormExpiresAt('')
    setFormScheduledAt('')
    setFormIsActive(true)
  }

  const openNew = () => {
    setEditingAnn(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (ann: Announcement) => {
    setEditingAnn(ann)
    setFormTitle(ann.title)
    setFormContent(ann.content || '')
    setFormType(ann.type)
    setFormBannerType(ann.bannerType || 'FEATURE')
    setFormImageUrl(ann.imageUrl || '')
    setFormTargetUrl(ann.targetUrl || '')
    setFormPriority(String(ann.priority))
    setFormExpiresAt(ann.expiresAt ? new Date(ann.expiresAt).toISOString().slice(0, 16) : '')
    setFormScheduledAt(ann.scheduledAt ? new Date(ann.scheduledAt).toISOString().slice(0, 16) : '')
    setFormIsActive(ann.isActive)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle) { toast.error('Title is required'); return }
    try {
      const url = editingAnn ? `/api/admin/announcements/${editingAnn.id}` : '/api/admin/announcements'
      const method = editingAnn ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title: formTitle,
        content: formContent || '',
        type: formType,
        bannerType: formBannerType,
        imageUrl: formImageUrl || null,
        targetUrl: formTargetUrl || null,
        priority: parseInt(formPriority) || 0,
        isActive: formIsActive,
      }
      if (formExpiresAt) body.expiresAt = new Date(formExpiresAt).toISOString()
      if (formScheduledAt) body.scheduledAt = new Date(formScheduledAt).toISOString()

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(editingAnn ? 'Announcement updated' : 'Announcement created')
        setDialogOpen(false)
        fetchAnnouncements()
      }
    } catch {
      toast.error('Failed to save announcement')
    }
  }

  const handleToggle = async (ann: Announcement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !ann.isActive }),
      })
      if (res.ok) {
        toast.success(ann.isActive ? 'Announcement deactivated' : 'Announcement activated')
        fetchAnnouncements()
      }
    } catch {
      toast.error('Failed to toggle announcement')
    }
  }

  const handleDelete = async () => {
    if (!deleteAnn) return
    try {
      const res = await fetch(`/api/admin/announcements/${deleteAnn.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Announcement deleted')
        setDeleteAnn(null)
        fetchAnnouncements()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{announcements.length} announcements</p>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Announcement
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Banner Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                  ))
                ) : announcements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No announcements yet</TableCell>
                  </TableRow>
                ) : (
                  announcements.map((ann, i) => {
                    const btConfig = bannerTypeConfig[ann.bannerType] || bannerTypeConfig.FEATURE
                    const BtIcon = btConfig.icon
                    return (
                      <motion.tr
                        key={ann.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <BtIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="font-medium">{ann.title}</span>
                            {ann.imageUrl && <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={btConfig.color}>{ann.bannerType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <ArrowUpDown className="w-3 h-3" />
                            {ann.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ann.isActive ? 'outline' : 'secondary'} className={!ann.isActive ? '' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                            {ann.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {new Date(ann.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewAnn(ann)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ann)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteAnn(ann)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              {editingAnn ? 'Edit Announcement' : 'New Announcement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Announcement title" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Announcement content..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                    <SelectItem value="PROMO">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Banner Type</Label>
                <Select value={formBannerType} onValueChange={setFormBannerType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEATURE">Feature</SelectItem>
                    <SelectItem value="COURSE">Course</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="PROMO">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" />
                Banner Image URL
              </Label>
              <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="https://example.com/banner.png" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Link2 className="w-3.5 h-3.5" />
                Target URL (Learn More link)
              </Label>
              <Input value={formTargetUrl} onChange={(e) => setFormTargetUrl(e.target.value)} placeholder="https://example.com or /dashboard" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Priority
                </Label>
                <Input type="number" value={formPriority} onChange={(e) => setFormPriority(e.target.value)} placeholder="0" />
                <p className="text-xs text-muted-foreground">Higher = shown first</p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
                  Active
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  {formIsActive ? 'Visible to users' : 'Hidden from users'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Expires At
                </Label>
                <Input type="datetime-local" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled At
                </Label>
                <Input type="datetime-local" value={formScheduledAt} onChange={(e) => setFormScheduledAt(e.target.value)} />
              </div>
            </div>

            {/* Live Preview */}
            {(formTitle || formImageUrl) && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Banner Preview</Label>
                <div className={`p-3 rounded-xl border ${bannerTypeConfig[formBannerType]?.bg || bannerTypeConfig.FEATURE.bg}`}>
                  <div className="flex items-start gap-3">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="p-2 rounded-lg bg-white/80 dark:bg-black/30 shrink-0">
                        {(() => { const Icon = bannerTypeConfig[formBannerType]?.icon || Sparkles; return <Icon className="w-5 h-5" /> })()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${bannerTypeConfig[formBannerType]?.badgeColor} text-[10px] px-1.5 py-0`}>
                          {bannerTypeConfig[formBannerType]?.badge}
                        </Badge>
                        <span className="font-semibold text-sm truncate">{formTitle || 'Untitled'}</span>
                      </div>
                      {formContent && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{formContent}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingAnn ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewAnn} onOpenChange={() => setPreviewAnn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>How users will see this announcement</DialogDescription>
          </DialogHeader>
          {previewAnn && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${bannerTypeConfig[previewAnn.bannerType]?.bg || bannerTypeConfig.FEATURE.bg}`}>
                <div className="flex items-start gap-3">
                  {previewAnn.imageUrl ? (
                    <img src={previewAnn.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-black/30 shrink-0">
                      {(() => { const Icon = bannerTypeConfig[previewAnn.bannerType]?.icon || Info; return <Icon className="w-5 h-5" /> })()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${bannerTypeConfig[previewAnn.bannerType]?.badgeColor} text-[10px] px-1.5 py-0`}>
                        {bannerTypeConfig[previewAnn.bannerType]?.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{previewAnn.title}</h3>
                    {previewAnn.content && (
                      <p className="text-sm text-muted-foreground mt-1">{previewAnn.content}</p>
                    )}
                    {previewAnn.targetUrl && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {previewAnn.targetUrl}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><Badge variant="outline" className={typeConfig[previewAnn.type]?.color}>{previewAnn.type}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Priority:</span><span className="font-medium">{previewAnn.priority}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><Badge variant={previewAnn.isActive ? 'outline' : 'secondary'}>{previewAnn.isActive ? 'Active' : 'Inactive'}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dismissed:</span><span className="font-medium">{(() => { try { return JSON.parse(previewAnn.dismissedBy).length } catch { return 0 } })()} users</span></div>
                {previewAnn.expiresAt && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Expires:</span><span className="font-medium text-xs">{new Date(previewAnn.expiresAt).toLocaleDateString()}</span></div>
                )}
                {previewAnn.scheduledAt && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Scheduled:</span><span className="font-medium text-xs">{new Date(previewAnn.scheduledAt).toLocaleDateString()}</span></div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteAnn} onOpenChange={() => setDeleteAnn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Announcement</DialogTitle>
            <DialogDescription>Are you sure you want to delete &quot;{deleteAnn?.title}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAnn(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
