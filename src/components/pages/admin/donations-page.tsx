'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  Download,
  Search,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select'
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog'
 import { Switch } from '@/components/ui/switch'
 import { toast } from 'sonner'

interface Donation {
  id: string
  donorName: string
  donorEmail: string | null
  amount: number
  tier: string | null
  message: string | null
  isAnonymous: boolean
  paymentRef: string | null
  paymentStatus: string
  provider: string
  createdAt: string
  updatedAt: string
}

interface DonationStats {
  totalRaised: number
  donorCount: number
  totalDonations: number
  byStatus: Array<{
    paymentStatus: string
    _count: { id: number }
    _sum: { amount: number | null }
  }>
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

export function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Form state for manual donation entry
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    amount: '',
    tier: '',
    message: '',
    isAnonymous: false,
    paymentStatus: 'COMPLETED' as 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED',
  })

  useEffect(() => {
    fetchDonations()
  }, [page, statusFilter, searchQuery])

  const fetchDonations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', '20')
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const res = await fetch(`/api/admin/donations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations || [])
        setStats(data.stats)
        setTotalPages(data.pagination.pages)
      } else {
        toast.error('Failed to fetch donations')
      }
    } catch {
      toast.error('Failed to fetch donations')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      donorName: '',
      donorEmail: '',
      amount: '',
      tier: '',
      message: '',
      isAnonymous: false,
      paymentStatus: 'COMPLETED',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(formData.amount)
    if (!formData.donorName || isNaN(amount) || amount <= 0) {
      toast.error('Please fill in donor name and a valid amount')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount,
        }),
      })

      if (res.ok) {
        toast.success('Donation added successfully')
        setDialogOpen(false)
        resetForm()
        fetchDonations()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add donation')
      }
    } catch {
      toast.error('Failed to add donation')
    } finally {
      setSaving(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Donor', 'Email', 'Amount (NGN)', 'Tier', 'Status', 'Reference', 'Message']
    const rows = donations.map(d => [
      new Date(d.createdAt).toLocaleDateString(),
      d.isAnonymous ? 'Anonymous' : d.donorName,
      d.donorEmail || '',
      d.amount.toFixed(2),
      d.tier || '',
      d.paymentStatus,
      d.paymentRef || '',
      d.message || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Donations exported to CSV')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Donations</h1>
          <p className="text-muted-foreground">Manage and track all donations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Donation
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">
                  ₦{stats.totalRaised.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Donor Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">{stats.donorCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold">{stats.totalDonations}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History</CardTitle>
          <CardDescription>
            {stats?.totalDonations || 0} total donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
              ))}
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start receiving donations and they will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Donor</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tier</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation, index) => (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-2 text-sm">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium">
                              {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                            </p>
                            {donation.donorEmail && (
                              <p className="text-xs text-muted-foreground">{donation.donorEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold">
                          ₦{donation.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={getStatusColor(donation.paymentStatus)}>
                            {donation.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          {donation.tier ? (
                            <Badge variant="outline">{donation.tier}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {donation.message ? (
                            <p className="text-sm text-muted-foreground max-w-[200px] truncate" title={donation.message}>
                              {donation.message}
                            </p>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Donation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Manual Donation</DialogTitle>
            <DialogDescription>
              Record a donation that was made outside the system (e.g., bank transfer, cash).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="donorName">Donor Name *</Label>
                <Input
                  id="donorName"
                  value={formData.donorName}
                  onChange={(e) => setFormData(f => ({ ...f, donorName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donorEmail">Donor Email (optional)</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => setFormData(f => ({ ...f, donorEmail: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                  placeholder="1000"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tier">Tier (optional)</Label>
                <Input
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => setFormData(f => ({ ...f, tier: e.target.value }))}
                  placeholder="e.g., Supporter, Champion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Input
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(f => ({ ...f, message: e.target.value }))}
                  placeholder="Donor's message"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isAnonymous">Anonymous</Label>
                <Switch
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => setFormData(f => ({ ...f, isAnonymous: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(value: any) => setFormData(f => ({ ...f, paymentStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Add Donation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
