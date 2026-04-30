'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, ExternalLink, Gift, Gem, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { useSoundEffect } from '@/hooks/use-sound'

interface ReferralData {
  referralCode: string
  totalReferrals: number
  claimedRewards: number
  totalGemsEarned: number
  rewardPerReferral: number
  referrals: Array<{
    id: string
    referredEmail: string
    rewardClaimed: boolean
    createdAt: string
  }>
}

export function ReferralPage() {
  const { user } = useAuthStore()
  const playReferralReward = useSoundEffect('referralReward')
  const playClick = useSoundEffect('click')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchReferralStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/referral/status')
      const data = await res.json()
      setData(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReferralStatus()
  }, [fetchReferralStatus])

  const handleCopyCode = async () => {
    if (!data?.referralCode) return

    try {
      await navigator.clipboard.writeText(data.referralCode)
      setCopied(true)
      playCorrect()
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      playWrong()
      toast.error('Failed to copy')
    }
  }

  const handleWhatsAppShare = () => {
    if (!data?.referralCode) return

    const message = `Hey! I'm using SkoolarPlay to learn and earn rewards. Join me with my referral code: ${data.referralCode} 🎓✨`
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleSubmitReferral = async () => {
    if (!emailInput.trim()) {
      playWrong()
      toast.error('Please enter an email address')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        playWrong()
        toast.error(data.error || 'Failed to submit referral')
        setSubmitting(false)
        return
      }

      toast.success('Referral sent! Your friend will earn you 25 gems when they join 🎉')
      playReferralReward()
      setEmailInput('')
      fetchReferralStatus()
    } catch {
      playWrong()
      toast.error('Failed to submit referral')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-[#008751] to-[#005E38] p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-[#F59E0B]/10 translate-y-1/2" />

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl"
          >
            👥
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Invite Friends</h1>
            <p className="text-white/80 text-sm">Earn 25 gems for each friend who joins!</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Friends Invited', value: data?.totalReferrals || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { icon: Gift, label: 'Rewards Claimed', value: data?.claimedRewards || 0, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
          { icon: Gem, label: 'Gems Earned', value: data?.totalGemsEarned || 0, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { icon: PartyPopper, label: 'Pending', value: (data?.totalReferrals || 0) - (data?.claimedRewards || 0), color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-card border shadow-sm text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-sm mb-3">Your Referral Code</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-lg font-bold tracking-wider text-center">
                {data?.referralCode || '...'}
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                className="rounded-xl shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleWhatsAppShare}
                className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invite by Email */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-bold text-sm mb-3">Invite by Email</h3>
            <div className="flex gap-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="friend@example.com"
                className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReferral()}
              />
              <Button
                onClick={handleSubmitReferral}
                disabled={submitting || !emailInput.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                {submitting ? 'Sending...' : 'Invite'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reward Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-[#F59E0B]/5 rounded-2xl p-4 border border-[#F59E0B]/20"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h3 className="font-bold text-sm text-[#F59E0B]">How it works</h3>
            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
              <li>1. Share your referral code with friends</li>
              <li>2. They sign up using your code</li>
              <li>3. You both earn 25 gems!</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Referral History */}
      {data && data.referrals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-sm mb-3">Referral History</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center justify-between p-3 rounded-xl bg-card border text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                    {ref.referredEmail.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{ref.referredEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  {ref.rewardClaimed ? (
                    <Badge className="bg-green-100 text-green-700 text-xs border-0">
                      <Gem className="w-3 h-3 mr-1" />Rewarded
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
