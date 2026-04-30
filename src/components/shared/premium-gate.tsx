'use client'

import { useEffect, useState, useCallback } from 'react'
import { Crown, Lock, X, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { isFeatureUnlocked, type PremiumFeatureKey } from '@/lib/premium'
import { toast } from 'sonner'

interface PremiumGateProps {
  feature: PremiumFeatureKey
  featureName?: string
  featureDescription?: string
  children: React.ReactNode
  className?: string
  fallback?: React.ReactNode
}

interface Plan {
  id: string
  name: string
  price: number
  period: string
  months: number
}

const PREMIUM_FEATURES = [
  { key: 'UNLIMITED_HEARTS', name: 'Unlimited Hearts', description: 'Never run out of hearts again' },
  { key: 'AD_FREE', name: 'Ad-Free Experience', description: 'Focus on learning without ads' },
  { key: 'DOWNLOAD_CERTIFICATES', name: 'Download Certificates', description: 'Save your achievements' },
  { key: 'DOWNLOAD_LESSONS', name: 'Download Lessons', description: 'Study offline' },
  { key: 'STUDY_GROUPS', name: 'Study Groups', description: 'Learn with friends' },
  { key: 'BOSS_BATTLES', name: 'Boss Battles', description: 'Challenge yourself' },
  { key: 'DOUBLE_GEMS', name: '2x Gem Bonus', description: 'Earn double gems' },
  { key: 'ADVANCED_ANALYTICS', name: 'Advanced Analytics', description: 'Track your progress' },
]

function LoadingPlans() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

function UpgradeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const { navigateTo } = useAppStore()

  useEffect(() => {
    if (open) {
      fetchPlans()
    }
  }, [open])

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/subscription/initialize')
      if (res.ok) {
        const data = await res.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    setUpgrading(planId)
    try {
      const email = useAuthStore.getState().user?.email
      const userId = useAuthStore.getState().user?.id

      const res = await fetch('/api/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          email,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to initiate payment')
        setUpgrading(null)
        return
      }

      const data = await res.json()

      if (data.simulated) {
        toast.success('Subscription activated! Enjoy premium features.')
        setUpgrading(null)
        onClose()
        setTimeout(() => window.location.reload(), 1500)
        return
      }

      if (data.authorization_url) {
        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY
        
        if (!paystackKey || typeof window === 'undefined') {
          window.open(data.authorization_url, '_blank')
          toast.success('Redirecting to payment...')
        } else {
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v1/inline.js'
          script.async = true
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load Paystack'))
            document.body.appendChild(script)
          })

          const plan = plans.find(p => p.id === planId)
          
          if (window.PaystackPop) {
            window.PaystackPop.new({
              key: paystackKey,
              email: email || '',
              amount: (plan?.price || 0) * 100,
              ref: data.reference,
              currency: 'NGN',
              callback: async (response) => {
                if (response.status === 'success') {
                  toast.success('Payment successful! Verifying...')
                  try {
                    const verifyRes = await fetch(`/api/subscription/verify?reference=${response.reference}`)
                    const verifyData = await verifyRes.json()
                    if (verifyData.verified) {
                      toast.success('Subscription activated!')
                      setUpgrading(null)
                      onClose()
                      setTimeout(() => window.location.reload(), 1500)
                      return
                    }
                  } catch {
                    toast.error('Failed to verify payment')
                  }
                }
                toast.error('Payment verification failed')
                setUpgrading(null)
              },
              onClose: () => {
                toast.info('Payment cancelled')
                setUpgrading(null)
              },
              metadata: {
                planId,
                userId,
              },
            })
          } else {
            window.open(data.authorization_url, '_blank')
            toast.success('Redirecting to payment...')
          }
        }
        onClose()
        return
      }

      toast.info('Payment flow initiated.')
      onClose()
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Payment initialization failed')
    } finally {
      setUpgrading(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-bold">Upgrade to Premium</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Unlock all premium features and supercharge your learning!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                  <LoadingPlans />
                ) : plans.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No plans available. Please try again later.
                  </div>
                ) : plans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative p-4 rounded-xl border-2 transition-all bg-card ${
                      plan.id === 'quarterly'
                        ? 'border-amber-500 shadow-lg'
                        : 'border-border hover:border-amber-500/50'
                    }`}
                  >
                    {plan.id === 'quarterly' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mt-2">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <p className="text-2xl font-bold text-amber-600 mt-2">
                        {formatPrice(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600"
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={upgrading !== null}
                      >
                        {upgrading === plan.id ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Upgrade
                          </span>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-center">Premium Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PREMIUM_FEATURES.map((feature) => (
                    <div key={feature.key} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PremiumGate({
  feature,
  featureName,
  featureDescription,
  children,
  className,
  fallback,
}: PremiumGateProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isPremium = (user as any)?.isPremium || false
  const unlocked = isFeatureUnlocked(
    (user as any)?.isPremium || false,
    (user as any)?.premiumExpiresAt || null,
    JSON.parse((user as any)?.unlockedFeatures || '[]'),
    feature
  )

  if (unlocked) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <>
      {children}
      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  )
}

export function PremiumFeature({
  feature,
  featureName,
  featureDescription,
  children,
  className,
}: Omit<PremiumGateProps, 'fallback'>) {
  const user = useAuthStore((s) => s.user)
  const { navigateTo } = useAppStore()

  const isPremium = (user as any)?.isPremium || false
  const unlocked = isFeatureUnlocked(
    (user as any)?.isPremium || false,
    (user as any)?.premiumExpiresAt || null,
    JSON.parse((user as any)?.unlockedFeatures || '[]'),
    feature
  )

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold">{featureName || feature}</h3>
          {featureDescription && (
            <p className="text-sm text-muted-foreground mt-1">{featureDescription}</p>
          )}
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => navigateTo('upgrade')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Unlock
        </Button>
      </CardContent>
    </Card>
  )
}

export function PremiumButton({
  feature,
  featureName,
  onClick,
  children,
}: {
  feature?: PremiumFeatureKey
  featureName?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const user = useAuthStore((s) => s.user)
  const { navigateTo } = useAppStore()

  const isPremium = (user as any)?.isPremium || false
  const unlocked = feature
    ? isFeatureUnlocked(
        (user as any)?.isPremium || false,
        (user as any)?.premiumExpiresAt || null,
        JSON.parse((user as any)?.unlockedFeatures || '[]'),
        feature
      )
    : isPremium

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <Button className="bg-amber-500 hover:bg-amber-600" onClick={onClick || (() => navigateTo('upgrade'))}>
      <Crown className="w-4 h-4 mr-2" />
      {children}
    </Button>
  )
}

export function useUpgradeDialog() {
  const [open, setOpen] = useState(false)
  return { open, setOpen, UpgradeDialog: () => <UpgradeDialog open={open} onClose={() => setOpen(false)} /> }
}
