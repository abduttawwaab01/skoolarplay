'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Loader2, Plus, Edit, Trash2, Copy, Check, GiftIcon } from 'lucide-react'
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

interface GiftCode {
  id: string
  code: string
  tier: string | null
  duration: number
  gems: number | null
  usesTotal: number
  usesUsed: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  createdBy: string
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) result += '-'
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function AdminGiftCodesPage() {
  const [codes, setCodes] = useState<GiftCode[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialog, setCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    tier: 'PRO',
    duration: '1',
    gems: '0',
    usesTotal: '1',
    expiresIn: '30',
    quantity: '1',
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    try {
      const res = await fetch('/api/admin/gift-codes')
      if (res.ok) {
        const data = await res.json()
        setCodes(data)
      }
    } catch (error) {
      console.error('Error fetching gift codes:', error)
      toast.error('Failed to load gift codes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const quantity = parseInt(formData.quantity) || 1
      const codes: string[] = []

      for (let i = 0; i < quantity; i++) {
        const code = generateCode()
        codes.push(code)
      }

      for (const code of codes) {
        const expiresAt = formData.expiresIn ? 
          new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString() : null

        const res = await fetch('/api/admin/gift-codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            tier: formData.tier === 'NONE' ? null : formData.tier,
            duration: parseInt(formData.duration),
            gems: parseInt(formData.gems) || 0,
            usesTotal: parseInt(formData.usesTotal),
            expiresAt,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          toast.error(error.error || 'Failed to create code')
          break
        }
      }

      toast.success(`Created ${codes.length} gift code(s)`)
      setCreateDialog(false)
      fetchCodes()
    } catch (error) {
      console.error('Error creating codes:', error)
      toast.error('Failed to create codes')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (code: GiftCode) => {
    try {
      const res = await fetch(`/api/admin/gift-codes/${code.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !code.isActive }),
      })

      if (res.ok) {
        toast.success(`Code ${!code.isActive ? 'enabled' : 'disabled'}`)
        fetchCodes()
      } else {
        toast.error('Failed to update code')
      }
    } catch (error) {
      toast.error('Failed to update code')
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Code copied!')
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
          <h2 className="text-2xl font-bold">Gift Codes</h2>
          <p className="text-muted-foreground">Manage subscription gift codes for users</p>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Codes
        </Button>
      </div>

      <div className="grid gap-4">
        {codes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <GiftIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No gift codes yet</p>
              <p className="text-sm text-muted-foreground">Generate gift codes to give users free access</p>
            </CardContent>
          </Card>
        ) : (
          codes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={!code.isActive ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-lg">{code.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(code.code, code.id)}
                          >
                            {copiedId === code.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {code.tier || 'ANY'} - {code.duration}mo
                          </Badge>
                          {code.gems && code.gems > 0 && (
                            <Badge variant="secondary">
                              +{code.gems} gems
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {code.usesUsed}/{code.usesTotal} uses
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-sm">{formatDate(code.expiresAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={code.isActive}
                          onCheckedChange={() => handleToggleActive(code)}
                        />
                        <Badge variant={code.isActive ? 'default' : 'secondary'}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Gift Codes</DialogTitle>
            <DialogDescription>
              Create one or more gift codes for free subscriptions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => setFormData({ ...formData, tier: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Any Tier</SelectItem>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="SCHOLAR">Scholar</SelectItem>
                    <SelectItem value="SCHOLAR_PLUS">Scholar+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (months)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bonus Gems</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.gems}
                  onChange={(e) => setFormData({ ...formData, gems: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usesTotal}
                  onChange={(e) => setFormData({ ...formData, usesTotal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expires In (days)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 = never"
                  value={formData.expiresIn}
                  onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Generate {parseInt(formData.quantity) || 1} Code(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
