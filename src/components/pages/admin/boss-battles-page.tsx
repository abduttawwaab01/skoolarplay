'use client'

import { useState, useEffect } from 'react'
import { Swords, Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'LEGENDARY']
const DIFF_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700',
  NORMAL: 'bg-blue-100 text-blue-700',
  HARD: 'bg-orange-100 text-orange-700',
  LEGENDARY: 'bg-red-100 text-red-700',
}
const DIFF_ICONS: Record<string, string> = {
  EASY: '🟢',
  NORMAL: '🔵',
  HARD: '🟠',
  LEGENDARY: '🔴',
}

interface BossBattle {
  id: string
  courseId: string
  moduleId: string | null
  title: string
  description: string
  difficulty: string
  hp: number
  xpReward: number
  gemReward: number
  timeLimit: number
  isActive: boolean
  course: { id: string; title: string }
  _count: { completions: number }
}

interface Course {
  id: string
  title: string
  modules: { id: string; title: string }[]
}

export function AdminBossBattlesPage() {
  const [battles, setBattles] = useState<BossBattle[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<BossBattle | null>(null)
  const [form, setForm] = useState({ courseId: '', moduleId: '', title: '', description: '', difficulty: 'NORMAL', hp: 100, xpReward: 0, gemReward: 0, timeLimit: 120, isActive: true })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([fetch('/api/admin/boss-battles'), fetch('/api/admin/courses')])
      const [bData, cData] = await Promise.all([bRes.json(), cRes.json()])
      setBattles(bData.bossBattles || [])
      setCourses(cData.courses || [])
    } catch { toast.error('Failed to fetch data') }
    finally { setLoading(false) }
  }

  const selectedCourseModules = courses.find(c => c.id === form.courseId)?.modules || []

  const openCreate = () => {
    setEditing(null)
    setForm({ courseId: '', moduleId: '', title: '', description: '', difficulty: 'NORMAL', hp: 100, xpReward: 0, gemReward: 0, timeLimit: 120, isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (b: BossBattle) => {
    setEditing(b)
    setForm({ courseId: b.courseId, moduleId: b.moduleId || '', title: b.title, description: b.description, difficulty: b.difficulty, hp: b.hp, xpReward: b.xpReward, gemReward: b.gemReward, timeLimit: b.timeLimit, isActive: b.isActive })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.courseId || !form.title || !form.description) { toast.error('Course, title, and description required'); return }
    try {
      const url = editing ? `/api/admin/boss-battles/${editing.id}` : '/api/admin/boss-battles'
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) toast.success(editing ? 'Updated' : 'Created')
      else toast.error('Failed')
      setDialogOpen(false)
      fetchData()
    } catch { toast.error('Operation failed') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this boss battle?')) return
    try {
      const res = await fetch(`/api/admin/boss-battles/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchData() } else toast.error('Failed')
    } catch { toast.error('Failed') }
  }

  const filtered = battles.filter(b => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6" /> Boss Battles</h2>
          <p className="text-muted-foreground text-sm">Manage boss battle encounters</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Boss Battle</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-2xl font-bold">{battles.length}</p><p className="text-sm text-muted-foreground">Total</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-green-600">{battles.filter(b => b.isActive).length}</p><p className="text-sm text-muted-foreground">Active</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-blue-600">{battles.reduce((s, b) => s + b._count.completions, 0)}</p><p className="text-sm text-muted-foreground">Completions</p></Card>
        <Card className="p-4"><p className="text-2xl font-bold text-red-600">{battles.filter(b => b.difficulty === 'LEGENDARY').length}</p><p className="text-sm text-muted-foreground">Legendary</p></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search boss battles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium">Title</th>
                  <th className="text-left p-4 text-sm font-medium">Difficulty</th>
                  <th className="text-left p-4 text-sm font-medium">HP</th>
                  <th className="text-left p-4 text-sm font-medium">Rewards</th>
                  <th className="text-left p-4 text-sm font-medium">Course</th>
                  <th className="text-left p-4 text-sm font-medium">Completions</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No boss battles</td></tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4"><p className="font-medium text-sm">{b.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{b.description}</p></td>
                      <td className="p-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${DIFF_COLORS[b.difficulty]}`}>{DIFF_ICONS[b.difficulty]} {b.difficulty}</span></td>
                      <td className="p-4 text-sm font-medium">{b.hp}</td>
                      <td className="p-4"><p className="text-xs text-green-600">+{b.xpReward} XP</p><p className="text-xs text-blue-600">+{b.gemReward} 💎</p></td>
                      <td className="p-4 text-xs">{b.course.title}</td>
                      <td className="p-4 text-sm">{b._count.completions}</td>
                      <td className="p-4"><Switch checked={b.isActive} onCheckedChange={async (v) => { await fetch(`/api/admin/boss-battles/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: v }) }); fetchData() }} /></td>
                      <td className="p-4"><div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Boss Battle' : 'Add Boss Battle'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Course</Label><Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v, moduleId: '' })}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Module (Optional)</Label><Select value={form.moduleId} onValueChange={(v) => setForm({ ...form, moduleId: v })}><SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger><SelectContent>{selectedCourseModules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Boss name" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Difficulty</Label><Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{DIFF_ICONS[d]} {d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>HP</Label><Input type="number" value={form.hp} onChange={(e) => setForm({ ...form, hp: parseInt(e.target.value) || 100 })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>XP Reward</Label><Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Gem Reward</Label><Input type="number" value={form.gemReward} onChange={(e) => setForm({ ...form, gemReward: parseInt(e.target.value) || 0 })} /></div>
              <div><Label>Time (sec)</Label><Input type="number" value={form.timeLimit} onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) || 120 })} /></div>
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
