'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'

export function AdminExamsPage() {
  const { user } = useAuthStore()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [editing, setEditing] = useState<any>(null)
  const [viewing, setViewing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '', description: '', type: 'WAEC', subject: '', duration: 60, totalMarks: 100, passingMark: 50, isActive: true,
  })

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'ALL') params.set('type', typeFilter)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/exams?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExams(data.exams || data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ title: '', description: '', type: 'WAEC', subject: '', duration: 60, totalMarks: 100, passingMark: 50, isActive: true })
        fetchExams()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' })
      if (res.ok) fetchExams()
    } catch (e) {
      console.error(e)
    }
  }

  const examTypes = ['ALL', 'WAEC', 'NECO', 'JAMB', 'MOCK', 'CUSTOM']
  const subjectColors: Record<string, string> = {
    Mathematics: '#10B981', English: '#3B82F6', Physics: '#8B5CF6', Chemistry: '#EC4899',
    Biology: '#F59E0B', 'General Studies': '#6366F1', Economics: '#059669', 'Computer Studies': '#EC4899',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Exam Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{exams.length} exams configured</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Exam</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create New Exam</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., WAEC Mathematics 2025" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WAEC">WAEC</SelectItem>
                      <SelectItem value="NECO">NECO</SelectItem>
                      <SelectItem value="JAMB">JAMB</SelectItem>
                      <SelectItem value="MOCK">Mock Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Mathematics" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Total Marks</Label>
                  <Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Pass Mark (%)</Label>
                  <Input type="number" value={form.passingMark} onChange={(e) => setForm({ ...form, passingMark: Number(e.target.value) })} />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!form.title}>Create Exam</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {examTypes.map((t) => <SelectItem key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Exam Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>
          ))
        ) : exams.length === 0 ? (
          <Card className="col-span-full"><CardContent className="py-10 text-center text-muted-foreground">No exams found</CardContent></Card>
        ) : (
          exams.map((exam: any) => (
            <motion.div key={exam.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={exam.isActive ? 'default' : 'secondary'}>{exam.type}</Badge>
                        <Badge style={{ backgroundColor: subjectColors[exam.subject] || '#6366F1', color: '#fff' }}>{exam.subject}</Badge>
                      </div>
                      <CardTitle className="text-base">{exam.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewing(exam)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(exam); setForm({ title: exam.title, description: exam.description || '', type: exam.type, subject: exam.subject, duration: exam.duration, totalMarks: exam.totalMarks, passingMark: exam.passingMark, isActive: exam.isActive }) }}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exam.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>⏱ {exam.duration} min</span>
                    <span>{exam.totalMarks} marks | Pass: {exam.passingMark}%</span>
                  </div>
                  {exam._count && <p className="text-xs text-muted-foreground mt-2">{exam._count.questions} questions | {exam._count.attempts} attempts</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* View Exam Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.title}</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2"><Badge>{viewing.type}</Badge><Badge style={{ backgroundColor: subjectColors[viewing.subject] || '#6366F1', color: '#fff' }}>{viewing.subject}</Badge></div>
                <p className="text-muted-foreground">{viewing.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted"><div className="font-medium">{viewing.duration}</div><div className="text-xs text-muted-foreground">Minutes</div></div>
                  <div className="p-2 rounded-lg bg-muted"><div className="font-medium">{viewing.totalMarks}</div><div className="text-xs text-muted-foreground">Total Marks</div></div>
                  <div className="p-2 rounded-lg bg-muted"><div className="font-medium">{viewing.passingMark}%</div><div className="text-xs text-muted-foreground">Pass Mark</div></div>
                </div>
                {viewing.sections && <div className="mt-4 space-y-2"><h4 className="font-medium">Sections</h4>{viewing.sections.map((s: any) => (<div key={s.id} className="flex justify-between items-center p-2 rounded bg-muted"><span>{s.title}</span><span>{s.marks} marks</span></div>))}</div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Exam</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Pass Mark (%)</Label><Input type="number" value={form.passingMark} onChange={(e) => setForm({ ...form, passingMark: Number(e.target.value) })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={async () => { try { const res = await fetch(`/api/admin/exams/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (res.ok) { setEditing(null); fetchExams() } } catch(e) { console.error(e) } }} className="flex-1">Save</Button><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
