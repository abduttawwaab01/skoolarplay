'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Upload, Search, PlusCircle, BookOpen, FileText, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
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
import { toast } from 'sonner'

interface LessonOption {
  id: string
  title: string
  module: { id: string; title: string; course: { id: string; title: string } }
}

interface Question {
  id: string
  type: string
  question: string
  hint: string | null
  explanation: string | null
  options: string | null
  correctAnswer: string
  points: number
  order: number
  lesson: { id: string; title: string; module: { id: string; title: string; course: { id: string; title: string } } }
}

interface Option {
  text: string
  isCorrect: boolean
}

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [modules, setModules] = useState<{ id: string; title: string }[]>([])
  const [lessons, setLessons] = useState<LessonOption[]>([])

  const [filterCourse, setFilterCourse] = useState<string | undefined>(undefined)
  const [filterModule, setFilterModule] = useState<string | undefined>(undefined)
  const [filterLesson, setFilterLesson] = useState<string | undefined>(undefined)

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [deleteQuestion, setDeleteQuestion] = useState<Question | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null)

  // Form
  const [formLessonId, setFormLessonId] = useState('')
  const [formType, setFormType] = useState('MCQ')
  const [formQuestion, setFormQuestion] = useState('')
  const [formOptions, setFormOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('')
  const [formHint, setFormHint] = useState('')
  const [formExplanation, setFormExplanation] = useState('')
  const [formPoints, setFormPoints] = useState(10)

  // Import dialog
  const [importDialog, setImportDialog] = useState(false)
  const [importText, setImportText] = useState('')

  // Quick create dialogs
  const [quickCreateDialog, setQuickCreateDialog] = useState<'course' | 'module' | 'lesson' | null>(null)
  const [quickCourseForm, setQuickCourseForm] = useState({ title: '', categoryId: '', difficulty: 'BEGINNER' })
  const [quickModuleForm, setQuickModuleForm] = useState({ title: '', courseId: '' })
  const [quickLessonForm, setQuickLessonForm] = useState({ title: '', moduleId: '', type: 'QUIZ' })
  const [quickCreateExpanded, setQuickCreateExpanded] = useState(false)

  const fetchQuestions = useCallback(async () => {
    if (!filterLesson) {
      setQuestions([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('lessonId', filterLesson)

      const res = await fetch(`/api/admin/questions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions)
      }
    } catch {
      toast.error('Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }, [filterLesson])

  useEffect(() => {
    // Fetch courses for filter
    fetch('/api/admin/courses').then(res => res.json()).then(data => {
      setCourses((data.courses || []).map((c: any) => ({ id: c.id, title: c.title })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (filterCourse) {
      // Get modules for course
      const course = courses.find(c => c.id === filterCourse)
      if (course) {
        fetch(`/api/admin/courses/${filterCourse}`).then(res => res.json()).then(data => {
          setModules((data.course?.modules || []).map((m: any) => ({ id: m.id, title: m.title })))
          setFilterModule('')
          setFilterLesson('')
          setLessons([])
        }).catch(() => {})
      }
    } else {
      setModules([])
      setFilterModule('')
      setFilterLesson('')
      setLessons([])
    }
  }, [filterCourse, courses])

  useEffect(() => {
    if (filterModule) {
      fetch(`/api/admin/modules/${filterModule}`).then(res => res.json()).then(data => {
        setLessons((data.module?.lessons || []))
        setFilterLesson('')
      }).catch(() => {})
    } else {
      setLessons([])
      setFilterLesson('')
    }
  }, [filterModule])

  const handleLoadQuestions = () => {
    if (filterLesson) {
      fetchQuestions()
    }
  }

  const openNewQuestion = () => {
    if (!filterLesson) {
      toast.error('Please select a lesson from the filters above first')
      return
    }
    setEditingQuestion(null)
    setFormLessonId(filterLesson || '')
    setFormType('MCQ')
    setFormQuestion('')
    setFormOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ])
    setFormCorrectAnswer('')
    setFormHint('')
    setFormExplanation('')
    setFormPoints(10)
    setDialogOpen(true)
  }

  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q)
    setFormLessonId(q.lesson.id)
    setFormType(q.type)
    setFormQuestion(q.question)
    setFormHint(q.hint || '')
    setFormExplanation(q.explanation || '')
    setFormPoints(q.points)

    try {
      let opts: any[] = []
      const rawOptions = q.options
      
      if (!rawOptions || rawOptions === 'null') {
        opts = []
      } else if (Array.isArray(rawOptions)) {
        opts = rawOptions
      } else if (typeof rawOptions === 'string' && rawOptions.trim()) {
        try {
          const parsed = JSON.parse(rawOptions)
          opts = Array.isArray(parsed) ? parsed : []
        } catch {
          opts = []
        }
      } else {
        opts = []
      }

      let ca: any = q.correctAnswer
      if (ca === null || ca === undefined || ca === 'null') {
        ca = null
      } else if (typeof ca === 'string' && ca.trim()) {
        try {
          ca = JSON.parse(ca)
        } catch {
          const num = parseInt(ca)
          ca = isNaN(num) ? ca : num
        }
      }

      // Handle DRAG_DROP separately (no isCorrect marking needed)
      if (q.type === 'DRAG_DROP') {
        setFormOptions(opts.map((o: any) => ({
          text: typeof o === 'string' ? o : (o?.text || ''),
          isCorrect: false, // Not used for drag-drop
        })))
        setFormCorrectAnswer('')
      } else if (['MCQ', 'CHECKBOX', 'MATCHING', 'ORDERING'].includes(q.type) && Array.isArray(opts) && opts.length > 0) {
        // Parse options as text array
        const optionTexts = opts.map((o: any) => typeof o === 'string' ? o : (o?.text || ''))
        
        if (q.type === 'MCQ') {
          // MCQ: correctAnswer is the option TEXT (not index)
          const correctText = typeof ca === 'string' ? ca : ''
          setFormOptions(optionTexts.map((text: string) => ({
            text,
            isCorrect: text === correctText,
          })))
          setFormCorrectAnswer('')
        } else if (q.type === 'CHECKBOX') {
          // CHECKBOX: correctAnswer is array of option TEXTS (not indices)
          const correctTexts = Array.isArray(ca) ? ca : []
          setFormOptions(optionTexts.map((text: string) => ({
            text,
            isCorrect: correctTexts.includes(text),
          })))
          setFormCorrectAnswer('')
        } else if (q.type === 'ORDERING') {
          // ORDERING: correctAnswer is array of option TEXTS in correct order
          setFormOptions(optionTexts.map((text: string) => ({
            text,
            isCorrect: false, // Not used for ordering
          })))
          setFormCorrectAnswer('')
        } else if (q.type === 'MATCHING') {
          // MATCHING: options are items, correctAnswer is pairs
          setFormOptions(optionTexts.map((text: string) => ({
            text,
            isCorrect: false,
          })))
          setFormCorrectAnswer(Array.isArray(ca) ? JSON.stringify(ca) : '')
        }
      } else if (q.type === 'TRUE_FALSE') {
        // TRUE_FALSE: correct answer is "true" or "false"
        const tfAnswer = ca === true || ca === 'true' || ca === 1 ? 'true' : 
                        ca === false || ca === 'false' || ca === 0 ? 'false' : 
                        String(ca || 'true')
        setFormCorrectAnswer(tfAnswer)
        setFormOptions([])
      } else {
        // FILL_BLANK, SPEECH - correct answer is text
        setFormCorrectAnswer(typeof ca === 'string' ? ca : JSON.stringify(ca || ''))
        setFormOptions([])
      }
    } catch (e) {
      console.error('Error parsing question:', e)
      setFormCorrectAnswer(q.correctAnswer || '')
    }

    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formLessonId || !formQuestion) {
      toast.error('Lesson and question text are required')
      return
    }

    try {
      let optionsData: string | null = null
      let correctAnswerData: any

      // Types that need options: MCQ, CHECKBOX
      const optionTypes = ['MCQ', 'CHECKBOX']
      
      // Types where correctAnswer is stored differently
      const orderedTypes = ['MATCHING', 'ORDERING', 'DRAG_DROP']
      
      if (optionTypes.includes(formType)) {
        const validOptions = formOptions.filter(o => o.text.trim())
        
        if (validOptions.length < 2) {
          toast.error('At least 2 options are required')
          return
        }
        
        if (formType === 'CHECKBOX') {
          // For CHECKBOX, check if at least one option is marked as correct
          const hasCorrectOption = validOptions.some(o => o.isCorrect)
          if (!hasCorrectOption) {
            toast.error('Please select at least one correct answer')
            return
          }
          // For CHECKBOX, save array of CORRECT OPTION TEXTS
          const correctOptions = validOptions.filter(o => o.isCorrect).map(o => o.text)
          correctAnswerData = JSON.stringify(correctOptions)
        } else {
          // For MCQ, check if exactly one option is marked as correct
          const correctCount = validOptions.filter(o => o.isCorrect).length
          if (correctCount !== 1) {
            toast.error('Please select exactly one correct answer')
            return
          }
          // For MCQ, save single correct OPTION TEXT (not index)
          const correctOption = validOptions.find(o => o.isCorrect)
          correctAnswerData = correctOption ? correctOption.text : ''
        }
        
        optionsData = JSON.stringify(validOptions.map(o => o.text))
      } else if (orderedTypes.includes(formType)) {
        const validOptions = formOptions.filter(o => o.text.trim())
        
        // For DRAG_DROP, validate that blanks match options
        if (formType === 'DRAG_DROP') {
          if (validOptions.length === 0) {
            toast.error('Please add draggable words')
            return
          }
          // Extract number of blanks from question template
          const blankMatches = formQuestion.match(/\{\{(\d+)\}\}/g)
          const numBlanks = blankMatches ? blankMatches.length : 0
          if (numBlanks === 0) {
            toast.error('Question must contain at least one blank (e.g., {{1}})')
            return
          }
          // For drag-drop, options are the words in shuffled order, correctAnswer is the WORDS in correct order
          correctAnswerData = JSON.stringify(validOptions.map(o => o.text))
        }
        
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        
        if (formType === 'MATCHING') {
          // For MATCHING, correctAnswer is the array of matching answers from formCorrectAnswer
          correctAnswerData = formCorrectAnswer || '[]'
        } else if (formType === 'ORDERING') {
          // For ORDERING, correct answer is the ordered TEXTS (in the order admin arranged them)
          correctAnswerData = JSON.stringify(validOptions.map(o => o.text))
        }
        // DRAG_DROP already handled above
      } else if (formType === 'TRUE_FALSE') {
        if (!formCorrectAnswer) {
          toast.error('Please select the correct answer (True or False)')
          return
        }
        correctAnswerData = formCorrectAnswer === 'true' ? 'true' : 'false'
      } else {
        // FILL_BLANK, SPEECH
        if (!formCorrectAnswer) {
          toast.error('Please enter the correct answer')
          return
        }
        correctAnswerData = formCorrectAnswer
      }

      const payload = {
        lessonId: formLessonId,
        type: formType,
        question: formQuestion,
        hint: formHint || null,
        explanation: formExplanation || null,
        options: optionsData,
        correctAnswer: correctAnswerData,
        points: formPoints,
      }

      const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : '/api/admin/questions'
      const method = editingQuestion ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingQuestion ? 'Question updated' : 'Question created')
        setDialogOpen(false)
        fetchQuestions()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save question')
      }
    } catch {
      toast.error('Failed to save question')
    }
  }

  const handleDelete = async () => {
    if (!deleteQuestion) return
    try {
      const res = await fetch(`/api/admin/questions/${deleteQuestion.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Question deleted')
        setDeleteQuestion(null)
        fetchQuestions()
      }
    } catch {
      toast.error('Failed to delete question')
    }
  }

  const typeColors: Record<string, string> = {
    MCQ: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    FILL_BLANK: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DRAG_DROP: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    MATCHING: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    TRUE_FALSE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    ORDERING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  }

  const addOption = () => {
    setFormOptions([...formOptions, { text: '', isCorrect: false }])
  }

  const removeOption = (index: number) => {
    if (formOptions.length <= 2) return
    setFormOptions(formOptions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterCourse || ''} onValueChange={(v) => { setFilterCourse(v === 'all' ? undefined : v) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterModule || ''} onValueChange={(v) => { setFilterModule(v === 'all' ? undefined : v) }} disabled={!filterCourse}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterLesson || ''} onValueChange={(v) => { setFilterLesson(v === 'all' ? undefined : v) }} disabled={!filterModule}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Lessons" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lessons</SelectItem>
                {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleLoadQuestions} disabled={!filterLesson} className="whitespace-nowrap">
              Load Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Create Section */}
      <Card>
        <CardHeader className="pb-3">
          <button
            onClick={() => setQuickCreateExpanded(!quickCreateExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-green-500" />
              Quick Create
            </CardTitle>
            {quickCreateExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {quickCreateExpanded && (
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              Create course, module, or lesson directly from here to quickly add questions.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuickCreateDialog('course')} className="gap-1">
                <BookOpen className="w-4 h-4" />
                New Course
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickCreateDialog('module')} className="gap-1" disabled={courses.length === 0}>
                <FileText className="w-4 h-4" />
                New Module
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuickCreateDialog('lesson')} className="gap-1" disabled={modules.length === 0}>
                <FileText className="w-4 h-4" />
                New Lesson
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={openNewQuestion} disabled={!filterLesson} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setImportDialog(true)}>
          <Upload className="w-4 h-4" />
          Import JSON
        </Button>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{filterLesson ? `Questions (${questions.length})` : 'Questions'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Lesson</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                  ))
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {!filterLesson ? 'Select a lesson above to view questions' : 'No questions found for this lesson'}
                    </TableCell>
                  </TableRow>
                ) : (
                  questions.map((q, i) => (
                    <motion.tr
                      key={q.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="max-w-xs">
                        <p className="truncate font-medium text-sm">{q.question}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeColors[q.type] || ''}>{q.type}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {q.lesson.title}
                      </TableCell>
                      <TableCell className="font-medium">{q.points}</TableCell>
                      <TableCell>
                        <Switch
                          checked={(q as any).isActive ?? true}
                          onCheckedChange={async (checked) => {
                            const res = await fetch(`/api/admin/questions/${q.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ isActive: checked }),
                            })
                            if (res.ok) fetchQuestions()
                          }}
                          className="scale-75"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewQuestion(q)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditQuestion(q)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteQuestion(q)}>
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

      {/* Question Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'New Question'}</DialogTitle>
            <DialogDescription>Configure the question details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={formLessonId} onValueChange={setFormLessonId}>
                <SelectTrigger><SelectValue placeholder="Select lesson" /></SelectTrigger>
                <SelectContent>
                  {(filterLesson ? [lessons.find(l => l.id === filterLesson)].filter((l): l is LessonOption => Boolean(l)) : lessons).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                  {!filterLesson && lessons.length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Select a course, module, and lesson above first
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                  <SelectItem value="FILL_BLANK">Fill in the Blank</SelectItem>
                  <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  <SelectItem value="DRAG_DROP">Drag & Drop</SelectItem>
                  <SelectItem value="MATCHING">Matching</SelectItem>
                  <SelectItem value="ORDERING">Ordering</SelectItem>
                  <SelectItem value="CHECKBOX">Multiple Selection (Checkbox)</SelectItem>
                  <SelectItem value="SPEECH">Speech Recognition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea value={formQuestion} onChange={(e) => setFormQuestion(e.target.value)} placeholder="Enter question..." rows={3} />
            </div>

            {/* MCQ Options */}
            {formType === 'MCQ' && (
              <div className="space-y-2">
                <Label>Options</Label>
                {formOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name="correct"
                      checked={opt.isCorrect}
                      onChange={() => setFormOptions(formOptions.map((o, j) => ({ ...o, isCorrect: j === i })))}
                      className="accent-primary"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {formOptions.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                  <Plus className="w-3 h-3" /> Add Option
                </Button>
              </div>
            )}

            {/* Drag & Drop - Fill in the blank with draggable words */}
            {formType === 'DRAG_DROP' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Question with Blanks</Label>
                  <Textarea
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    placeholder="Enter a sentence with blanks, e.g., 'The capital of France is {{1}} and its currency is {{2}}'"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {'{{1}}'}, {'{{2}}'}, etc. as placeholders for blanks. Each number represents a drop slot.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Draggable Words (place these in the correct order)</Label>
                  <p className="text-xs text-muted-foreground">
                    Add the words/phrases that students will drag to fill the blanks. The order you add them should be the correct order.
                  </p>
                  <div className="space-y-2">
                    {formOptions.map((opt, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-300 shrink-0">
                          {i + 1}
                        </div>
                        <Input
                          value={opt.text}
                          onChange={(e) => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                          placeholder={`Word ${i + 1} (e.g., Paris)`}
                          className="flex-1"
                        />
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        {formOptions.length > 2 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                    <Plus className="w-3 h-3" /> Add Word
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 dark:bg-purple-950/30 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Preview:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Students will see the sentence with numbered blanks and a pool of draggable words. 
                    They must drag each word to its correct position.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>Example:</strong> Question: &quot;The capital of France is &#123;&#123;1&#125;&#125; and its currency is &#123;&#123;2&#125;&#125;&quot; 
                    → Words: [&quot;Paris&quot;, &quot;Euro&quot;, &quot;France&quot;, &quot;Lyon&quot;]
                  </p>
                </div>
              </div>
            )}

            {/* Fill Blank */}
            {formType === 'FILL_BLANK' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input value={formCorrectAnswer} onChange={(e) => setFormCorrectAnswer(e.target.value)} placeholder="Correct answer" />
              </div>
            )}

            {/* True/False */}
            {formType === 'TRUE_FALSE' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select value={formCorrectAnswer} onValueChange={setFormCorrectAnswer}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Matching */}
            {formType === 'MATCHING' && (
              <div className="space-y-3">
                <Label>Matching Pairs</Label>
                <p className="text-xs text-muted-foreground">Add items on the left and their matching answers on the right</p>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Items</p>
                    {formOptions.map((opt, i) => (
                      <div key={i} className="flex gap-1">
                        <Input
                          value={opt.text}
                          onChange={(e) => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                          placeholder={`Item ${i + 1}`}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Match To</p>
                    {formOptions.map((opt, i) => {
                      // Get the corresponding answer from formCorrectAnswer (stored as array)
                      let answers: string[] = []
                      try {
                        if (formCorrectAnswer) {
                          const parsed = JSON.parse(formCorrectAnswer)
                          answers = Array.isArray(parsed) ? parsed : []
                        }
                      } catch {}
                      return (
                        <Input
                          key={i}
                          value={answers[i] || ''}
                          onChange={(e) => {
                            const newAnswers = [...answers]
                            newAnswers[i] = e.target.value
                            setFormCorrectAnswer(JSON.stringify(newAnswers))
                          }}
                          placeholder={`Match ${i + 1}`}
                          className="text-sm"
                        />
                      )
                    })}
                  </div>
                  <div className="pt-6">
                    {formOptions.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(formOptions.length - 1)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                  <Plus className="w-3 h-3" /> Add Pair
                </Button>
              </div>
            )}

            {/* Ordering */}
            {formType === 'ORDERING' && (
              <div className="space-y-3">
                <Label>Items (arrange in correct order)</Label>
                <p className="text-xs text-muted-foreground">Add items and drag to reorder them in the correct sequence</p>
                <div className="space-y-2">
                  {formOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {i + 1}
                      </div>
                      <Input
                        value={opt.text}
                        onChange={(e) => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                        placeholder={`Item ${i + 1}`}
                        className="flex-1"
                      />
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      {formOptions.length > 2 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                  <Plus className="w-3 h-3" /> Add Item
                </Button>
                <p className="text-sm text-muted-foreground">The correct order is the order you add them in</p>
              </div>
            )}

            {/* Checkbox - Multiple Selection */}
            {formType === 'CHECKBOX' && (
              <div className="space-y-2">
                <Label>Options (select all that apply)</Label>
                {formOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={() => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, isCorrect: !o.isCorrect } : o))}
                      className="accent-primary w-4 h-4"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) => setFormOptions(formOptions.map((o, j) => j === i ? { ...o, text: e.target.value } : o))}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1"
                    />
                    {formOptions.length > 2 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeOption(i)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addOption} className="gap-1">
                  <Plus className="w-3 h-3" /> Add Option
                </Button>
                <p className="text-sm text-muted-foreground">Check the boxes next to correct answers</p>
              </div>
            )}

            {/* Speech - Pronunciation */}
            {formType === 'SPEECH' && (
              <div className="space-y-2">
                <Label>Expected Answer (word or phrase student should pronounce)</Label>
                <Input
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  placeholder="Enter the word or phrase"
                />
                <p className="text-sm text-muted-foreground">Students will speak this word and their pronunciation will be checked</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Hint (optional)</Label>
              <Input value={formHint} onChange={(e) => setFormHint(e.target.value)} placeholder="Hint for the student" />
            </div>
            <div className="space-y-2">
              <Label>Explanation (optional)</Label>
              <Textarea value={formExplanation} onChange={(e) => setFormExplanation(e.target.value)} placeholder="Explanation shown after answering" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" value={formPoints} onChange={(e) => setFormPoints(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingQuestion ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>Preview how the question will appear to students</DialogDescription>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={typeColors[previewQuestion.type]}>{previewQuestion.type}</Badge>
                <Badge variant="secondary">{previewQuestion.points} pts</Badge>
              </div>
              <p className="text-lg font-medium">{previewQuestion.question}</p>
              
              {/* MCQ, CHECKBOX, DRAG_DROP - show options with correct answer marked */}
              {['MCQ', 'CHECKBOX', 'DRAG_DROP'].includes(previewQuestion.type) && previewQuestion.options && (
                <div className="space-y-2">
                  {(() => {
                    let options: string[] = []
                    let correctAnswer: any = null
                    try {
                      const rawOptions = previewQuestion.options
                      
                      if (!rawOptions || rawOptions === 'null') {
                        options = []
                      } else if (Array.isArray(rawOptions)) {
                        options = rawOptions.map((o: any) => typeof o === 'string' ? o : (o?.text || ''))
                      } else if (typeof rawOptions === 'string' && rawOptions.trim()) {
                        try {
                          const parsed = JSON.parse(rawOptions)
                          options = Array.isArray(parsed) ? parsed.map((o: any) => typeof o === 'string' ? o : (o?.text || '')) : []
                        } catch {
                          options = []
                        }
                      } else {
                        options = []
                      }
                      
                      const rawCorrect = previewQuestion.correctAnswer
                      if (rawCorrect === null || rawCorrect === undefined || rawCorrect === 'null') {
                        correctAnswer = null
                      } else if (Array.isArray(rawCorrect)) {
                        correctAnswer = rawCorrect
                      } else if (typeof rawCorrect === 'string' && rawCorrect.trim()) {
                        try {
                          correctAnswer = JSON.parse(rawCorrect)
                        } catch {
                          const num = parseInt(rawCorrect)
                          correctAnswer = isNaN(num) ? rawCorrect : num
                        }
                      } else {
                        correctAnswer = rawCorrect
                      }
                    } catch (e) {
                      console.error('Preview parse error:', e)
                      options = []
                    }
                    
                    if (!Array.isArray(options) || options.length === 0) {
                      return <div className="text-sm text-muted-foreground">No options available</div>
                    }
                    
                    return options.map((opt: string, i: number) => {
                      // MCQ: correctAnswer is the TEXT of the correct option
                      // CHECKBOX: correctAnswer is an array of correct option TEXTS
                      let isCorrect = false
                      if (previewQuestion.type === 'MCQ') {
                        isCorrect = correctAnswer === opt
                      } else if (previewQuestion.type === 'CHECKBOX') {
                        isCorrect = Array.isArray(correctAnswer) && correctAnswer.includes(opt)
                      } else if (previewQuestion.type === 'DRAG_DROP') {
                        // For drag-drop, correct answer is the ordered words array
                        isCorrect = Array.isArray(correctAnswer) && correctAnswer.includes(opt)
                      }
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700' : ''}`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                          {isCorrect && <Badge className="ml-2 bg-green-500">Correct</Badge>}
                        </div>
                      )
                    })
                  })()}
                </div>
              )}

              {/* MATCHING - show item to match pairs */}
              {previewQuestion.type === 'MATCHING' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Correct Matches:</Label>
                  {(() => {
                    let pairs: Array<{left: string, right: string}> = []
                    try {
                      const rawCorrect = previewQuestion.correctAnswer
                      if (rawCorrect && rawCorrect !== 'null') {
                        const parsed = JSON.parse(rawCorrect)
                        pairs = Array.isArray(parsed) ? parsed : []
                      }
                    } catch {}
                    
                    if (pairs.length === 0) {
                      return <div className="text-sm text-muted-foreground">No matches set</div>
                    }
                    
                    return pairs.map((pair, i: number) => (
                      <div key={i} className="p-2 rounded bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800 flex justify-between">
                        <span className="font-medium">{pair.left}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-green-600 font-medium">{pair.right || 'Not set'}</span>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* ORDERING - show correct order */}
              {previewQuestion.type === 'ORDERING' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Correct Order:</Label>
                  {(() => {
                    let correctOrder: string[] = []
                    try {
                      const rawCorrect = previewQuestion.correctAnswer
                      if (rawCorrect && rawCorrect !== 'null') {
                        const parsed = JSON.parse(rawCorrect)
                        correctOrder = Array.isArray(parsed) ? parsed : []
                      }
                    } catch {}
                    
                    if (correctOrder.length === 0) {
                      return <div className="text-sm text-muted-foreground">No correct order set</div>
                    }
                    
                    return correctOrder.map((opt: string, i: number) => (
                      <div key={i} className="p-2 rounded bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">{i + 1}</span>
                        <span className="font-medium">{opt}</span>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* FILL_BLANK */}
              {previewQuestion.type === 'FILL_BLANK' && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-300 dark:bg-green-950 dark:border-green-700">
                  <span className="text-sm text-muted-foreground">Answer: </span>
                  <span className="font-medium">{previewQuestion.correctAnswer}</span>
                </div>
              )}

              {/* TRUE_FALSE */}
              {previewQuestion.type === 'TRUE_FALSE' && (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-300 dark:bg-purple-950 dark:border-purple-700">
                  <span className="text-sm text-muted-foreground">Correct Answer: </span>
                  <Badge className={String(previewQuestion.correctAnswer).toLowerCase() === 'true' ? 'bg-green-500' : 'bg-red-500'}>
                    {String(previewQuestion.correctAnswer).toUpperCase()}
                  </Badge>
                </div>
              )}

              {/* SPEECH */}
              {previewQuestion.type === 'SPEECH' && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-300 dark:bg-blue-950 dark:border-blue-700">
                  <span className="text-sm text-muted-foreground">Expected Answer: </span>
                  <span className="font-medium">{previewQuestion.correctAnswer}</span>
                  <p className="text-xs text-muted-foreground mt-1">Students will speak this word for pronunciation check</p>
                </div>
              )}
              {previewQuestion.hint && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                  <span className="text-sm text-muted-foreground">Hint: </span>
                  <span>{previewQuestion.hint}</span>
                </div>
              )}
              {previewQuestion.explanation && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                  <span className="text-sm text-muted-foreground">Explanation: </span>
                  <span>{previewQuestion.explanation}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Questions</DialogTitle>
            <DialogDescription>
              Paste a JSON array of questions. Each question needs: lessonId, type, question, correctAnswer, and points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>JSON Data</Label>
            <Textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={'[\n  {\n    "lessonId": "...",\n    "type": "MCQ",\n    "question": "What is...?",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": 0,\n    "points": 10\n  }\n]'}
              rows={10}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                const questions = JSON.parse(importText)
                if (!Array.isArray(questions)) throw new Error('Must be an array')
                let created = 0
                for (const q of questions) {
                  const res = await fetch('/api/admin/questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(q),
                  })
                  if (res.ok) created++
                }
                toast.success(`Imported ${created}/${questions.length} questions`)
                setImportDialog(false)
                setImportText('')
                fetchQuestions()
              } catch {
                toast.error('Invalid JSON format')
              }
            }}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteQuestion} onOpenChange={() => setDeleteQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Question</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteQuestion(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Course Dialog */}
      <Dialog open={quickCreateDialog === 'course'} onOpenChange={(open) => !open && setQuickCreateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Course</DialogTitle>
            <DialogDescription>Create a new course directly</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input value={quickCourseForm.title} onChange={(e) => setQuickCourseForm({ ...quickCourseForm, title: e.target.value })} placeholder="e.g., Introduction to Mathematics" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={quickCourseForm.categoryId} onValueChange={(v) => setQuickCourseForm({ ...quickCourseForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  )) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No categories available</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={quickCourseForm.difficulty} onValueChange={(v) => setQuickCourseForm({ ...quickCourseForm, difficulty: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCreateDialog(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (!quickCourseForm.title || !quickCourseForm.categoryId) {
                toast.error('Title and category are required')
                return
              }
              const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quickCourseForm),
              })
              if (res.ok) {
                toast.success('Course created!')
                setQuickCreateDialog(null)
                setQuickCourseForm({ title: '', categoryId: '', difficulty: 'BEGINNER' })
                // Refresh courses list
                fetch('/api/admin/courses').then(r => r.json()).then(data => {
                  setCourses((data.courses || []).map((c: any) => ({ id: c.id, title: c.title })))
                })
              } else {
                toast.error('Failed to create course')
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Module Dialog */}
      <Dialog open={quickCreateDialog === 'module'} onOpenChange={(open) => !open && setQuickCreateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Module</DialogTitle>
            <DialogDescription>Create a new module for a course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={quickModuleForm.courseId} onValueChange={(v) => setQuickModuleForm({ ...quickModuleForm, courseId: v })}>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input value={quickModuleForm.title} onChange={(e) => setQuickModuleForm({ ...quickModuleForm, title: e.target.value })} placeholder="e.g., Chapter 1: Basics" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCreateDialog(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (!quickModuleForm.title || !quickModuleForm.courseId) {
                toast.error('Title and course are required')
                return
              }
              const res = await fetch(`/api/admin/courses/${quickModuleForm.courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: quickModuleForm.title }),
              })
              if (res.ok) {
                toast.success('Module created!')
                setQuickCreateDialog(null)
                setQuickModuleForm({ title: '', courseId: '' })
                // Refresh modules for current filter
                if (filterCourse) {
                  fetch(`/api/admin/courses/${filterCourse}`).then(r => r.json()).then(data => {
                    setModules((data.course?.modules || []).map((m: any) => ({ id: m.id, title: m.title })))
                  })
                }
              } else {
                toast.error('Failed to create module')
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Lesson Dialog */}
      <Dialog open={quickCreateDialog === 'lesson'} onOpenChange={(open) => !open && setQuickCreateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Lesson</DialogTitle>
            <DialogDescription>Create a new lesson for a module</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={quickLessonForm.moduleId} onValueChange={(v) => setQuickLessonForm({ ...quickLessonForm, moduleId: v })}>
                <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                <SelectContent>
                  {modules.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input value={quickLessonForm.title} onChange={(e) => setQuickLessonForm({ ...quickLessonForm, title: e.target.value })} placeholder="e.g., Introduction Quiz" />
            </div>
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select value={quickLessonForm.type} onValueChange={(v) => setQuickLessonForm({ ...quickLessonForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUIZ">Quiz (Gamified Questions)</SelectItem>
                  <SelectItem value="VIDEO">Video Lesson</SelectItem>
                  <SelectItem value="READING">Reading Note</SelectItem>
                  <SelectItem value="MIXED">Mixed (Quiz + Reading)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickCreateDialog(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (!quickLessonForm.title || !quickLessonForm.moduleId) {
                toast.error('Title and module are required')
                return
              }
              const res = await fetch(`/api/admin/modules/${quickLessonForm.moduleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: quickLessonForm.title,
                  type: quickLessonForm.type,
                }),
              })
              if (res.ok) {
                toast.success('Lesson created!')
                setQuickCreateDialog(null)
                setQuickLessonForm({ title: '', moduleId: '', type: 'QUIZ' })
                // Refresh lessons for current filter
                if (filterModule) {
                  fetch(`/api/admin/modules/${filterModule}`).then(r => r.json()).then(data => {
                    setLessons((data.module?.lessons || []).map((l: any) => ({ id: l.id, title: l.title, module: { id: data.module?.id, title: data.module?.title, course: data.module?.course } })))
                  })
                }
              } else {
                toast.error('Failed to create lesson')
              }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
