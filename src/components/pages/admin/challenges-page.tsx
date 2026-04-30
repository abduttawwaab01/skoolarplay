'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const TYPES = ['QUIZ', 'SPEED', 'ACCURACY']
const TYPE_COLORS: Record<string, string> = {
  QUIZ: 'bg-blue-100 text-blue-700',
  SPEED: 'bg-orange-100 text-orange-700',
  ACCURACY: 'bg-green-100 text-green-700',
}

interface Challenge {
  id: string
  title: string
  description: string | null
  type: string
  xpReward: number
  gemReward: number
  date: string
  isActive: boolean
  _count: { completions: number }
}

export function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [form, setForm] = useState({ title: '', description: '', type: 'QUIZ', xpReward: 0, gemReward: 0, date: '', isActive: true })

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/admin/daily-challenges')
      const data = await res.json()
      setChallenges(data.challenges || [])
    } catch {
      toast.error('Failed to fetch challenges')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', type: 'QUIZ', xpReward: 0, gemReward: 0, date: new Date().toISOString().split('T')[0], isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (c: Challenge) => {
    setEditing(c)
    setForm({ title: c.title, description: c.description || '', type: c.type, xpReward: c.xpReward, gemReward: c.gemReward, date: c.date, isActive: c.isActive })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.date) { toast.error('Title and date are required'); return }
    try {
      const url = editing ? `/api/admin/daily-challenges/${editing.id}` : '/api/admin/daily-challenges'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) toast.success(editing ? 'Challenge updated' : 'Challenge created')
      else toast.error('Operation failed')
      setDialogOpen(false)
      fetchChallenges()
    } catch { toast.error('Operation failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this challenge?')) return
    try {
      const res = await fetch(`/api/admin/daily-challenges/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchChallenges() }
      else toast.error('Failed to delete')
    } catch { toast.error('Delete failed') }
  }

  // Group challenges by month
  const byMonth = challenges.reduce<Record<string, Challenge[]>>((acc, c) => {
    const key = c.date.substring(0, 7)
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6" /> Daily Challenges</h2>
          <p className="text-muted-foreground text-sm">Schedule and manage daily challenges</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Challenge</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold">{challenges.length}</p><p className="text-sm text-muted-foreground">Total</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-green-600">{challenges.filter(c => c.isActive).length}</p><p className="text-sm text-muted-foreground">Active</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{challenges.reduce((s, c) => s + c._count.completions, 0)}</p><p className="text-sm text-muted-foreground">Completions</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold">{Object.keys(byMonth).length}</p><p className="text-sm text-muted-foreground">Months</p></Card>
      </div>

      {/* Calendar View */}
      {Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).map(([month, items]) => (
        <Card key={month}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {items.sort((a, b) => a.date.localeCompare(b.date)).map((c) => (
                <div key={c.id} className="p-2 rounded-lg border bg-card text-center hover:bg-muted/50 transition-colors cursor-pointer group relative" onClick={() => openEdit(c)}>
                  <p className="text-xs text-muted-foreground">{new Date(c.date + 'T12:00:00').getDate()}</p>
                  <p className="text-xs font-medium truncate">{c.title}</p>
                  <span className={`inline-flex px-1 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); handleDelete(c.id) }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* List View */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Title</th>
                  <th className="text-left p-4 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-sm font-medium">Date</th>
                  <th className="text-left p-4 text-sm font-medium">XP</th>
                  <th className="text-left p-4 text-sm font-medium">Gems</th>
                  <th className="text-left p-4 text-sm font-medium">Completions</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : challenges.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No challenges</td></tr>
                ) : (
                  challenges.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 text-sm font-medium">{c.title}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[c.type]}`}>{c.type}</span></td>
                      <td className="p-4 text-sm">{c.date}</td>
                      <td className="p-4 text-sm text-green-600">+{c.xpReward}</td>
                      <td className="p-4 text-sm text-blue-600">+{c.gemReward}</td>
                      <td className="p-4 text-sm">{c._count.completions}</td>
                      <td className="p-4"><Switch checked={c.isActive} onCheckedChange={async (v) => { await fetch(`/api/admin/daily-challenges/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: v }) }); fetchChallenges() }} /></td>
                      <td className="p-4"><div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Challenge' : 'Add Challenge'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Challenge title" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>XP Reward</Label><Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Gem Reward</Label><Input type="number" value={form.gemReward} onChange={(e) => setForm({ ...form, gemReward: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} /><Label>Active</Label></div>
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
