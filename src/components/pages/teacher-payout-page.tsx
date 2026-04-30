'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Wallet,
  Banknote,
  Loader2,
  Building,
  CreditCard,
  User,
  Hash,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface PayoutData {
  availableBalance: number
  pendingPayouts: number
  commissionRate: number
  bankDetails: {
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
  } | null
  payouts: Array<{
    id: string
    amount: number
    netAmount: number
    commission: number
    status: string
    createdAt: string
    reference: string
  }>
}

const payoutStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600',
  PROCESSING: 'bg-blue-500/10 text-blue-600',
  COMPLETED: 'bg-green-500/10 text-green-600',
  FAILED: 'bg-red-500/10 text-red-600',
}

const payoutStatusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  PROCESSING: Send,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
}

export function TeacherPayoutPage() {
  const [data, setData] = useState<PayoutData | null>(null)
  const [loading, setLoading] = useState(true)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [savingBankDetails, setSavingBankDetails] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
  })
  const [successMessage, setSuccessMessage] = useState('')

  const { goBack } = useAppStore()
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchPayoutData()
  }, [])

  const fetchPayoutData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/teacher/payouts')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        if (json.bankDetails) {
          setBankDetails({
            bankName: json.bankDetails.bankName || '',
            accountNumber: json.bankDetails.accountNumber || '',
            accountName: json.bankDetails.accountName || '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch payout data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBankDetails = async () => {
    setSavingBankDetails(true)
    playClick()
    try {
      const res = await fetch('/api/teacher/bank-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails),
      })
      if (res.ok) {
        setSuccessMessage('Bank details saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchPayoutData()
      }
    } catch (error) {
      console.error('Failed to save bank details:', error)
    } finally {
      setSavingBankDetails(false)
    }
  }

  const requestPayout = async () => {
    const amount = Number(payoutAmount)
    if (!amount || amount < 5000) return
    if (!data?.bankDetails?.bankName || !data?.bankDetails?.accountNumber || !data?.bankDetails?.accountName) {
      alert('Please save your bank details first before requesting a payout.')
      return
    }

    setRequestingPayout(true)
    playClick()
    try {
      const res = await fetch('/api/teacher/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      if (res.ok) {
        setPayoutAmount('')
        setSuccessMessage('Payout requested successfully! You will be paid within 3-5 business days.')
        setTimeout(() => setSuccessMessage(''), 5000)
        fetchPayoutData()
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to request payout')
      }
    } catch (error) {
      console.error('Failed to request payout:', error)
    } finally {
      setRequestingPayout(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const availableBalance = data?.availableBalance || 0
  const commissionRate = data?.commissionRate || 15
  const requestedAmount = Number(payoutAmount) || 0

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Payouts
          </h1>
          <p className="text-sm text-muted-foreground">Manage your earnings and bank details</p>
        </div>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Balance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-card to-green-500/10">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-4xl font-extrabold text-primary">₦{availableBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending: ₦{(data?.pendingPayouts || 0).toLocaleString()} &middot; Commission Rate: {commissionRate}%
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Bank Name
              </Label>
              <Input
                placeholder="e.g., GTBank, Access Bank, First Bank"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                className="rounded-xl mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Account Number
              </Label>
              <Input
                placeholder="10-digit account number"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                className="rounded-xl mt-1.5"
                maxLength={10}
              />
            </div>
            <div>
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Account Name
              </Label>
              <Input
                placeholder="Name on your bank account"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                className="rounded-xl mt-1.5"
              />
            </div>
            <Button
              onClick={saveBankDetails}
              disabled={savingBankDetails || !bankDetails.bankName.trim() || !bankDetails.accountNumber.trim() || !bankDetails.accountName.trim()}
              className="w-full rounded-xl h-10 gap-1.5"
              variant="outline"
            >
              {savingBankDetails ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Save Bank Details
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Request Payout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" />
              Request Payout
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label className="text-sm font-medium">Amount (NGN)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₦</span>
                <Input
                  type="number"
                  placeholder="5000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="rounded-xl pl-8"
                  min="5000"
                  max={availableBalance}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[10px] h-6"
                  onClick={() => setPayoutAmount(String(Math.min(5000, availableBalance)))}
                >
                  ₦5,000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[10px] h-6"
                  onClick={() => setPayoutAmount(String(Math.floor(availableBalance / 2 / 1000) * 1000))}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-[10px] h-6"
                  onClick={() => setPayoutAmount(String(availableBalance))}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Fee Breakdown */}
            {requestedAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-muted/50 rounded-xl p-4 space-y-2"
              >
                <h4 className="text-sm font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Breakdown
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested Amount</span>
                  <span>₦{requestedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Platform Fee ({commissionRate}%)
                  </span>
                  <span className="text-orange-600">-₦{Math.round(requestedAmount * commissionRate / 100).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-bold">
                  <span>You Receive</span>
                  <span className="text-green-600">
                    ₦{Math.round(requestedAmount * (100 - commissionRate) / 100).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}

            <p className="text-[11px] text-muted-foreground">
              Minimum payout: ₦5,000. Payouts are processed within 3-5 business days.
            </p>

            <Button
              onClick={requestPayout}
              disabled={requestingPayout || !requestedAmount || requestedAmount < 5000 || requestedAmount > availableBalance}
              className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 gap-1.5"
            >
              {requestingPayout ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Banknote className="w-4 h-4" />
              )}
              Request Payout
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(!data?.payouts || data.payouts.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <Banknote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No payout history yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.payouts.map((payout) => {
                  const StatusIcon = payoutStatusIcons[payout.status] || Clock
                  return (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${payoutStatusColors[payout.status] || 'bg-muted'}`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">₦{payout.amount.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(payout.createdAt).toLocaleDateString('en-NG', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-[9px] rounded-full border-0 ${payoutStatusColors[payout.status] || ''}`}>
                          {payout.status}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">Ref: {payout.reference?.slice(0, 8)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
