'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Filter, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const CATEGORIES = ['GENERAL', 'LEARNING', 'EXAM', 'MOTIVATION', 'FUNNY']
const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-gray-100 text-gray-700',
  LEARNING: 'bg-blue-100 text-blue-700',
  EXAM: 'bg-amber-100 text-amber-700',
  MOTIVATION: 'bg-green-100 text-green-700',
  FUNNY: 'bg-purple-100 text-purple-700',
}

interface Quote {
  id: string
  text: string
  author: string
  category: string
  isActive: boolean
  createdAt: string
  creator: { id: string; name: string; email: string }
}

export function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Quote | null>(null)
  const [form, setForm] = useState({ text: '', author: '', category: 'GENERAL', isActive: true })

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    try {
      const params = categoryFilter ? `?category=${categoryFilter}` : ''
      const res = await fetch(`/api/admin/quotes${params}`)
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch {
      toast.error('Failed to fetch quotes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [categoryFilter])

  const openCreate = () => {
    setEditing(null)
    setForm({ text: '', author: '', category: 'GENERAL', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (quote: Quote) => {
    setEditing(quote)
    setForm({ text: quote.text, author: quote.author, category: quote.category, isActive: quote.isActive })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.text || !form.author) {
      toast.error('Text and author are required')
      return
    }

    try {
      if (editing) {
        const res = await fetch(`/api/admin/quotes/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) toast.success('Quote updated')
        else toast.error('Failed to update quote')
      } else {
        const res = await fetch('/api/admin/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (res.ok) toast.success('Quote created')
        else toast.error('Failed to create quote')
      }
      setDialogOpen(false)
      fetchQuotes()
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quote?')) return
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Quote deleted')
        fetchQuotes()
      } else toast.error('Failed to delete quote')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleToggleActive = async (quote: Quote) => {
    try {
      await fetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !quote.isActive }),
      })
      toast.success(`Quote ${!quote.isActive ? 'activated' : 'deactivated'}`)
      fetchQuotes()
    } catch {
      toast.error('Toggle failed')
    }
  }

  const filteredQuotes = quotes.filter(
    (q) =>
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Quote className="w-6 h-6" /> Motivational Quotes
          </h2>
          <p className="text-muted-foreground text-sm">Manage quotes shown in the preloader</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Add Quote
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-2xl font-bold">{quotes.length}</p>
          <p className="text-sm text-muted-foreground">Total Quotes</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-green-600">{quotes.filter(q => q.isActive).length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold text-red-600">{quotes.filter(q => !q.isActive).length}</p>
          <p className="text-sm text-muted-foreground">Inactive</p>
        </Card>
        <Card className="p-4">
          <p className="text-2xl font-bold">{CATEGORIES.length}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Quote</th>
                  <th className="text-left p-4 text-sm font-medium">Author</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No quotes found</td></tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="text-sm line-clamp-2 max-w-xs italic">&ldquo;{quote.text}&rdquo;</p>
                      </td>
                      <td className="p-4 text-sm">{quote.author}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[quote.category] || CATEGORY_COLORS.GENERAL}`}>
                          {quote.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <Switch
                          checked={quote.isActive}
                          onCheckedChange={() => handleToggleActive(quote)}
                        />
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(quote)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Quote' : 'Add Quote'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quote Text</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Enter the motivational quote..."
                rows={3}
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Quote author"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
