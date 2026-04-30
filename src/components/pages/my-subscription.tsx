'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Crown, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  months: number
}

interface SubscriptionData {
  plan?: string
  status?: string
  expiresAt?: string | null
  amount?: number
}

declare global {
  interface Window {
    PaystackPop?: {
      new: (options: PaystackOptions) => void
    }
  }
}

interface PaystackOptions {
  key: string
  email: string
  amount: number
  currency?: string
  ref?: string
  callback: (response: { reference: string; status: string; transaction: string }) => void
  onClose: () => void
  metadata?: Record<string, unknown>
}

export default function MySubscriptionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { navigateTo } = useAppStore()
  const { user, fetchSession } = useAuthStore()

  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<SubscriptionData | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  const userTier = (user as any)?.planTier || 'FREE'
  const isPremium = (user as any)?.isPremium || false
  const premiumExpiresAt = (user as any)?.premiumExpiresAt || null

  useEffect(() => {
    fetchData()

    const verified = searchParams.get('verified')
    const ref = searchParams.get('ref')
    if (verified === 'true' && ref) {
      verifyPayment(ref)
    }
  }, [searchParams])

  const loadPaystack = useCallback(() => {
    if (typeof window === 'undefined' || window.PaystackPop) {
      setPaystackLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    script.onload = () => setPaystackLoaded(true)
    document.body.appendChild(script)
  }, [])

  const verifyPayment = async (ref: string) => {
    try {
      const res = await fetch(`/api/subscription/verify?reference=${ref}`)
      const data = await res.json()
      
      if (data.verified) {
        toast.success('Payment verified! Your subscription is now active.')
        await fetchSession()
      } else {
        toast.error('Payment verification failed. Please contact support.')
      }
    } catch {
      toast.error('Failed to verify payment')
    }
    
    router.replace('/subscription')
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/subscription/initialize'),
        fetch('/api/subscription/status').catch(() => ({ ok: false, json: () => ({}) })),
      ])

      if (plansRes.ok) {
        const data = await plansRes.json()
        setPlans(data.plans || [])
      }

      if (subRes.ok) {
        const data = await subRes.json() as { hasActiveSubscription?: boolean; subscription?: SubscriptionData }
        setSubscription(data.hasActiveSubscription ? data.subscription : null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      loadPaystack()
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!window.PaystackPop) {
      toast.error('Payment system not loaded. Please refresh the page.')
      loadPaystack()
      return
    }

    setUpgrading(planId)
    try {
      const email = user?.email
      const res = await fetch('/api/subscription/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, email }),
      })

      if (!res.ok) {
        const error = await res.json()
        toast.error(error.error || 'Failed to initiate payment')
        setUpgrading(null)
        return
      }

      const data = await res.json()

      if (data.simulated) {
        toast.success('Subscription activated!')
        await fetchSession()
        setUpgrading(null)
        return
      }

      if (data.authorization_url) {
        const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY
        if (!paystackKey) {
          toast.error('Payment configuration error')
          setUpgrading(null)
          return
        }

        const plan = plans.find(p => p.id === planId)
        if (!plan) {
          toast.error('Invalid plan')
          setUpgrading(null)
          return
        }

        window.PaystackPop?.new({
          key: paystackKey,
          email: email || '',
          amount: plan.price * 100,
          ref: data.reference,
          currency: 'NGN',
          callback: async (response) => {
            if (response.status === 'success') {
              toast.success('Payment successful! Verifying...')
              await verifyPayment(response.reference)
            } else {
              toast.error('Payment was not completed')
            }
            setUpgrading(null)
          },
          onClose: () => {
            toast.info('Payment cancelled')
            setUpgrading(null)
          },
          metadata: {
            planId,
            userId: user?.id,
          },
        })
        return
      }

      toast.error('Unexpected response from payment system')
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

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Subscription</h1>
              <p className="text-muted-foreground text-sm">Manage your premium plan</p>
            </div>
          </div>
          <Badge className={isPremium ? 'bg-green-500' : 'bg-muted'}>
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
        </div>

        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Active Subscription
              </CardTitle>
              <CardDescription>
                Your premium features are unlocked
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Plan</p>
                  <p className="font-medium">{userTier}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expires</p>
                  <p className="font-medium">{formatDate(premiumExpiresAt)}</p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Need to change your plan? Choose a new plan below.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id} 
                className={plan.id === 'quarterly' ? 'border-amber-500 relative overflow-visible' : ''}
              >
                {plan.id === 'quarterly' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-amber-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-6">
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatPrice(plan.price)}
                    <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading !== null}
                  >
                    {upgrading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isPremium ? (
                      'Switch Plan'
                    ) : (
                      'Upgrade'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Unlimited Hearts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Ad-Free Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Download Certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Download Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Study Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Boss Battles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>2x Gem Bonus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advanced Analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" onClick={() => navigateTo('profile')}>
          Back to Profile
        </Button>
      </div>
    </div>
  )
}
