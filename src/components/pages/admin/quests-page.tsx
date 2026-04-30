'use client'

import { useState, useEffect } from 'react'
import { ScrollText, Plus, Pencil, Trash2, Search } from 'lucide-react'
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

const TYPES = ['DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL']
const TYPE_COLORS: Record<string, string> = {
  DAILY: 'bg-blue-100 text-blue-700',
  WEEKLY: 'bg-purple-100 text-purple-700',
  MONTHLY: 'bg-amber-100 text-amber-700',
  SPECIAL: 'bg-green-100 text-green-700',
}

interface Quest {
  id: string
  title: string
  description: string
  type: string
  requirement: string
  targetCount: number
  xpReward: number
  gemReward: number
  isActive: boolean
  startDate: string
  endDate: string
  _count: { completions: number }
}

export function AdminQuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Quest | null>(null)
  const [form, setForm] = useState({ title: '', description: '', type: 'DAILY', requirement: '', targetCount: 1, xpReward: 0, gemReward: 0, startDate: '', endDate: '', isActive: true })

  useEffect(() => { fetchQuests() }, [])

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/admin/quests')
      const data = await res.json()
      setQuests(data.quests || [])
    } catch { toast.error('Failed to fetch quests') }
    finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditing(null)
    const today = new Date().toISOString().split('T')[0]
    setForm({ title: '', description: '', type: 'DAILY', requirement: '', targetCount: 1, xpReward: 0, gemReward: 0, startDate: today, endDate: today, isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (q: Quest) => {
    setEditing(q)
    setForm({ title: q.title, description: q.description, type: q.type, requirement: q.requirement, targetCount: q.targetCount, xpReward: q.xpReward, gemReward: q.gemReward, startDate: q.startDate, endDate: q.endDate, isActive: q.isActive })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) { toast.error('Title, start and end dates are required'); return }
    try {
      const url = editing ? `/api/admin/quests/${editing.id}` : '/api/admin/quests'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) toast.success(editing ? 'Quest updated' : 'Quest created')
      else toast.error('Operation failed')
      setDialogOpen(false)
      fetchQuests()
    } catch { toast.error('Operation failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quest?')) return
    try {
      const res = await fetch(`/api/admin/quests/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchQuests() } else toast.error('Failed')
    } catch { toast.error('Delete failed') }
  }

  const filtered = quests.filter(q => q.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6" /> Quests</h2>
          <p className="text-muted-foreground text-sm">Manage student quests and missions</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Quest</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold">{quests.length}</p><p className="text-sm text-muted-foreground">Total</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-green-600">{quests.filter(q => q.isActive).length}</p><p className="text-sm text-muted-foreground">Active</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{quests.reduce((s, q) => s + q._count.completions, 0)}</p><p className="text-sm text-muted-foreground">Completions</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-amber-600">{quests.reduce((s, q) => s + q.xpReward, 0)}</p><p className="text-sm text-muted-foreground">Total XP</p></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search quests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Title</th>
                  <th className="text-left p-4 text-sm font-medium">Type</th>
                  <th className="text-left p-4 text-sm font-medium">Requirement</th>
                  <th className="text-left p-4 text-sm font-medium">Rewards</th>
                  <th className="text-left p-4 text-sm font-medium">Date Range</th>
                  <th className="text-left p-4 text-sm font-medium">Completions</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No quests found</td></tr>
                ) : (
                  filtered.map((q) => (
                    <tr key={q.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4"><p className="font-medium text-sm">{q.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{q.description}</p></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[q.type]}`}>{q.type}</span></td>
                      <td className="p-4 text-xs">{q.requirement || '-'}</td>
                      <td className="p-4"><p className="text-xs text-green-600">+{q.xpReward} XP</p><p className="text-xs text-blue-600">+{q.gemReward} 💎</p></td>
                      <td className="p-4 text-xs">{q.startDate} → {q.endDate}</td>
                      <td className="p-4 text-sm">{q._count.completions}</td>
                      <td className="p-4"><Switch checked={q.isActive} onCheckedChange={async (v) => { await fetch(`/api/admin/quests/${q.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: v }) }); fetchQuests() }} /></td>
                      <td className="p-4"><div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(q)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Quest' : 'Add Quest'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Target Count</Label><Input type="number" value={form.targetCount} onChange={(e) => setForm({ ...form, targetCount: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <div><Label>Requirement</Label><Input value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} placeholder="e.g., Complete 5 lessons" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>XP Reward</Label><Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Gem Reward</Label><Input type="number" value={form.gemReward} onChange={(e) => setForm({ ...form, gemReward: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
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
