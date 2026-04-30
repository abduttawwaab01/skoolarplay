'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Gift,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'

interface DonationTier {
  name: string
  amount: number
  description: string
  perks: string
}

interface Testimonial {
  name: string
  role: string
  text: string
}

interface WhyInvest {
  title: string
  description: string
}

interface DonationSettings {
  message: string
  goalAmount: number
  currentAmount: number
  currency: string
  isActive: boolean
  tiers: DonationTier[]
  testimonials: Testimonial[]
  whyInvest: WhyInvest[]
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useState(0)[0]

  useEffect(() => {
    let start = 0
    const duration = 2000
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <span>{count.toLocaleString()}{suffix}</span>
}

export function DonatePage() {
  const { goBack } = useAppStore()
  const { user, isAuthenticated } = useAuthStore()
  const playClick = useSoundEffect('click')
  const [settings, setSettings] = useState<DonationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Form fields
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donationMessage, setDonationMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/donate')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings)
        } else {
          toast.error('Failed to load donation settings')
        }
      } catch (error) {
        console.error('Failed to fetch donation settings:', error)
        toast.error('Failed to load donation settings')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const progressPercent = settings
    ? Math.round((settings.currentAmount / settings.goalAmount) * 100)
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const openDonationDialog = (tier: DonationTier) => {
    playClick()
    setSelectedTier(tier)
    // Pre-fill form with user info if authenticated
    if (user) {
      setDonorName(user.name)
      setDonorEmail(user.email)
    } else {
      setDonorName('')
      setDonorEmail('')
    }
    setCustomAmount(tier.amount.toString())
    setDonationMessage('')
    setIsAnonymous(false)
    setDialogOpen(true)
  }

  const handleDonate = async () => {
    const amount = parseFloat(customAmount)
    if (!donorName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!donorEmail.trim() && !isAnonymous) {
      toast.error('Please enter your email or mark as anonymous')
      return
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Check if donation system is active
    if (settings && !settings.isActive) {
      toast.error('Donations are currently disabled')
      return
    }

    setProcessing(true)
    try {
      const res = await fetch('/api/donate/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tier: selectedTier?.name || 'Custom',
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim() || null,
          message: donationMessage.trim() || null,
          isAnonymous,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to initialize payment')
      }

      const data = await res.json()

      // Redirect to Paystack
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      } else {
        throw new Error('No payment URL received')
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment initialization failed')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (settings && !settings.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Donations Disabled</h2>
          <p className="text-muted-foreground">Donations are currently not accepted. Please check back later.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - Fixed at top */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full bg-background/80 backdrop-blur-sm">
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <FadeIn>
            <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-red-500/10 text-red-600 border-0 mb-4">
              <Heart className="w-3.5 h-3.5 mr-1.5" />
              Support Nigerian Education
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Invest in the <span className="text-green-gradient">Future</span> of Learning
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {settings?.message || "Your donation helps keep SkoolarPlay free for thousands of Nigerian students. Every contribution makes a real difference."}
            </p>
          </FadeIn>

          {/* Progress Bar */}
          <FadeIn delay={0.3}>
            <Card className="max-w-lg mx-auto border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Fundraising Goal</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(settings?.currentAmount || 0)} of {formatCurrency(settings?.goalAmount || 5000000)}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3 mb-2" />
                <p className="text-xs text-muted-foreground">{progressPercent}% funded</p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 50000, suffix: '+', label: 'Students Helped', icon: Users },
              { value: 100, suffix: '+', label: 'Free Courses', icon: BookOpen },
              { value: 36, suffix: '', label: 'States Reached', icon: Target },
              { value: 6, suffix: '', label: 'Nigerian Languages', icon: GraduationCap },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-5 text-center">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-extrabold text-green-gradient">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Tiers */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold mb-2">Choose Your Impact</h2>
              <p className="text-muted-foreground">Every naira counts. Select a tier that fits your capacity.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {(settings?.tiers || [
              { name: 'Supporter', amount: 1000, description: 'Help cover basic server costs', perks: 'Name on supporters page' },
              { name: 'Champion', amount: 5000, description: 'Fund a month of learning for 10 students', perks: 'Supporter badge + early access' },
              { name: 'Patron', amount: 25000, description: 'Sponsor a full classroom for a term', perks: 'All Champion perks + mentorship access' },
              { name: 'Partner', amount: 100000, description: 'Strategic investment in Nigerian education', perks: 'All Patron perks + advisory board seat' },
            ]).map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 0.1}>
                <Card className={`relative overflow-hidden hover:shadow-lg transition-shadow ${tier.amount === 5000 ? 'border-2 border-primary shadow-md' : ''}`}>
                  {tier.amount === 5000 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground text-[10px]">POPULAR</Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                    <p className="text-3xl font-extrabold text-green-gradient mb-2">
                      {formatCurrency(tier.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                    <div className="flex items-start gap-2 mb-4">
                      <Gift className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{tier.perks}</p>
                    </div>
                    <Button
                      className={`w-full rounded-full gap-2 ${tier.amount === 5000 ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={tier.amount === 5000 ? 'default' : 'outline'}
                      onClick={() => openDonationDialog(tier)}
                    >
                      <Heart className="w-4 h-4" />
                      Donate {formatCurrency(tier.amount)}
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Invest */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold mb-2">Why Invest in SkoolarPlay?</h2>
              <p className="text-muted-foreground">Your investment drives real, measurable impact.</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {(settings?.whyInvest || [
              { title: 'Direct Impact', description: '100% of donations go directly to platform development, content creation, and student access.' },
              { title: 'Tax Deductible', description: 'Your donation may be eligible for tax deductions under Nigerian law.' },
              { title: 'Transparency', description: 'We publish quarterly impact reports showing exactly how funds are used.' },
              { title: 'Scalable', description: "Your contribution helps us reach more students across Nigeria's 36 states." },
            ]).map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <Card className="border-0 shadow-sm h-full">
                  <CardContent className="p-5 flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold mb-2">What Our Supporters Say</h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {(settings?.testimonials && settings.testimonials.length > 0 ? settings.testimonials : [
              { name: 'Be the first supporter', role: 'Join our mission', text: 'Your support can inspire others to contribute to Nigerian education.' },
            ]).map((testimonial, i) => (
              <FadeIn key={testimonial.name} delay={i * 0.1}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <p className="text-sm italic mb-4">"{testimonial.text}"</p>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Donation</DialogTitle>
            <DialogDescription>
              You're about to donate {selectedTier && formatCurrency(selectedTier.amount)}. Enter your details to proceed with payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Your Name *</Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorEmail">Email Address *</Label>
              <Input
                id="donorEmail"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={isAnonymous}
              />
              <p className="text-xs text-muted-foreground">
                {isAnonymous ? 'Anonymous donation - email not required' : "We'll send you a receipt"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount (NGN) *</Label>
              <Input
                id="amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Input
                id="message"
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                placeholder="Add a message of support..."
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="anonymous">Donate Anonymously</Label>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => {
                  setIsAnonymous(checked)
                  if (checked) setDonorEmail('')
                }}
              />
            </div>

            {/* Summary */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Donation Amount:</span>
                <span className="font-bold">{formatCurrency(parseFloat(customAmount) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Method:</span>
                <span>Paystack</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Currency:</span>
                <span>{settings?.currency || 'NGN'}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleDonate} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Proceed to Payment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
