'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Star, Lock, Unlock, Loader2, Save, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PlanTier } from '@/components/shared/plan-badge'
import { PREMIUM_FEATURES } from '@/lib/premium'

interface FeatureTierData {
  key: string
  name: string
  description: string
  minTier: PlanTier
  minTierFromDb: string
  isEnabled: boolean
  gemCost?: number
  overridesCount: number
  dbId: string | null
}

const tierColors: Record<PlanTier, string> = {
  FREE: 'text-gray-500',
  PREMIUM: 'text-amber-500',
}

const tierBadges: Record<PlanTier, { bg: string; text: string }> = {
  FREE: { bg: 'bg-gray-100', text: 'text-gray-600' },
  PREMIUM: { bg: 'bg-amber-100', text: 'text-amber-600' },
}

export function AdminFeatureTiersPage() {
  const [features, setFeatures] = useState<FeatureTierData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      const res = await fetch('/api/admin/feature-tiers')
      if (res.ok) {
        const data = await res.json()
        setFeatures(data)
      }
    } catch (error) {
      console.error('Error fetching features:', error)
      toast.error('Failed to load features')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMinTier = async (featureKey: string, newTier: PlanTier) => {
    setSaving(featureKey)
    try {
      const res = await fetch('/api/admin/feature-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, minTier: newTier }),
      })

      if (res.ok) {
        toast.success('Feature tier updated')
        fetchFeatures()
      } else {
        toast.error('Failed to update feature tier')
      }
    } catch (error) {
      toast.error('Failed to update feature tier')
    } finally {
      setSaving(null)
    }
  }

  const handleToggleEnabled = async (featureKey: string, isEnabled: boolean) => {
    setSaving(featureKey)
    try {
      const res = await fetch('/api/admin/feature-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, isEnabled }),
      })

      if (res.ok) {
        toast.success(`Feature ${isEnabled ? 'enabled' : 'disabled'}`)
        fetchFeatures()
      } else {
        toast.error('Failed to update feature')
      }
    } catch (error) {
      toast.error('Failed to update feature')
    } finally {
      setSaving(null)
    }
  }

  const handleUpdateGemCost = async (featureKey: string, gemCost: number | undefined) => {
    setSaving(featureKey)
    try {
      const res = await fetch('/api/admin/feature-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featureKey, gemCost }),
      })

      if (res.ok) {
        toast.success('Gem cost updated')
        fetchFeatures()
      } else {
        toast.error('Failed to update gem cost')
      }
    } catch (error) {
      toast.error('Failed to update gem cost')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const featuresByCategory = {
    LEARNING: features.filter(f => 
      ['ADVANCED_ANALYTICS', 'EXAM_HUB', 'DETAILED_REPORTS', 'LEARNING_PATHS'].includes(f.key)
    ),
    ENGAGEMENT: features.filter(f =>
      ['BOSS_BATTLES', 'MYSTERY_BOXES', 'STUDY_GROUPS'].includes(f.key)
    ),
    UTILITY: features.filter(f =>
      ['UNLIMITED_HEARTS', 'DOWNLOAD_CERTIFICATES', 'DOWNLOAD_LESSONS', 'AD_FREE'].includes(f.key)
    ),
    SOCIAL: features.filter(f =>
      ['CUSTOM_AVATARS', 'PRIORITY_SUPPORT'].includes(f.key)
    ),
    SPECIAL: features.filter(f =>
      ['TEACHER_BOOKING', 'DOUBLE_GEMS'].includes(f.key)
    ),
  }

  const categories = [
    { key: 'LEARNING', label: 'Learning Features', icon: '📚' },
    { key: 'ENGAGEMENT', label: 'Gamification', icon: '🎮' },
    { key: 'UTILITY', label: 'Utility Features', icon: '⚡' },
    { key: 'SOCIAL', label: 'Social & Support', icon: '👥' },
    { key: 'SPECIAL', label: 'Special Features', icon: '👑' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feature Access Tiers</h2>
        <p className="text-muted-foreground">
          Control which subscription tier is required to access each feature
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tier Hierarchy</CardTitle>
          <CardDescription>
            Higher tiers include all features from lower tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['FREE', 'STARTER', 'PRO', 'SCHOLAR', 'SCHOLAR_PLUS'] as PlanTier[]).map((tier, index) => (
              <div key={tier} className="flex items-center gap-2">
                <Badge className={`${tierBadges[tier].bg} ${tierBadges[tier].text} border-0`}>
                  {tier}
                </Badge>
                {index < 4 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <div key={category.key} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{category.icon}</span>
            <h3 className="text-lg font-semibold">{category.label}</h3>
          </div>

          <div className="grid gap-4">
            {featuresByCategory[category.key as keyof typeof featuresByCategory]?.map((feature) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={!feature.isEnabled ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{feature.name}</h4>
                          {!feature.isEnabled && (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                        {feature.overridesCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {feature.overridesCount} user override(s) applied
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Required Tier:</Label>
                            <Select
                              value={feature.minTier}
                              onValueChange={(value) => handleUpdateMinTier(feature.key, value as PlanTier)}
                              disabled={saving === feature.key || !feature.isEnabled}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(['FREE', 'STARTER', 'PRO', 'SCHOLAR', 'SCHOLAR_PLUS'] as PlanTier[]).map((tier) => (
                                  <SelectItem key={tier} value={tier}>
                                    <span className={tierColors[tier]}>{tier}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Gem Cost:</Label>
                            <Input
                              type="number"
                              className="w-20 h-8"
                              placeholder="None"
                              defaultValue={feature.gemCost || ''}
                              onBlur={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : undefined
                                if (value !== feature.gemCost) {
                                  handleUpdateGemCost(feature.key, value)
                                }
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleEnabled(feature.key, !feature.isEnabled)}
                              disabled={saving === feature.key}
                            >
                              {feature.isEnabled ? (
                                <Lock className="w-4 h-4 text-green-600" />
                              ) : (
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            {saving === feature.key && (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
