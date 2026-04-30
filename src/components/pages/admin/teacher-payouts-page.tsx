'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Send,
  Filter,
  Building,
  Hash,
  User,
  Banknote,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSoundEffect } from '@/hooks/use-sound'

type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ALL'

interface PayoutItem {
  id: string
  amount: number
  netAmount: number
  commission: number
  status: string
  createdAt: string
  reference: string
  teacher: {
    id: string
    name: string
    email: string
  } | null
  bankDetails: {
    bankName: string | null
    accountNumber: string | null
    accountName: string | null
  } | null
}

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  PENDING: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock, label: 'Pending' },
  PROCESSING: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Send, label: 'Processing' },
  COMPLETED: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle, label: 'Completed' },
  FAILED: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle, label: 'Failed' },
}

export function AdminTeacherPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<PayoutStatus>('ALL')
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; label: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchPayouts()
  }, [])

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teacher-payouts')
      if (res.ok) {
        const data = await res.json()
        setPayouts(Array.isArray(data) ? data : data.payouts || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayouts = useMemo(() => {
    if (activeTab === 'ALL') return payouts
    return payouts.filter((p) => p.status === activeTab)
  }, [payouts, activeTab])

  const statusCounts = useMemo(() => ({
    ALL: payouts.length,
    PENDING: payouts.filter((p) => p.status === 'PENDING').length,
    PROCESSING: payouts.filter((p) => p.status === 'PROCESSING').length,
    COMPLETED: payouts.filter((p) => p.status === 'COMPLETED').length,
    FAILED: payouts.filter((p) => p.status === 'FAILED').length,
  }), [payouts])

  const handleAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/teacher-payouts/${confirmAction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: confirmAction.action }),
      })
      if (res.ok) {
        fetchPayouts()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const totalAmount = filteredPayouts.reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" /> Teacher Payouts
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and process teacher payout requests</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as PayoutStatus[]).map((status) => {
          const count = statusCounts[status]
          return (
            <Button
              key={status}
              variant={activeTab === status ? 'default' : 'outline'}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => { playClick(); setActiveTab(status) }}
            >
              <Filter className="w-3 h-3" />
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1.5 text-[10px] rounded-full"
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-bold">₦{payouts.filter((p) => p.status === 'PENDING').reduce((a, p) => a + p.amount, 0).toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">{statusCounts.PENDING} requests</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Processing</span>
            </div>
            <p className="text-lg font-bold">₦{payouts.filter((p) => p.status === 'PROCESSING').reduce((a, p) => a + p.amount, 0).toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">{statusCounts.PROCESSING} requests</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <p className="text-lg font-bold">₦{payouts.filter((p) => p.status === 'COMPLETED').reduce((a, p) => a + p.amount, 0).toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">{statusCounts.COMPLETED} payouts</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total ({activeTab === 'ALL' ? 'All' : activeTab})</span>
            </div>
            <p className="text-lg font-bold">₦{totalAmount.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">{filteredPayouts.length} records</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Table */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredPayouts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} payout requests found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredPayouts.map((payout, i) => {
                const config = statusConfig[payout.status] || statusConfig.PENDING
                const StatusIcon = config.icon
                return (
                  <motion.div
                    key={payout.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                  >
                    {/* Teacher Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                        {payout.teacher?.name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{payout.teacher?.name || 'Unknown Teacher'}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{payout.teacher?.email || ''}</p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="sm:text-center shrink-0">
                      <p className="text-sm font-bold">₦{payout.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Net: ₦{payout.netAmount?.toLocaleString() || payout.amount.toLocaleString()}
                      </p>
                    </div>

                    {/* Bank Details */}
                    <div className="hidden md:block shrink-0 text-xs text-muted-foreground">
                      {payout.bankDetails?.bankName && (
                        <p className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {payout.bankDetails.bankName}
                        </p>
                      )}
                      {payout.bankDetails?.accountNumber && (
                        <p className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          ****{payout.bankDetails.accountNumber.slice(-4)}
                        </p>
                      )}
                      {payout.bankDetails?.accountName && (
                        <p className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {payout.bankDetails.accountName}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div className="shrink-0 text-xs text-muted-foreground">
                      <p>{new Date(payout.createdAt).toLocaleDateString('en-NG', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}</p>
                      <p className="text-[10px]">Ref: {payout.reference?.slice(0, 8) || '-'}</p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-[10px] rounded-full border ${config.color}`}>
                        <StatusIcon className="w-3 h-3 mr-0.5" />
                        {config.label}
                      </Badge>
                      {payout.status === 'PENDING' && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                            onClick={() => { playClick(); setConfirmAction({ id: payout.id, action: 'approve', label: 'Approve' }) }}
                            title="Mark as Processing"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => { playClick(); setConfirmAction({ id: payout.id, action: 'reject', label: 'Reject' }) }}
                            title="Mark as Failed"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                      {payout.status === 'PROCESSING' && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                            onClick={() => { playClick(); setConfirmAction({ id: payout.id, action: 'complete', label: 'Complete' }) }}
                            title="Mark as Completed"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => { playClick(); setConfirmAction({ id: payout.id, action: 'reject', label: 'Fail' }) }}
                            title="Mark as Failed"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label} Payout Request</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.label === 'Approve'
                ? 'This will mark the payout as PROCESSING. The teacher will be notified that their payout is being processed.'
                : confirmAction?.label === 'Complete'
                  ? 'This will mark the payout as COMPLETED. The teacher will receive their funds.'
                  : confirmAction?.label === 'Fail'
                    ? 'This will mark the payout as FAILED. The funds will be returned to the teacher\'s available balance.'
                    : 'Are you sure you want to proceed with this action?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={actionLoading}
              className={
                confirmAction?.label === 'Reject' || confirmAction?.label === 'Fail'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {confirmAction?.label || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
