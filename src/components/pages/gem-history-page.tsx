'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Gem, TrendingUp, TrendingDown, Gift, Star, Zap, Loader2, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'

interface GemTransaction {
  id: string
  amount: number
  type: string
  source: string
  description: string
  relatedId?: string
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

const typeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  EARN: { bg: 'bg-green-100', text: 'text-green-700', icon: <TrendingUp className="w-4 h-4" /> },
  SPEND: { bg: 'bg-red-100', text: 'text-red-700', icon: <TrendingDown className="w-4 h-4" /> },
  BONUS: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Star className="w-4 h-4" /> },
  REFERRAL: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Gift className="w-4 h-4" /> },
  EVENT: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Star className="w-4 h-4" /> },
  ACHIEVEMENT: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Zap className="w-4 h-4" /> },
  GIFT_SENT: { bg: 'bg-rose-100', text: 'text-rose-700', icon: <Gift className="w-4 h-4" /> },
  GIFT_RECEIVED: { bg: 'bg-pink-100', text: 'text-pink-700', icon: <Gift className="w-4 h-4" /> },
}

const sourceLabels: Record<string, string> = {
  quiz: 'Quiz Completion',
  vocabulary: 'Vocabulary Practice',
  spin: 'Spin Wheel',
  shop: 'Shop Purchase',
  subscription: 'Subscription',
  gift: 'Gift',
  achievement: 'Achievement',
  login: 'Daily Login',
  referral: 'Referral Bonus',
  daily_task: 'Daily Task',
  weekly_challenge: 'Weekly Challenge',
  event: 'Special Event',
  bonus: 'Bonus Reward',
}

export function GemHistoryPage() {
  const { goBack } = useAppStore()
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<GemTransaction[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchTransactions()
  }, [filter])

  const fetchTransactions = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (filter !== 'all') {
        params.set('type', filter)
      }
      const res = await fetch(`/api/user/gem-transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.transactions)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gem History</h1>
            <p className="text-muted-foreground">Track your gem earnings and spending</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">+{totalEarned}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-red-600">-{totalSpent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <select
                className="text-sm border rounded-md px-2 py-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="EARN">Earned</option>
                <option value="SPEND">Spent</option>
                <option value="BONUS">Bonus</option>
                <option value="GIFT_RECEIVED">Received</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gem className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
                <p className="text-sm">Start earning gems by completing quizzes!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const typeStyle = typeColors[tx.type] || typeColors.EARN
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeStyle.bg}`}>
                          <span className={typeStyle.text}>{typeStyle.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {sourceLabels[tx.source] || tx.source}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={pagination.page === i + 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => fetchTransactions(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
