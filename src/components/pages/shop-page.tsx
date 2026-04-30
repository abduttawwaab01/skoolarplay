'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Zap,
  Gem,
  Heart,
  Star,
  ShoppingCart,
  X,
  ArrowLeft,
  UserCircle,
  Palette,
  Lock,
  Check,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'

interface ShopItem {
  id: string
  title: string
  description: string | null
  type: string
  icon: string | null
  price: number
  quantity: number | null
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; emoji: string }> = {
  POWER_UP: { label: 'Power-ups', icon: Zap, emoji: '⚡' },
  BOOST: { label: 'Boosts', icon: Rocket, emoji: '🚀' },
  AVATAR: { label: 'Avatars', icon: UserCircle, emoji: '👤' },
  THEME: { label: 'Themes', icon: Palette, emoji: '🎨' },
}

function Rocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
}

const itemIcons: Record<string, string> = {
  'Streak Freeze': '🧊',
  'Heart Refill': '❤️‍🩹',
  'Extra Life': '💚',
  'Double XP': '✨',
  'Triple Gems': '💎',
  'Nigerian Warrior Avatar': '🛡️',
  'Ankara Style Avatar': '👗',
  'Dark Mode Theme': '🌙',
  'Green Theme': '🟢',
  'Gold Theme': '🏆',
}

function getIconForItem(item: ShopItem): string {
  if (item.icon) return item.icon
  return itemIcons[item.title] || '🎁'
}

function getTypeIcon(type: string): React.ElementType {
  return categoryConfig[type]?.icon || Sparkles
}

function ShopSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function ShopPage() {
  const { user, updateGems } = useAuthStore()
  const { goBack } = useAppStore()
  const playHover = useSoundEffect('hover')
  const playPurchase = useSoundEffect('purchase')
  const playWrong = useSoundEffect('wrong')
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [purchaseAnim, setPurchaseAnim] = useState<string | null>(null)

  const fetchItems = useCallback(async (type?: string) => {
    try {
      setLoading(true)
      const url = type && type !== 'ALL' ? `/api/shop/items?type=${type}` : '/api/shop/items'
      const res = await fetch(url)
      const data = await res.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch shop items:', error)
      toast.error('Failed to load shop items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleBuyClick = (item: ShopItem) => {
    playHover()
    if ((user?.gems || 0) < item.price) {
      playWrong()
      toast.error('Not enough gems! 💎', {
        description: `You need ${item.price - (user?.gems || 0)} more gems`,
      })
      return
    }
    setSelectedItem(item)
    setDialogOpen(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return

    setPurchasing(selectedItem.id)
    setDialogOpen(false)

    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem.id, quantity: 1 }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Purchase failed')
        setPurchasing(null)
        return
      }

      // Animate the purchase
      setPurchaseAnim(selectedItem.id)
      updateGems(-data.purchase.totalGems)
      playPurchase()

      toast.success(`${selectedItem.title} purchased! 🎉`, {
        description: `${data.purchase.totalGems} gems spent`,
      })

      setTimeout(() => setPurchaseAnim(null), 1500)

      // Refresh items to update stock
      fetchItems()
    } catch (error) {
      toast.error('Purchase failed. Please try again.')
    } finally {
      setPurchasing(null)
      setSelectedItem(null)
    }
  }

  if (loading) return <ShopSkeleton />

  const gemBalance = user?.gems || 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-6 md:p-8 text-white overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-yellow-400/10 translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <span className="text-4xl">💎</span>
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gem Shop</h1>
              <p className="text-white/80 text-sm">Power up your learning journey!</p>
            </div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 text-center"
          >
            <p className="text-white/70 text-xs font-medium mb-1">Your Balance</p>
            <div className="flex items-center justify-center gap-2">
              <Gem className="w-6 h-6 text-cyan-200" />
              <motion.span
                key={gemBalance}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-3xl font-bold"
              >
                {gemBalance.toLocaleString()}
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <Tabs defaultValue="ALL" onValueChange={(v) => fetchItems(v === 'ALL' ? undefined : v)}>
        <TabsList className="bg-muted/80 w-full max-w-lg h-auto p-1 rounded-xl">
          <TabsTrigger value="ALL" className="rounded-lg text-xs sm:text-sm" onPointerEnter={playHover}>All</TabsTrigger>
          <TabsTrigger value="POWER_UP" className="rounded-lg text-xs sm:text-sm" onPointerEnter={playHover}>⚡ Power-ups</TabsTrigger>
          <TabsTrigger value="BOOST" className="rounded-lg text-xs sm:text-sm" onPointerEnter={playHover}>🚀 Boosts</TabsTrigger>
          <TabsTrigger value="AVATAR" className="rounded-lg text-xs sm:text-sm" onPointerEnter={playHover}>👤 Avatars</TabsTrigger>
          <TabsTrigger value="THEME" className="rounded-lg text-xs sm:text-sm" onPointerEnter={playHover}>🎨 Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="ALL">
          <ItemsGrid
            items={items}
            gemBalance={gemBalance}
            purchasing={purchasing}
            purchaseAnim={purchaseAnim}
            onBuy={handleBuyClick}
          />
        </TabsContent>
        <TabsContent value="POWER_UP">
          <ItemsGrid
            items={items}
            gemBalance={gemBalance}
            purchasing={purchasing}
            purchaseAnim={purchaseAnim}
            onBuy={handleBuyClick}
          />
        </TabsContent>
        <TabsContent value="BOOST">
          <ItemsGrid
            items={items}
            gemBalance={gemBalance}
            purchasing={purchasing}
            purchaseAnim={purchaseAnim}
            onBuy={handleBuyClick}
          />
        </TabsContent>
        <TabsContent value="AVATAR">
          <ItemsGrid
            items={items}
            gemBalance={gemBalance}
            purchasing={purchasing}
            purchaseAnim={purchaseAnim}
            onBuy={handleBuyClick}
          />
        </TabsContent>
        <TabsContent value="THEME">
          <ItemsGrid
            items={items}
            gemBalance={gemBalance}
            purchasing={purchasing}
            purchaseAnim={purchaseAnim}
            onBuy={handleBuyClick}
          />
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedItem ? getIconForItem(selectedItem) : ''}</span>
              Confirm Purchase
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to buy <strong>{selectedItem?.title}</strong> for{' '}
              <strong className="text-blue-500">💎 {selectedItem?.price}</strong> gems?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase} className="bg-blue-600 hover:bg-blue-700">
              Buy Now 💎
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ItemsGrid({
  items,
  gemBalance,
  purchasing,
  purchaseAnim,
  onBuy,
}: {
  items: ShopItem[]
  gemBalance: number
  purchasing: string | null
  purchaseAnim: string | null
  onBuy: (item: ShopItem) => void
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">No items in this category</p>
        <p className="text-sm text-muted-foreground/70">Check back soon for new items!</p>
      </div>
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          const isPurchasing = purchasing === item.id
          const isAnimating = purchaseAnim === item.id
          const canAfford = gemBalance >= item.price
          const isOutOfStock = item.quantity !== null && item.quantity <= 0

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`relative overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-lg transition-all duration-300 ${
                  isAnimating ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''
                } ${!canAfford || isOutOfStock ? 'opacity-70' : 'hover:-translate-y-1'}`}
              >
                {/* Type badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    variant="secondary"
                    className="text-[10px] rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-sm"
                  >
                    {categoryConfig[item.type]?.emoji || '🎁'} {categoryConfig[item.type]?.label || item.type}
                  </Badge>
                </div>

                {/* Purchase animation overlay */}
                <AnimatePresence>
                  {isAnimating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 z-30 bg-yellow-400/30 rounded-2xl flex items-center justify-center"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="text-4xl"
                      >
                        ✅
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardContent className="p-5">
                  {/* Item icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <span className="text-3xl">{getIconForItem(item)}</span>
                  </motion.div>

                  {/* Title & description */}
                  <h3 className="font-bold text-sm mb-1 text-center">{item.title}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-4 line-clamp-2">
                    {item.description || 'A special item for your collection'}
                  </p>

                  {/* Stock indicator */}
                  {item.quantity !== null && (
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {item.quantity <= 0 ? (
                        <span className="text-xs text-red-500 font-medium">Sold out!</span>
                      ) : item.quantity <= 5 ? (
                        <span className="text-xs text-orange-500 font-medium">
                          Only {item.quantity} left!
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          In stock ({item.quantity})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price & Buy button */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Gem className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-blue-600">{item.price}</span>
                    </div>

                    <Button
                      onClick={() => onBuy(item)}
                      disabled={!canAfford || isOutOfStock || !!isPurchasing}
                      className={`w-full rounded-xl h-10 text-sm font-semibold transition-all ${
                        canAfford && !isOutOfStock
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-sm hover:shadow-md'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPurchasing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Gem className="w-4 h-4" />
                        </motion.div>
                      ) : isOutOfStock ? (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" />
                          Sold Out
                        </>
                      ) : !canAfford ? (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" />
                          Need {item.price - gemBalance} more
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
