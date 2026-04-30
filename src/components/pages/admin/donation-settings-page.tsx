'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface DonationSettings {
  id: string
  goalAmount: number
  currentAmount: number
  currency: string
  paystackPublicKey: string | null
  paystackSecretKey: string | null
  message: string | null
  isActive: boolean
  updatedAt: string
  updatedBy: string
}

export function DonationSettingsPage() {
  const [settings, setSettings] = useState<DonationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [goalAmount, setGoalAmount] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [paystackPublicKey, setPaystackPublicKey] = useState('')
  const [paystackSecretKey, setPaystackSecretKey] = useState('')
  const [message, setMessage] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/donation-settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        // Populate form
        setGoalAmount(data.settings.goalAmount.toString())
        setCurrency(data.settings.currency)
        setPaystackPublicKey(data.settings.paystackPublicKey || '')
        setPaystackSecretKey(data.settings.paystackSecretKey || '')
        setMessage(data.settings.message || '')
        setIsActive(data.settings.isActive)
      } else {
        toast.error('Failed to fetch donation settings')
      }
    } catch {
      toast.error('Failed to fetch donation settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const goal = parseFloat(goalAmount)
    if (isNaN(goal) || goal <= 0) {
      toast.error('Please enter a valid goal amount')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/donation-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalAmount: goal,
          currency,
          paystackPublicKey: paystackPublicKey || null,
          paystackSecretKey: paystackSecretKey || null,
          message: message || null,
          isActive,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        toast.success('Donation settings saved successfully')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Donation Settings</h1>
          <p className="text-muted-foreground">Configure donation goals, payment keys, and messaging</p>
        </div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Fundraising Configuration</CardTitle>
          <CardDescription>Set up your platform's donation campaign</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Goal Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Fundraising Goal (NGN)</Label>
              <Input
                id="goalAmount"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="5000000"
              />
              <p className="text-xs text-muted-foreground">
                The total amount you want to raise
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="NGN"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Currently only NGN is supported
              </p>
            </div>
          </div>

          {/* Current Amount Display */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Raised</p>
                <p className="text-2xl font-bold text-green-600">
                  ₦{settings?.currentAmount.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">
                  {settings ? Math.round((settings.currentAmount / settings.goalAmount) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Paystack Keys */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="w-4 h-4" />
              Paystack Integration
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publicKey">Public Key</Label>
                <Input
                  id="publicKey"
                  type="password"
                  value={paystackPublicKey}
                  onChange={(e) => setPaystackPublicKey(e.target.value)}
                  placeholder="pk_test_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">Secret Key (encrypted)</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={paystackSecretKey}
                  onChange={(e) => setPaystackSecretKey(e.target.value)}
                  placeholder="sk_test_..."
                />
                <p className="text-xs text-muted-foreground">
                  Secret key is stored encrypted in the database. Only admins can view it.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Campaign Message / Headline</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Help us reach our goal to improve SkoolarPlay for all students..."
              rows={3}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Enable Donations</p>
              <p className="text-sm text-muted-foreground">
                Turn off to temporarily disable the donation page
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Donation Page Features</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Donors can contribute via Paystack payment gateway</p>
          <p>• Donations are tracked in real-time with a progress bar</p>
          <p>• Donor names (or anonymous) appear in the sponsor carousel based on tier</p>
          <p>• Admin can configure multiple donation tiers with different amounts</p>
          <p>• Automatic email receipts can be enabled (coming soon)</p>
        </CardContent>
      </Card>
    </div>
  )
}
