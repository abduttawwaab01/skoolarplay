'use client'

import { useState, useEffect } from 'react'
import { Trophy, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  condition: string | null
  xpReward: number
  gemReward: number
  _count: { users: number }
  createdAt: string
}

const ICON_OPTIONS = ['🎯', '🔥', '💎', '🏅', '⭐', '📚', '🏆', '🚀', '💡', '✨', '🎨', '🌟', '💪', '👑', '🎓']

export function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [form, setForm] = useState({ title: '', description: '', icon: '🏆', condition: '', xpReward: 0, gemReward: 0 })

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/admin/achievements')
      const data = await res.json()
      setAchievements(data.achievements || [])
    } catch {
      toast.error('Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', icon: '🏆', condition: '', xpReward: 0, gemReward: 0 })
    setDialogOpen(true)
  }

  const openEdit = (a: Achievement) => {
    setEditing(a)
    setForm({ title: a.title, description: a.description || '', icon: a.icon || '🏆', condition: a.condition || '', xpReward: a.xpReward, gemReward: a.gemReward })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    try {
      const url = editing ? `/api/admin/achievements/${editing.id}` : '/api/admin/achievements'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) toast.success(editing ? 'Achievement updated' : 'Achievement created')
      else toast.error('Operation failed')
      setDialogOpen(false)
      fetchAchievements()
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achievement? This will also remove all user progress for it.')) return
    try {
      const res = await fetch(`/api/admin/achievements/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Achievement deleted')
        fetchAchievements()
      } else toast.error('Failed to delete')
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = achievements.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase()) || (a.condition || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6" /> Achievements</h2>
          <p className="text-muted-foreground text-sm">Manage gamification achievements</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Achievement</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold">{achievements.length}</p><p className="text-sm text-muted-foreground">Total</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-yellow-600">{achievements.reduce((s, a) => s + a._count.users, 0)}</p><p className="text-sm text-muted-foreground">Total Earned</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-green-600">{achievements.reduce((s, a) => s + a.xpReward, 0)}</p><p className="text-sm text-muted-foreground">Total XP Available</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{achievements.reduce((s, a) => s + a.gemReward, 0)}</p><p className="text-sm text-muted-foreground">Total Gems Available</p></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search achievements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Icon</th>
                  <th className="text-left p-4 text-sm font-medium">Title</th>
                  <th className="text-left p-4 text-sm font-medium">Condition</th>
                  <th className="text-left p-4 text-sm font-medium">XP</th>
                  <th className="text-left p-4 text-sm font-medium">Gems</th>
                  <th className="text-left p-4 text-sm font-medium">Earned</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No achievements found</td></tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-2xl">{a.icon}</td>
                      <td className="p-4">
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{a.description}</p>
                      </td>
                      <td className="p-4 text-xs font-mono">{a.condition || '-'}</td>
                      <td className="p-4 text-sm text-green-600 font-medium">+{a.xpReward}</td>
                      <td className="p-4 text-sm text-blue-600 font-medium">+{a.gemReward}</td>
                      <td className="p-4 text-sm">{a._count.users}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} onClick={() => setForm({ ...form, icon })} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${form.icon === icon ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Achievement title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the achievement" rows={2} />
            </div>
            <div>
              <Label>Condition Key</Label>
              <Input value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} placeholder="e.g., COMPLETE_FIRST_LESSON" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>XP Reward</Label>
                <Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Gem Reward</Label>
                <Input type="number" value={form.gemReward} onChange={(e) => setForm({ ...form, gemReward: parseInt(e.target.value) || 0 })} />
              </div>
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
