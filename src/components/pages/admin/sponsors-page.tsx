'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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

interface Sponsor {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  tier: string
  description: string | null
  donatedAmount: number
  isActive: boolean
  displayOrder: number
  createdAt: string
}

const TIERS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

const tierColors: Record<string, string> = {
  DIAMOND: 'bg-blue-200 text-blue-800',
  PLATINUM: 'bg-gray-200 text-gray-800',
  GOLD: 'bg-amber-200 text-amber-800',
  SILVER: 'bg-slate-200 text-slate-700',
  BRONZE: 'bg-orange-200 text-orange-800',
}

export function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
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
  const [donatedAmount, setDonatedAmount] = useState('0')
  const [displayOrder, setDisplayOrder] = useState('0')

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const res = await fetch('/api/admin/sponsors')
      if (res.ok) {
        const data = await res.json()
        setSponsors(data.sponsors || [])
      }
    } catch {
      toast.error('Failed to fetch sponsors')
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
    setDonatedAmount('0')
    setDisplayOrder('0')
    setEditingId(null)
  }

  const openCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEdit = (sp: Sponsor) => {
    setEditingId(sp.id)
    setName(sp.name)
    setLogoUrl(sp.logoUrl || '')
    setWebsite(sp.website || '')
    setTier(sp.tier)
    setDescription(sp.description || '')
    setDonatedAmount(sp.donatedAmount.toString())
    setDisplayOrder(sp.displayOrder.toString())
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const url = '/api/admin/sponsors'
      const method = editingId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        website: website.trim() || null,
        tier,
        description: description.trim() || null,
        donatedAmount: parseFloat(donatedAmount) || 0,
        displayOrder: parseInt(displayOrder) || 0,
      }
      if (editingId) body.id = editingId

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingId ? 'Sponsor updated' : 'Sponsor created')
        setDialogOpen(false)
        resetForm()
        fetchSponsors()
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

  const handleToggleActive = async (sp: Sponsor) => {
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sp.id, isActive: !sp.isActive }),
      })
      if (res.ok) {
        toast.success(sp.isActive ? 'Sponsor hidden' : 'Sponsor shown')
        fetchSponsors()
      }
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const handleDelete = async (sp: Sponsor) => {
    if (!confirm(`Delete "${sp.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sp.id }),
      })
      if (res.ok) {
        toast.success('Sponsor deleted')
        fetchSponsors()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Sponsors & Donors</h2>
          <p className="text-sm text-muted-foreground">Manage sponsors and donors who support SkoolarPlay</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Sponsor
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-primary">{sponsors.length}</p>
            <p className="text-xs text-muted-foreground">Total Sponsors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-green-600">
              {sponsors.filter(s => s.isActive).length}
            </p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-amber-600">
              {formatCurrency(sponsors.reduce((sum, s) => sum + s.donatedAmount, 0))}
            </p>
            <p className="text-xs text-muted-foreground">Total Donated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-extrabold text-blue-600">
              {sponsors.filter(s => s.tier === 'PLATINUM' || s.tier === 'DIAMOND').length}
            </p>
            <p className="text-xs text-muted-foreground">Premium Sponsors</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
          ))}
        </div>
      ) : sponsors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No sponsors yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add sponsors and donors to showcase their support on public pages.</p>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Sponsor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sponsors.map((sp) => (
            <Card key={sp.id} className={!sp.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border-2 border-muted flex items-center justify-center overflow-hidden shrink-0">
                    {sp.logoUrl ? (
                      <img src={sp.logoUrl} alt={sp.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Heart className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{sp.name}</p>
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 shrink-0 ${tierColors[sp.tier] || ''}`}>
                        {sp.tier}
                      </Badge>
                      {!sp.isActive && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0">Hidden</Badge>
                      )}
                    </div>
                    {sp.description && (
                      <p className="text-xs text-muted-foreground truncate">{sp.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-0.5">
                      {sp.website && (
                        <p className="text-xs text-primary truncate">{sp.website}</p>
                      )}
                      {sp.donatedAmount > 0 && (
                        <p className="text-xs font-semibold text-green-600">{formatCurrency(sp.donatedAmount)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={sp.isActive}
                      onCheckedChange={() => handleToggleActive(sp)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(sp)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(sp)}>
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
            <DialogTitle>{editingId ? 'Edit Sponsor' : 'Add Sponsor'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update sponsor details' : 'Add a new sponsor or donor'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sponsor name" />
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
                <Label>Donated Amount (₦)</Label>
                <Input type="number" value={donatedAmount} onChange={(e) => setDonatedAmount(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" />
              </div>
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
