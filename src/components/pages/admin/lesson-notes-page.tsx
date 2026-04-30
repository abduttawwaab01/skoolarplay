'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, BookOpen, FileText, Video, ChevronDown, ChevronUp, Play, Pause, Volume2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface LessonNote {
  id: string
  title: string
  content: string
  audioUrl: string | null
  order: number
  isActive: boolean
  lessonId: string | null
  hasQuiz: boolean
  quizTitle: string | null
  quizQuestions: string | null
  quizPassingScore: number
  quizTimeLimit: number | null
  quizRequireFullscreen: boolean
  quizPreventTabSwitch: boolean
  quizPreventCopyPaste: boolean
  quizShuffleQuestions: boolean
  quizShuffleOptions: boolean
  quizXpReward: number
  quizGemReward: number
  lesson: {
    id: string
    title: string
    type: string
    module: { id: string; title: string; course: { id: string; title: string } }
  } | null
}

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  type: string
}

export function AdminLessonNotesPage() {
  const [notes, setNotes] = useState<LessonNote[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [modules, setModules] = useState<{ id: string; title: string }[]>([])
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([])

  const [filterCourse, setFilterCourse] = useState('')
  const [filterModule, setFilterModule] = useState('')
  const [filterLesson, setFilterLesson] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<LessonNote | null>(null)
  const [deleteNote, setDeleteNote] = useState<LessonNote | null>(null)

  // Form state
  const [formLessonId, setFormLessonId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formAudioUrl, setFormAudioUrl] = useState('')
  const [formOrder, setFormOrder] = useState(0)
  const [formHasQuiz, setFormHasQuiz] = useState(false)
  const [formQuizTitle, setFormQuizTitle] = useState('')
  const [formQuizQuestions, setFormQuizQuestions] = useState<QuizQuestion[]>([])
  const [formQuizPassingScore, setFormQuizPassingScore] = useState(50)
  const [formQuizTimeLimit, setFormQuizTimeLimit] = useState<number | null>(null)
  const [formQuizRequireFullscreen, setFormQuizRequireFullscreen] = useState(false)
  const [formQuizPreventTabSwitch, setFormQuizPreventTabSwitch] = useState(false)
  const [formQuizPreventCopyPaste, setFormQuizPreventCopyPaste] = useState(false)
  const [formQuizShuffleQuestions, setFormQuizShuffleQuestions] = useState(false)
  const [formQuizShuffleOptions, setFormQuizShuffleOptions] = useState(false)
  // Video quiz rewards
  const [formQuizXpReward, setFormQuizXpReward] = useState(10)
  const [formQuizGemReward, setFormQuizGemReward] = useState(1)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCourse) params.set('courseId', filterCourse)
      if (filterModule) params.set('moduleId', filterModule)
      if (filterLesson) params.set('lessonId', filterLesson)

      const res = await fetch(`/api/admin/lesson-notes?${params}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch {
      toast.error('Failed to fetch lesson notes')
    } finally {
      setLoading(false)
    }
  }, [filterCourse, filterModule, filterLesson])

  useEffect(() => {
    fetch('/api/admin/courses').then(r => r.json()).then(data => {
      setCourses((data.courses || []).map((c: any) => ({ id: c.id, title: c.title })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (filterCourse) {
      fetch(`/api/admin/courses/${filterCourse}`).then(r => r.json()).then(data => {
        setModules((data.course?.modules || []).map((m: any) => ({ id: m.id, title: m.title })))
        setFilterModule('')
        setLessons([])
      }).catch(() => {})
    } else {
      setModules([])
      setFilterModule('')
    }
  }, [filterCourse])

  useEffect(() => {
    if (filterModule) {
      fetch(`/api/admin/modules/${filterModule}`).then(r => r.json()).then(data => {
        setLessons((data.module?.lessons || []).map((l: any) => ({ id: l.id, title: l.title })))
        setFilterLesson('')
      }).catch(() => {})
    } else {
      setLessons([])
      setFilterLesson('')
    }
  }, [filterModule])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const openNew = () => {
    setEditingNote(null)
    setFormLessonId('')
    setFormTitle('')
    setFormContent('')
    setFormAudioUrl('')
    setFormOrder(notes.length)
    setFormHasQuiz(false)
    setFormQuizTitle('')
    setFormQuizQuestions([])
    setFormQuizPassingScore(50)
    setFormQuizTimeLimit(null)
    setFormQuizRequireFullscreen(false)
    setFormQuizPreventTabSwitch(false)
    setFormQuizPreventCopyPaste(false)
    setFormQuizShuffleQuestions(false)
    setFormQuizShuffleOptions(false)
    setFormQuizXpReward(10)
    setFormQuizGemReward(1)
    setDialogOpen(true)
  }

  const openEdit = (note: LessonNote) => {
    setEditingNote(note)
    setFormLessonId(note.lessonId || '')
    setFormTitle(note.title)
    setFormContent(note.content)
    setFormAudioUrl(note.audioUrl || '')
    setFormOrder(note.order)
    setFormHasQuiz(note.hasQuiz)
    setFormQuizTitle(note.quizTitle || '')
    setFormQuizQuestions(note.quizQuestions ? JSON.parse(note.quizQuestions) : [])
    setFormQuizPassingScore(note.quizPassingScore)
    setFormQuizTimeLimit(note.quizTimeLimit)
    setFormQuizRequireFullscreen(note.quizRequireFullscreen)
    setFormQuizPreventTabSwitch(note.quizPreventTabSwitch)
    setFormQuizPreventCopyPaste(note.quizPreventCopyPaste)
    setFormQuizShuffleQuestions(note.quizShuffleQuestions)
    setFormQuizShuffleOptions(note.quizShuffleOptions)
    setFormQuizXpReward(note.quizXpReward)
    setFormQuizGemReward(note.quizGemReward)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formTitle || !formContent) {
      toast.error('Title and content are required')
      return
    }

    if (formHasQuiz && formQuizQuestions.length === 0) {
      toast.error('Add at least one quiz question')
      return
    }

    try {
      const payload = {
        lessonId: formLessonId || null,
        title: formTitle,
        content: formContent,
        audioUrl: formAudioUrl || null,
        order: formOrder,
        hasQuiz: formHasQuiz,
        quizTitle: formHasQuiz ? (formQuizTitle || formTitle + ' Quiz') : null,
        quizQuestions: formHasQuiz ? formQuizQuestions : null,
        quizPassingScore: formQuizPassingScore,
        quizTimeLimit: formQuizTimeLimit,
        quizRequireFullscreen: formQuizRequireFullscreen,
        quizPreventTabSwitch: formQuizPreventTabSwitch,
        quizPreventCopyPaste: formQuizPreventCopyPaste,
        quizShuffleQuestions: formQuizShuffleQuestions,
        quizShuffleOptions: formQuizShuffleOptions,
        quizXpReward: formQuizXpReward,
        quizGemReward: formQuizGemReward,
      }

      const url = editingNote ? `/api/admin/lesson-notes/${editingNote.id}` : '/api/admin/lesson-notes'
      const method = editingNote ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingNote ? 'Note updated' : 'Note created')
        setDialogOpen(false)
        fetchNotes()
      } else {
        toast.error('Failed to save note')
      }
    } catch {
      toast.error('Failed to save note')
    }
  }

  const handleDelete = async () => {
    if (!deleteNote) return
    try {
      const res = await fetch(`/api/admin/lesson-notes/${deleteNote.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Note deleted')
        setDeleteNote(null)
        fetchNotes()
      }
    } catch {
      toast.error('Failed to delete note')
    }
  }

  const addQuizQuestion = () => {
    setFormQuizQuestions([...formQuizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'MCQ' }])
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updated = [...formQuizQuestions]
    if (field === 'options') {
      updated[index].options = value
    } else if (field === 'correctAnswer') {
      updated[index].correctAnswer = value
    } else {
      (updated[index] as any)[field] = value
    }
    setFormQuizQuestions(updated)
  }

  const removeQuizQuestion = (index: number) => {
    setFormQuizQuestions(formQuizQuestions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Lesson Notes</h2>
          <p className="text-muted-foreground">Create reading notes with optional quizzes for students</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterCourse || 'all'} onValueChange={(v) => { setFilterCourse(v === 'all' ? '' : v) }}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterModule || 'all'} onValueChange={(v) => { setFilterModule(v === 'all' ? '' : v) }} disabled={!filterCourse}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Modules" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterLesson || 'all'} onValueChange={(v) => { setFilterLesson(v === 'all' ? '' : v) }} disabled={!filterModule}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Lessons" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Lesson</TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}><div className="h-20 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ) : notes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No lesson notes found</TableCell></TableRow>
              ) : (
                notes.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell className="font-medium">{note.title}</TableCell>
                    <TableCell>
                      {note.lesson ? (
                        <div className="text-sm">
                          <div>{note.lesson.title}</div>
                          <div className="text-xs text-muted-foreground">{note.lesson.module.course.title}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Standalone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {note.hasQuiz ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Quiz</Badge>
                      ) : (
                        <Badge variant="outline">Reading</Badge>
                      )}
                    </TableCell>
                    <TableCell>{note.order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(note)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteNote(note)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Lesson Note' : 'New Lesson Note'}</DialogTitle>
            <DialogDescription>Create a reading note with optional quiz for students</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson (optional)</Label>
                  <Select value={formLessonId} onValueChange={setFormLessonId}>
                    <SelectTrigger><SelectValue placeholder="Select lesson or leave empty" /></SelectTrigger>
                    <SelectContent>
                      {lessons.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Introduction to Algebra" />
              </div>
              <div className="space-y-2">
                <Label>Content (supports markdown)</Label>
                <Textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="Write your lesson note content here..." rows={8} />
              </div>
              <div className="space-y-2">
                <Label>Audio URL (optional - for TTS or uploaded audio)</Label>
                <Input value={formAudioUrl} onChange={(e) => setFormAudioUrl(e.target.value)} placeholder="https://example.com/audio.mp3" />
              </div>
            </div>

            <Separator />

            {/* Quiz Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quiz Settings
                </h3>
                <div className="flex items-center gap-2">
                  <Label>Include Quiz</Label>
                  <Switch checked={formHasQuiz} onCheckedChange={setFormHasQuiz} />
                </div>
              </div>

              {formHasQuiz && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Passing Score (%)</Label>
                      <Input type="number" value={formQuizPassingScore} onChange={(e) => setFormQuizPassingScore(parseInt(e.target.value) || 50)} min={0} max={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>Time Limit (minutes, 0 = none)</Label>
                      <Input type="number" value={formQuizTimeLimit || ''} onChange={(e) => setFormQuizTimeLimit(e.target.value ? parseInt(e.target.value) : null)} min={0} />
                    </div>
                    <div className="space-y-2">
                      <Label>Quiz Title</Label>
                      <Input value={formQuizTitle} onChange={(e) => setFormQuizTitle(e.target.value)} placeholder="Quiz title" />
                    </div>
                  </div>

                  {/* Quiz Rewards */}
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <Label className="font-medium">Quiz Rewards (for passing quiz)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>XP Reward</Label>
                        <Input type="number" value={formQuizXpReward} onChange={(e) => setFormQuizXpReward(parseInt(e.target.value) || 0)} min={0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Gem Reward</Label>
                        <Input type="number" value={formQuizGemReward} onChange={(e) => setFormQuizGemReward(parseInt(e.target.value) || 0)} min={0} />
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <Label className="font-medium">Security Features</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={formQuizRequireFullscreen} onCheckedChange={setFormQuizRequireFullscreen} />
                        <span className="text-sm">Require Fullscreen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formQuizPreventTabSwitch} onCheckedChange={setFormQuizPreventTabSwitch} />
                        <span className="text-sm">Prevent Tab Switch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formQuizPreventCopyPaste} onCheckedChange={setFormQuizPreventCopyPaste} />
                        <span className="text-sm">Block Copy/Paste</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formQuizShuffleQuestions} onCheckedChange={setFormQuizShuffleQuestions} />
                        <span className="text-sm">Shuffle Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formQuizShuffleOptions} onCheckedChange={setFormQuizShuffleOptions} />
                        <span className="text-sm">Shuffle Options</span>
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Quiz Questions</Label>
                      <Button variant="outline" size="sm" onClick={addQuizQuestion} className="gap-1">
                        <Plus className="w-3 h-3" /> Add Question
                      </Button>
                    </div>
                    {formQuizQuestions.map((q, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">Question {i + 1}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeQuizQuestion(i)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <Input value={q.question} onChange={(e) => updateQuizQuestion(i, 'question', e.target.value)} placeholder="Question text" />
                        <div className="space-y-2">
                          {q.options.map((opt, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${i}`} checked={q.correctAnswer === j} onChange={() => updateQuizQuestion(i, 'correctAnswer', j)} className="accent-primary" />
                              <Input value={opt} onChange={(e) => { const newOpts = [...q.options]; newOpts[j] = e.target.value; updateQuizQuestion(i, 'options', newOpts) }} placeholder={`Option ${j + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {formQuizQuestions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">No questions added yet</div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingNote ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteNote} onOpenChange={() => setDeleteNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Lesson Note</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteNote?.title}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteNote(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}