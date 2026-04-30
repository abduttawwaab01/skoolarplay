'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gem,
  Search,
  Send,
  Gift,
  X,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSoundEffect } from '@/hooks/use-sound'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { toast } from 'sonner'

interface SearchUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

interface GiftItem {
  id: string
  amount: number
  message: string | null
  createdAt: string
  sender: { id: string; name: string; avatar: string | null }
  recipient: { id: string; name: string; avatar: string | null }
  direction: 'sent' | 'received'
}

const QUICK_AMOUNTS = [5, 10, 25, 50, 100]

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  return date.toLocaleDateString()
}

function UserAvatar({ name, avatar, size = 'md' }: { name: string; avatar: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

export function ShareGemsPage() {
  const { user, updateGems, fetchSession } = useAuthStore()
  const playClick = useSoundEffect('click')
  const playCorrect = useSoundEffect('correct')
  const playWrong = useSoundEffect('wrong')
  const playGemCollect = useSoundEffect('gemCollect')

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Gift form state
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // History state
  const [historyType, setHistoryType] = useState<'sent' | 'received'>('sent')
  const [gifts, setGifts] = useState<GiftItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  // Search users with debounce
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      if (!query.trim()) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
          const data = await res.json()
          setSearchResults(data.users || [])
          setShowResults(true)
        } catch {
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    },
    []
  )

  const selectUser = (u: SearchUser) => {
    playClick()
    setSelectedUser(u)
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  const clearSelectedUser = () => {
    playClick()
    setSelectedUser(null)
  }

  const selectQuickAmount = (val: number) => {
    playClick()
    setAmount(String(val))
  }

  const handleSendGift = async () => {
    if (!selectedUser || !amount) return

    setShowConfirm(true)
  }

  const confirmSend = async () => {
    if (!selectedUser || !amount) return

    const parsedAmount = parseInt(amount, 10)
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 500) {
      toast.error('Invalid amount. Must be between 1 and 500.')
      playWrong()
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/gems/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: selectedUser.email,
          amount: parsedAmount,
          message: message.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send gems')
        playWrong()
        return
      }

      // Update local gems state
      updateGems(-parsedAmount)
      playGemCollect()
      playCorrect()

      toast.success(`Successfully sent ${parsedAmount} gem${parsedAmount > 1 ? 's' : ''} to ${selectedUser.name}! 💎`, {
        duration: 4000,
      })

      // Reset form
      setSelectedUser(null)
      setAmount('')
      setMessage('')
      setShowConfirm(false)

      // Refresh history
      fetchGiftHistory(historyType)

      // Refresh session for updated gem count
      fetchSession()
    } catch {
      toast.error('Something went wrong. Please try again.')
      playWrong()
    } finally {
      setIsSending(false)
    }
  }

  const fetchGiftHistory = useCallback(
    async (type: 'sent' | 'received', cursor?: string) => {
      setIsLoadingHistory(true)
      try {
        const params = new URLSearchParams({ type })
        if (cursor) params.set('cursor', cursor)
        const res = await fetch(`/api/gems/history?${params}`)
        const data = await res.json()

        if (cursor) {
          setGifts((prev) => [...prev, ...data.gifts])
        } else {
          setGifts(data.gifts || [])
        }
        setHasMore(data.hasMore)
        setNextCursor(data.nextCursor)
      } catch {
        toast.error('Failed to load gift history')
      } finally {
        setIsLoadingHistory(false)
      }
    },
    []
  )

  // Load history on mount and tab change
  useEffect(() => {
    fetchGiftHistory(historyType)
  }, [historyType, fetchGiftHistory])

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 sm:p-8 mb-6 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-8 text-6xl">💎</div>
          <div className="absolute bottom-4 left-8 text-4xl">✨</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Gift className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Share Gems</h1>
          </div>
          <p className="text-white/80 text-sm sm:text-base mb-4">
            Spread the love! Gift gems to your friends and fellow learners.
          </p>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
          >
            <Gem className="w-5 h-5 text-yellow-300" />
            <span className="text-2xl font-bold">{user?.gems || 0}</span>
            <span className="text-white/80 text-sm">Gems Available</span>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Send Gems Section */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="w-5 h-5 text-amber-600" />
                  Send Gems
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Search User */}
                <div className="relative">
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Find a user
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-9 pr-4"
                      value={selectedUser ? selectedUser.name : searchQuery}
                      onChange={(e) => {
                        if (selectedUser) {
                          clearSelectedUser()
                        } else {
                          handleSearch(e.target.value)
                        }
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowResults(true)
                      }}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showResults && searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-50 top-full mt-1 w-full bg-card border rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      >
                        {searchResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => selectUser(u)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                          >
                            <UserAvatar name={u.name} avatar={u.avatar} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected User Card */}
                <AnimatePresence>
                  {selectedUser && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <UserAvatar name={selectedUser.name} avatar={selectedUser.avatar} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 truncate">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                            {selectedUser.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={clearSelectedUser}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Amount Selection */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Amount (1-500)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    placeholder="Enter number of gems..."
                    value={amount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      if (!isNaN(val) && val >= 1 && val <= 500) {
                        setAmount(e.target.value)
                      } else if (e.target.value === '') {
                        setAmount('')
                      }
                    }}
                    className="mb-3"
                  />

                  {/* Quick Amount Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {QUICK_AMOUNTS.map((val) => (
                      <motion.button
                        key={val}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => selectQuickAmount(val)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          amount === String(val)
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-muted hover:bg-amber-100 dark:hover:bg-amber-900/30 text-foreground'
                        }`}
                      >
                        <Gem className="w-3.5 h-3.5" />
                        {val}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message (optional)
                  </label>
                  <Textarea
                    placeholder="Add a kind message to your gift..."
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setMessage(e.target.value)
                      }
                    }}
                    className="resize-none min-h-[80px]"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {message.length}/200
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendGift}
                  disabled={!selectedUser || !amount || isSending}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-5 text-base"
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Gift
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Gifts Section */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  Recent Gifts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs
                  value={historyType}
                  onValueChange={(v) => setHistoryType(v as 'sent' | 'received')}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="sent" className="text-xs sm:text-sm">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-orange-500" />
                      Sent
                    </TabsTrigger>
                    <TabsTrigger value="received" className="text-xs sm:text-sm">
                      <ArrowDownLeft className="w-3.5 h-3.5 mr-1 text-green-500" />
                      Received
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={historyType} className="mt-0">
                    {/* Loading State */}
                    {isLoadingHistory && gifts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground">Loading gifts...</p>
                      </div>
                    )}

                    {/* Gift List */}
                    {!isLoadingHistory && gifts.length > 0 && (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {gifts.map((gift) => {
                          const isSent = gift.direction === 'sent'
                          const otherUser = isSent ? gift.recipient : gift.sender

                          return (
                            <motion.div
                              key={gift.id}
                              initial={{ opacity: 0, x: isSent ? -10 : 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <UserAvatar name={otherUser.name} avatar={otherUser.avatar} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{otherUser.name}</p>
                                {gift.message && (
                                  <p className="text-xs text-muted-foreground truncate">{gift.message}</p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {formatTimeAgo(gift.createdAt)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span
                                  className={`flex items-center gap-1 text-sm font-bold ${
                                    isSent ? 'text-orange-500' : 'text-green-500'
                                  }`}
                                >
                                  {isSent ? (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  ) : (
                                    <ArrowDownLeft className="w-3.5 h-3.5" />
                                  )}
                                  {gift.amount}
                                  <Gem className="w-3 h-3" />
                                </span>
                              </div>
                            </motion.div>
                          )
                        })}

                        {/* Load More */}
                        {hasMore && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground"
                            onClick={() => nextCursor && fetchGiftHistory(historyType, nextCursor)}
                            disabled={isLoadingHistory}
                          >
                            {isLoadingHistory ? 'Loading...' : 'Load more'}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Empty State */}
                    {!isLoadingHistory && gifts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                          {historyType === 'sent' ? (
                            <Send className="w-7 h-7 text-muted-foreground" />
                          ) : (
                            <Gift className="w-7 h-7 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {historyType === 'sent'
                            ? 'No gems sent yet'
                            : 'No gems received yet'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {historyType === 'sent'
                            ? 'Start sharing gems with your friends!'
                            : 'Share your gem link with friends to receive gifts!'}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">How It Works</span>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <span>Search for a user by their name or email address</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <span>Choose how many gems to send (1-500 gems per gift)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <span>Add an optional message and send your gift!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Gem className="w-5 h-5 text-amber-600" />
              </div>
              Confirm Gift
            </DialogTitle>
            <DialogDescription>
              Review your gift details before sending.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Recipient */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <UserAvatar name={selectedUser?.name || ''} avatar={selectedUser?.avatar || null} />
              <div>
                <p className="text-sm font-medium">{selectedUser?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.email}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="flex items-center gap-1 text-lg font-bold text-amber-600">
                {amount} <Gem className="w-4 h-4" />
              </span>
            </div>

            {/* Message */}
            {message && (
              <div className="p-3 bg-muted/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm italic">&ldquo;{message}&rdquo;</p>
              </div>
            )}

            {/* Remaining balance warning */}
            {user && parseInt(amount, 10) > user.gems && (
              <p className="text-xs text-destructive font-medium">
                ⚠️ You don&apos;t have enough gems for this gift.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                playClick()
                setShowConfirm(false)
              }}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSend}
              disabled={!!(isSending || !selectedUser || !amount || (user && parseInt(amount, 10) > user.gems))}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send {amount} Gems
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
