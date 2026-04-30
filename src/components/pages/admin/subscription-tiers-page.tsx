'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, Gem, Shield, Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PlanTier } from '@/components/shared/plan-badge'

interface SubscriptionTier {
  id: string
  key: string
  name: string
  displayName: string
  description?: string
  monthlyPrice: number
  quarterlyPrice: number
  annualPrice: number
  maxHearts: number
  maxGroupsCreate: number
  maxGroupsJoin: number
  dailyMessageLimit: number
  features: string
  color: string
  icon: string
  sortOrder: number
  isActive: boolean
}

const tierColors: Record<string, string> = {
  FREE: 'bg-gray-500',
  STARTER: 'bg-slate-400',
  PRO: 'bg-blue-500',
  SCHOLAR: 'bg-purple-500',
  SCHOLAR_PLUS: 'bg-amber-500',
}

const tierIcons: Record<string, React.ReactNode> = {
  FREE: <Shield className="w-4 h-4" />,
  STARTER: <Star className="w-4 h-4" />,
  PRO: <Gem className="w-4 h-4" />,
  SCHOLAR: <Star className="w-4 h-4" />,
  SCHOLAR_PLUS: <Crown className="w-4 h-4" />,
}

export function AdminSubscriptionTiersPage() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [loading, setLoading] = useState(true)
  const [editDialog, setEditDialog] = useState(false)
  const [editingTier, setEditingTier] = useState<SubscriptionTier | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    key: '',
    name: '',
    displayName: '',
    description: '',
    monthlyPrice: '0',
    quarterlyPrice: '0',
    annualPrice: '0',
    maxHearts: '5',
    maxGroupsCreate: '1',
    maxGroupsJoin: '3',
    dailyMessageLimit: '10',
    color: '#6B7280',
    icon: 'star',
    sortOrder: '0',
    isActive: true,
  })

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/admin/subscription-tiers')
      if (res.ok) {
        const data = await res.json()
        setTiers(data)
      }
    } catch (error) {
      console.error('Error fetching tiers:', error)
      toast.error('Failed to load subscription tiers')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (tier?: SubscriptionTier) => {
    if (tier) {
      setEditingTier(tier)
      setFormData({
        key: tier.key,
        name: tier.name,
        displayName: tier.displayName,
        description: tier.description || '',
        monthlyPrice: tier.monthlyPrice.toString(),
        quarterlyPrice: tier.quarterlyPrice.toString(),
        annualPrice: tier.annualPrice.toString(),
        maxHearts: tier.maxHearts.toString(),
        maxGroupsCreate: tier.maxGroupsCreate.toString(),
        maxGroupsJoin: tier.maxGroupsJoin.toString(),
        dailyMessageLimit: tier.dailyMessageLimit.toString(),
        color: tier.color,
        icon: tier.icon,
        sortOrder: tier.sortOrder.toString(),
        isActive: tier.isActive,
      })
    } else {
      setEditingTier(null)
      setFormData({
        key: '',
        name: '',
        displayName: '',
        description: '',
        monthlyPrice: '0',
        quarterlyPrice: '0',
        annualPrice: '0',
        maxHearts: '5',
        maxGroupsCreate: '1',
        maxGroupsJoin: '3',
        dailyMessageLimit: '10',
        color: '#6B7280',
        icon: 'star',
        sortOrder: tiers.length.toString(),
        isActive: true,
      })
    }
    setEditDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...formData,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        quarterlyPrice: parseFloat(formData.quarterlyPrice),
        annualPrice: parseFloat(formData.annualPrice),
        maxHearts: parseInt(formData.maxHearts),
        maxGroupsCreate: parseInt(formData.maxGroupsCreate),
        maxGroupsJoin: parseInt(formData.maxGroupsJoin),
        dailyMessageLimit: parseInt(formData.dailyMessageLimit),
        sortOrder: parseInt(formData.sortOrder),
      }

      const url = editingTier 
        ? `/api/admin/subscription-tiers/${editingTier.id}`
        : '/api/admin/subscription-tiers'
      
      const method = editingTier ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingTier ? 'Tier updated successfully' : 'Tier created successfully')
        setEditDialog(false)
        fetchTiers()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save tier')
      }
    } catch (error) {
      console.error('Error saving tier:', error)
      toast.error('Failed to save tier')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (tier: SubscriptionTier) => {
    try {
      const res = await fetch(`/api/admin/subscription-tiers/${tier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tier.isActive }),
      })

      if (res.ok) {
        toast.success(`${tier.displayName} ${!tier.isActive ? 'enabled' : 'disabled'}`)
        fetchTiers()
      } else {
        toast.error('Failed to update tier')
      }
    } catch (error) {
      toast.error('Failed to update tier')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Subscription Tiers</h2>
          <p className="text-muted-foreground">Manage pricing plans and features</p>
        </div>
        <Button onClick={() => openEditDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Tier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiers.sort((a, b) => a.sortOrder - b.sortOrder).map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`relative overflow-hidden ${!tier.isActive ? 'opacity-60' : ''}`}>
              <div 
                className={`absolute top-0 left-0 right-0 h-2 ${tierColors[tier.key] || 'bg-gray-500'}`} 
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${tierColors[tier.key] || 'bg-gray-500'}`}
                    >
                      {tierIcons[tier.key] || <Star className="w-4 h-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tier.displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tier.name}</p>
                    </div>
                  </div>
                  <Badge variant={tier.isActive ? 'default' : 'secondary'}>
                    {tier.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly</span>
                    <span className="font-semibold">
                      {tier.monthlyPrice > 0 ? `₦${tier.monthlyPrice.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quarterly</span>
                    <span className="font-semibold">
                      {tier.quarterlyPrice > 0 ? `₦${tier.quarterlyPrice.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual</span>
                    <span className="font-semibold">
                      {tier.annualPrice > 0 ? `₦${tier.annualPrice.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Hearts: </span>
                    <span className="font-medium">{tier.maxHearts === 999 ? '∞' : tier.maxHearts}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Groups: </span>
                    <span className="font-medium">{tier.maxGroupsCreate === 999 ? '∞' : tier.maxGroupsCreate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Join: </span>
                    <span className="font-medium">{tier.maxGroupsJoin === 999 ? '∞' : tier.maxGroupsJoin}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Messages: </span>
                    <span className="font-medium">{tier.dailyMessageLimit === 999 ? '∞' : tier.dailyMessageLimit}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => openEditDialog(tier)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleActive(tier)}
                  >
                    {tier.isActive ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? `Edit ${editingTier.displayName}` : 'Create New Tier'}
            </DialogTitle>
            <DialogDescription>
              Configure pricing and features for this subscription tier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Tier Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                  placeholder="e.g., STARTER"
                  disabled={!!editingTier}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Internal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter Plan"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g., Starter Member"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this tier"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-base">Pricing (₦)</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice" className="text-sm">Monthly</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarterlyPrice" className="text-sm">Quarterly</Label>
                  <Input
                    id="quarterlyPrice"
                    type="number"
                    value={formData.quarterlyPrice}
                    onChange={(e) => setFormData({ ...formData, quarterlyPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualPrice" className="text-sm">Annual</Label>
                  <Input
                    id="annualPrice"
                    type="number"
                    value={formData.annualPrice}
                    onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base">Limits</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="maxHearts" className="text-sm">Max Hearts (999 = unlimited)</Label>
                  <Input
                    id="maxHearts"
                    type="number"
                    value={formData.maxHearts}
                    onChange={(e) => setFormData({ ...formData, maxHearts: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupsCreate" className="text-sm">Max Groups Create (999 = unlimited)</Label>
                  <Input
                    id="maxGroupsCreate"
                    type="number"
                    value={formData.maxGroupsCreate}
                    onChange={(e) => setFormData({ ...formData, maxGroupsCreate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupsJoin" className="text-sm">Max Groups Join (999 = unlimited)</Label>
                  <Input
                    id="maxGroupsJoin"
                    type="number"
                    value={formData.maxGroupsJoin}
                    onChange={(e) => setFormData({ ...formData, maxGroupsJoin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyMessageLimit" className="text-sm">Daily Messages (999 = unlimited)</Label>
                  <Input
                    id="dailyMessageLimit"
                    type="number"
                    value={formData.dailyMessageLimit}
                    onChange={(e) => setFormData({ ...formData, dailyMessageLimit: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">Allow users to subscribe to this tier</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.key || !formData.displayName}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
