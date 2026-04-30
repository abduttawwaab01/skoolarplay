'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Gem } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface ShopItemData {
  id: string
  title: string
  description: string | null
  type: string
  icon: string | null
  price: number
  quantity: number | null
  isActive: boolean
  createdAt: string
  totalRevenue: number
  totalPurchases: number
}

interface PurchaseRecord {
  id: string
  quantity: number
  totalGems: number
  createdAt: string
  user: { id: string; name: string; email: string }
}

export function AdminShopPage() {
  const [items, setItems] = useState<ShopItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteItem, setDeleteItem] = useState<ShopItemData | null>(null)

  // Add/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ShopItemData | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formType, setFormType] = useState('POWER_UP')
  const [formIcon, setFormIcon] = useState('🎁')
  const [formPrice, setFormPrice] = useState('')
  const [formQuantity, setFormQuantity] = useState('')

  // Purchase History Dialog
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState<ShopItemData | null>(null)
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shop')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
      }
    } catch {
      toast.error('Failed to fetch shop items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  const openNewItem = () => {
    setEditingItem(null)
    setFormTitle('')
    setFormDescription('')
    setFormType('POWER_UP')
    setFormIcon('🎁')
    setFormPrice('')
    setFormQuantity('')
    setDialogOpen(true)
  }

  const openEditItem = (item: ShopItemData) => {
    setEditingItem(item)
    setFormTitle(item.title)
    setFormDescription(item.description || '')
    setFormType(item.type)
    setFormIcon(item.icon || '🎁')
    setFormPrice(item.price.toString())
    setFormQuantity(item.quantity?.toString() || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle || !formPrice) {
      toast.error('Title and price are required')
      return
    }

    try {
      const payload = {
        title: formTitle,
        description: formDescription || null,
        type: formType,
        icon: formIcon,
        price: parseInt(formPrice) || 0,
        quantity: formQuantity ? parseInt(formQuantity) : null,
      }

      const url = editingItem ? `/api/admin/shop/${editingItem.id}` : '/api/admin/shop'
      const method = editingItem ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingItem ? 'Item updated' : 'Item created')
        setDialogOpen(false)
        fetchItems()
      } else {
        toast.error('Failed to save item')
      }
    } catch {
      toast.error('Failed to save item')
    }
  }

  const handleToggle = async (item: ShopItemData) => {
    try {
      const res = await fetch(`/api/admin/shop/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (res.ok) {
        toast.success(item.isActive ? 'Item deactivated' : 'Item activated')
        fetchItems()
      }
    } catch {
      toast.error('Failed to toggle item')
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      const res = await fetch(`/api/admin/shop/${deleteItem.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Item deleted')
        setDeleteItem(null)
        fetchItems()
      }
    } catch {
      toast.error('Failed to delete item')
    }
  }

  const openHistory = async (item: ShopItemData) => {
    setHistoryItem(item)
    setHistoryOpen(true)
    try {
      const res = await fetch(`/api/admin/shop/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.item.purchases || [])
      }
    } catch {
      toast.error('Failed to fetch purchase history')
    }
  }

  const typeColors: Record<string, string> = {
    POWER_UP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    BOOST: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    AVATAR: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    THEME: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    STREAK_FREEZE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  }

  const totalRevenue = items.reduce((sum, item) => sum + item.totalRevenue, 0)
  const totalPurchases = items.reduce((sum, item) => sum + item.totalPurchases, 0)

  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
              <Gem className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} 💎</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-2xl font-bold">{totalPurchases}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Items</p>
              <p className="text-2xl font-bold">{items.filter(i => i.isActive).length} / {items.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} shop items</p>
        <Button onClick={openNewItem} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="hidden md:table-cell">Purchases</TableHead>
                  <TableHead className="hidden lg:table-cell">Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={8}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No shop items</TableCell>
                  </TableRow>
                ) : (
                  items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon || '🎁'}</span>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeColors[item.type] || ''}>{item.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.price} 💎</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {item.quantity === null ? '∞' : item.quantity}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{item.totalPurchases}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{item.totalRevenue} 💎</TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? 'outline' : 'secondary'} className={!item.isActive ? '' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openHistory(item)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItem(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteItem(item)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'New Shop Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Item title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Item description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POWER_UP">Power Up</SelectItem>
                    <SelectItem value="BOOST">Boost</SelectItem>
                    <SelectItem value="AVATAR">Avatar</SelectItem>
                    <SelectItem value="THEME">Theme</SelectItem>
                    <SelectItem value="STREAK_FREEZE">Streak Freeze</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (gems)</Label>
                <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label>Quantity (empty = unlimited)</Label>
                <Input type="number" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)} placeholder="Unlimited" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
            <DialogDescription>{historyItem?.icon} {historyItem?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-4 text-center">
              <div className="flex-1 p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{historyItem?.totalPurchases || 0}</p>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
              </div>
              <div className="flex-1 p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold">{historyItem?.totalRevenue || 0} 💎</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
            <Separator />
            {purchases.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No purchases yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {purchases.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{p.user.name}</p>
                      <p className="text-xs text-muted-foreground">{p.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{p.totalGems} 💎 ×{p.quantity}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Shop Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteItem?.title}&quot;? Purchase history will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Import Package icon
import { ShoppingBag, Package } from 'lucide-react'
