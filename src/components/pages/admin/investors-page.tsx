'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
  Building2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface Investor {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  tier: string
  description: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
}

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']

const tierColors: Record<string, string> = {
  PLATINUM: 'bg-gray-200 text-gray-800',
  GOLD: 'bg-amber-200 text-amber-800',
  SILVER: 'bg-slate-200 text-slate-700',
  BRONZE: 'bg-orange-200 text-orange-800',
}

export function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [website, setWebsite] = useState('')
  const [tier, setTier] = useState('BRONZE')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')

  useEffect(() => {
    fetchInvestors()
  }, [])

  const fetchInvestors = async () => {
    try {
      const res = await fetch('/api/admin/investors')
      if (res.ok) {
        const data = await res.json()
        setInvestors(data.investors || [])
      }
    } catch {
      toast.error('Failed to fetch investors')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setLogoUrl('')
    setWebsite('')
    setTier('BRONZE')
    setDescription('')
    setDisplayOrder('0')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (inv: Investor) => {
    setEditingId(inv.id)
    setName(inv.name)
    setLogoUrl(inv.logoUrl || '')
    setWebsite(inv.website || '')
    setTier(inv.tier)
    setDescription(inv.description || '')
    setDisplayOrder(inv.displayOrder.toString())
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const url = editingId
        ? '/api/admin/investors'
        : '/api/admin/investors'
      const method = editingId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        website: website.trim() || null,
        tier,
        description: description.trim() || null,
        displayOrder: parseInt(displayOrder) || 0,
      }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingId ? 'Investor updated' : 'Investor created')
        setDialogOpen(false)
        resetForm()
        fetchInvestors()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (inv: Investor) => {
    try {
      const res = await fetch('/api/admin/investors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inv.id, isActive: !inv.isActive }),
      })
      if (res.ok) {
        toast.success(inv.isActive ? 'Investor hidden' : 'Investor shown')
        fetchInvestors()
      }
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleDelete = async (inv: Investor) => {
    if (!confirm(`Delete "${inv.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/investors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: inv.id }),
      })
      if (res.ok) {
        toast.success('Investor deleted')
        fetchInvestors()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Investors & Partners</h2>
          <p className="text-sm text-muted-foreground">Manage logos displayed on public pages</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Investor
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
          ))}
        </div>
      ) : investors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No investors yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add investors and partners to showcase on public pages.</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Investor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {investors.map((inv) => (
            <Card key={inv.id} className={!inv.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border-2 border-muted flex items-center justify-center overflow-hidden shrink-0">
                    {inv.logoUrl ? (
                      <img src={inv.logoUrl} alt={inv.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{inv.name}</p>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 shrink-0 ${tierColors[inv.tier] || ''}`}>
                        {inv.tier}
                      </Badge>
                      {!inv.isActive && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">Hidden</Badge>
                      )}
                    </div>
                    {inv.description && (
                      <p className="text-xs text-muted-foreground truncate">{inv.description}</p>
                    )}
                    {inv.website && (
                      <p className="text-xs text-primary truncate">{inv.website}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={inv.isActive}
                      onCheckedChange={() => handleToggleActive(inv)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(inv)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(inv)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Investor' : 'Add Investor'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update investor details' : 'Add a new investor or partner'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Company name" />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()} className="gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
