'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  BookOpen,
  DollarSign,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit3,
  Check,
  X,
  FileQuestion,
  Video,
  BookText,
  Layers,
  Settings,
  Eye,
  Upload,
  AlertCircle,
  Copy,
  Gem,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { Skeleton } from '@/components/ui/skeleton'

interface Category {
  id: string
  name: string
}

interface CourseData {
  id: string
  title: string
  description: string | null
  categoryId: string | null
  difficulty: string
  price: number | null
  isFree: boolean
  icon: string | null
  color: string | null
  status: string
}

interface LessonData {
  id: string
  title: string
  type: string
  order: number
  xpReward: number
  gemReward: number
  isActive: boolean
  _count: { questions: number; progress: number }
}

interface ModuleData {
  id: string
  title: string
  order: number
  lessons: LessonData[]
}

interface QuestionData {
  id: string
  type: string
  question: string
  options: string | null
  correctAnswer: string
  hint: string | null
  explanation: string | null
  order: number
  points: number
}

const lessonTypeIcons: Record<string, React.ReactNode> = {
  QUIZ: <FileQuestion className="w-4 h-4" />,
  VIDEO: <Video className="w-4 h-4" />,
  READING: <BookText className="w-4 h-4" />,
  MIXED: <Layers className="w-4 h-4" />,
}

const lessonTypeColors: Record<string, string> = {
  QUIZ: 'bg-blue-500/10 text-blue-600',
  VIDEO: 'bg-red-500/10 text-red-600',
  READING: 'bg-green-500/10 text-green-600',
  MIXED: 'bg-purple-500/10 text-purple-600',
}

export function TeacherCourseCreatePage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: '',
    isFree: true,
    price: '',
    icon: '',
    color: '#6366f1',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [existingCourse, setExistingCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('course-info')

  // Module/Lesson state
  const [modules, setModules] = useState<ModuleData[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loadingModules, setLoadingModules] = useState(false)

  // Inline editing
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
  const [editingModuleTitle, setEditingModuleTitle] = useState('')
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editingLessonData, setEditingLessonData] = useState({ title: '', type: 'QUIZ', xpReward: 10, gemReward: 1 })

  // Add forms
  const [showAddModule, setShowAddModule] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [addingModule, setAddingModule] = useState(false)

  const [addLessonToModule, setAddLessonToModule] = useState<string | null>(null)
  const [newLesson, setNewLesson] = useState({ title: '', type: 'QUIZ', xpReward: 10, gemReward: 1 })
  const [addingLesson, setAddingLesson] = useState(false)

  // Questions
  const [viewingLessonQuestions, setViewingLessonQuestions] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // Bulk import
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkImportLessonId, setBulkImportLessonId] = useState<string | null>(null)
  const [bulkJson, setBulkJson] = useState('')
  const [importing, setImporting] = useState(false)

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const { goBack, params, navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')

  const courseId = params?.courseId as string | undefined
  const isEditMode = !!courseId

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  useEffect(() => {
    fetchCategories()
    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchCourse = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`)
      if (res.ok) {
        const data = await res.json()
        const course = data.course || data
        setExistingCourse(course)
        setForm({
          title: course.title || '',
          description: course.description || '',
          categoryId: course.categoryId || '',
          difficulty: course.difficulty || '',
          isFree: course.isFree ?? true,
          price: course.price ? String(course.price) : '',
          icon: course.icon || '',
          color: course.color || '#6366f1',
        })
        // Auto-switch to modules tab if course exists and has content
        if (course.status === 'DRAFT') {
          fetchModules()
        }
      } else {
        navigateTo('teacher-dashboard')
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = useCallback(async () => {
    if (!courseId) return
    setLoadingModules(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules`)
      if (res.ok) {
        const data = await res.json()
        setModules(data.modules || [])
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    } finally {
      setLoadingModules(false)
    }
  }, [courseId])

  const fetchQuestions = async (lessonId: string) => {
    if (!courseId) return
    setLoadingQuestions(true)
    setViewingLessonQuestions(lessonId)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/questions?lessonId=${lessonId}`)
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleSave = async (action: 'draft' | 'submit') => {
    if (!form.title.trim()) return

    if (action === 'submit') {
      setSubmitting(true)
    } else {
      setSaving(true)
    }
    playClick()

    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        categoryId: form.categoryId || null,
        difficulty: form.difficulty || null,
        isFree: form.isFree,
        price: form.isFree ? null : Number(form.price) || null,
        icon: form.icon.trim() || null,
        color: form.color.trim() || null,
        status: action === 'submit' ? 'UNDER_REVIEW' : 'DRAFT',
      }

      const url = isEditMode ? `/api/teacher/courses/${courseId}` : '/api/teacher/courses'
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        if (action === 'submit') {
          navigateTo('teacher-dashboard')
        } else {
          const data = await res.json()
          if (!isEditMode && data.course?.id) {
            navigateTo('teacher-course-create', { courseId: data.course.id })
          } else {
            showToast('Course saved!')
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast(errData.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Failed to save course:', error)
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !courseId) return
    setAddingModule(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newModuleTitle.trim() }),
      })
      if (res.ok) {
        setNewModuleTitle('')
        setShowAddModule(false)
        fetchModules()
        showToast('Module added!')
      }
    } catch (error) {
      console.error('Failed to add module:', error)
    } finally {
      setAddingModule(false)
    }
  }

  const handleUpdateModule = async (moduleId: string) => {
    if (!editingModuleTitle.trim() || !courseId) return
    setActionLoading(`update-module-${moduleId}`)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, title: editingModuleTitle.trim() }),
      })
      if (res.ok) {
        setEditingModuleId(null)
        fetchModules()
        showToast('Module updated!')
      }
    } catch (error) {
      console.error('Failed to update module:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all its lessons? This cannot be undone.')) return
    if (!courseId) return
    setActionLoading(`delete-module-${moduleId}`)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/modules?moduleId=${moduleId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchModules()
        showToast('Module deleted')
      }
    } catch (error) {
      console.error('Failed to delete module:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddLesson = async () => {
    if (!newLesson.title.trim() || !addLessonToModule || !courseId) return
    setAddingLesson(true)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: addLessonToModule,
          title: newLesson.title.trim(),
          type: newLesson.type,
          xpReward: Number(newLesson.xpReward) || 10,
          gemReward: Number(newLesson.gemReward) || 1,
        }),
      })
      if (res.ok) {
        setNewLesson({ title: '', type: 'QUIZ', xpReward: 10, gemReward: 1 })
        setAddLessonToModule(null)
        fetchModules()
        showToast('Lesson added!')
      }
    } catch (error) {
      console.error('Failed to add lesson:', error)
    } finally {
      setAddingLesson(false)
    }
  }

  const handleUpdateLesson = async (lessonId: string) => {
    if (!editingLessonData.title.trim() || !courseId) return
    setActionLoading(`update-lesson-${lessonId}`)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          title: editingLessonData.title.trim(),
          type: editingLessonData.type,
          xpReward: Number(editingLessonData.xpReward) || 10,
          gemReward: Number(editingLessonData.gemReward) || 1,
        }),
      })
      if (res.ok) {
        setEditingLessonId(null)
        fetchModules()
        showToast('Lesson updated!')
      }
    } catch (error) {
      console.error('Failed to update lesson:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson and all its questions? This cannot be undone.')) return
    if (!courseId) return
    setActionLoading(`delete-lesson-${lessonId}`)
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/lessons?lessonId=${lessonId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchModules()
        if (viewingLessonQuestions === lessonId) {
          setViewingLessonQuestions(null)
          setQuestions([])
        }
        showToast('Lesson deleted')
      }
    } catch (error) {
      console.error('Failed to delete lesson:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkImport = async () => {
    if (!bulkJson.trim() || !bulkImportLessonId || !courseId) return
    setImporting(true)
    try {
      let parsed = JSON.parse(bulkJson)
      if (!Array.isArray(parsed)) {
        showToast('JSON must be an array of questions')
        setImporting(false)
        return
      }
      // Add lessonId to each question
      parsed = parsed.map(q => ({ ...q, lessonId: bulkImportLessonId }))

      const res = await fetch(`/api/teacher/courses/${courseId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsed }),
      })
      if (res.ok) {
        const data = await res.json()
        showToast(`Imported ${data.created} questions!`)
        setBulkJson('')
        setBulkImportOpen(false)
        setBulkImportLessonId(null)
        if (viewingLessonQuestions === bulkImportLessonId) {
          fetchQuestions(bulkImportLessonId)
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        showToast(errData.error || 'Import failed')
      }
    } catch (e) {
      showToast('Invalid JSON format')
    } finally {
      setImporting(false)
    }
  }

  const copyBulkTemplate = () => {
    const template = JSON.stringify([
      {
        question: "What is 2 + 2?",
        type: "MCQ",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        hint: "Basic addition",
        explanation: "2 + 2 = 4",
        points: 10
      },
      {
        question: "The capital of Nigeria is _____.",
        type: "FILL_BLANK",
        correctAnswer: "Abuja",
        points: 10
      }
    ], null, 2)
    navigator.clipboard.writeText(template)
    showToast('Template copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalQuestions = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((ls, l) => ls + l._count.questions, 0), 0
  )

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-3xl mx-auto">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg text-sm font-medium"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? `Editing "${existingCourse?.title || ''}" (${existingCourse?.status})`
              : 'Fill in the details to create a new course'}
          </p>
        </div>
        {isEditMode && (
          <Badge className={`text-[10px] rounded-full border-0 shrink-0 ${
            existingCourse?.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' :
            existingCourse?.status === 'UNDER_REVIEW' ? 'bg-yellow-500/10 text-yellow-600' :
            'bg-gray-500/10 text-gray-600'
          }`}>
            {existingCourse?.status}
          </Badge>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="course-info" className="flex-1 gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Course Info</span>
          </TabsTrigger>
          {isEditMode && (
            <TabsTrigger value="modules" className="flex-1 gap-1.5">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Modules & Lessons</span>
              {(totalLessons > 0 || totalQuestions > 0) && (
                <Badge className="text-[9px] rounded-full bg-primary/10 text-primary border-0 ml-1 h-4 px-1.5">
                  {totalLessons}L {totalQuestions > 0 && `/ ${totalQuestions}Q`}
                </Badge>
              )}
            </TabsTrigger>
          )}
          {isEditMode && (
            <TabsTrigger value="settings" className="flex-1 gap-1.5">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* TAB 1: Course Info */}
        <TabsContent value="course-info">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4 md:p-6 space-y-5">
                {/* Title */}
                <div>
                  <Label className="text-sm font-medium">
                    Course Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Introduction to Algebra for WAEC"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="rounded-xl mt-1.5"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    placeholder="What will students learn in this course? Describe the objectives, content, and outcomes..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="rounded-xl mt-1.5 min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* Category */}
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={form.categoryId} onValueChange={(val) => setForm({ ...form, categoryId: val })}>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <Label className="text-sm font-medium">Difficulty Level</Label>
                  <Select value={form.difficulty} onValueChange={(val) => setForm({ ...form, difficulty: val })}>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pricing */}
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pricing
                  </Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Switch
                      checked={form.isFree}
                      onCheckedChange={(checked) => setForm({ ...form, isFree: checked })}
                    />
                    <span className="text-sm">{form.isFree ? 'Free Course' : 'Paid Course'}</span>
                  </div>
                  {!form.isFree && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <Label className="text-xs text-muted-foreground">Price (NGN)</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₦</span>
                        <Input
                          type="number"
                          min="100"
                          placeholder="0"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          className="rounded-xl pl-8"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Minimum ₦100. Commission: 15% deducted from earnings.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Icon and Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      Icon (Emoji)
                    </Label>
                    <Input
                      placeholder="📚"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      className="rounded-xl mt-1.5 text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Accent Color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={form.color}
                        onChange={(e) => setForm({ ...form, color: e.target.value })}
                        className="rounded-xl flex-1"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border rounded-xl p-4 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Preview</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl"
                      style={{ backgroundColor: form.color || '#6366f1' }}
                    >
                      {form.icon || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {form.title || 'Course Title'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {form.difficulty && (
                          <span className="text-[10px] text-muted-foreground">{form.difficulty}</span>
                        )}
                        {form.isFree ? (
                          <span className="text-[10px] font-medium text-green-600">Free</span>
                        ) : form.price ? (
                          <span className="text-[10px] font-medium text-primary">₦{Number(form.price).toLocaleString()}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() => handleSave('draft')}
                    disabled={saving || submitting || !form.title.trim()}
                    variant="outline"
                    className="flex-1 rounded-xl h-11 gap-1.5"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isEditMode ? 'Update Course' : 'Save as Draft'}
                  </Button>
                  <Button
                    onClick={() => handleSave('submit')}
                    disabled={saving || submitting || !form.title.trim()}
                    className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90 gap-1.5"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit for Review
                  </Button>
                </div>

                {isEditMode && (
                  <p className="text-xs text-muted-foreground text-center">
                    Save the course info first, then use &ldquo;Modules & Lessons&rdquo; tab to add content.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* TAB 2: Modules & Lessons */}
        <TabsContent value="modules">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {!isEditMode ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="font-semibold mb-1">Save Your Course First</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Go to Course Info tab, fill in the details and save as draft. Then you can add modules and lessons.
                  </p>
                  <Button onClick={() => setActiveTab('course-info')} className="rounded-full gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    Go to Course Info
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {modules.length} Module{modules.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {totalQuestions} Question{totalQuestions !== 1 ? 's' : ''}
                  </Badge>
                  <div className="flex-1" />
                  <Button
                    onClick={() => { playClick(); setShowAddModule(true) }}
                    disabled={showAddModule}
                    size="sm"
                    className="rounded-full gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </Button>
                </div>

                {/* Add Module Inline */}
                <AnimatePresence>
                  {showAddModule && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                          <Label className="text-sm font-medium">Module Title</Label>
                          <div className="flex gap-2 mt-1.5">
                            <Input
                              placeholder="e.g., Chapter 1: Introduction"
                              value={newModuleTitle}
                              onChange={(e) => setNewModuleTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                              className="rounded-xl flex-1"
                              autoFocus
                            />
                            <Button onClick={handleAddModule} disabled={!newModuleTitle.trim() || addingModule} size="sm" className="rounded-xl gap-1">
                              {addingModule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Add
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setShowAddModule(false); setNewModuleTitle('') }}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modules List */}
                {loadingModules ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : modules.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="text-4xl mb-3">📦</div>
                      <h3 className="font-semibold mb-1">No Modules Yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Start building your course by adding modules. Each module can contain multiple lessons.
                      </p>
                      <Button onClick={() => setShowAddModule(true)} className="rounded-full gap-1.5">
                        <Plus className="w-4 h-4" />
                        Add Your First Module
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {modules.map((mod, modIdx) => (
                      <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: modIdx * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          {/* Module Header */}
                          <div
                            className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleModule(mod.id)}
                          >
                            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                            {expandedModules.has(mod.id) ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              {editingModuleId === mod.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    value={editingModuleTitle}
                                    onChange={(e) => setEditingModuleTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateModule(mod.id)}
                                    className="h-8 rounded-lg text-sm flex-1"
                                    autoFocus
                                  />
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleUpdateModule(mod.id)}
                                    disabled={actionLoading === `update-module-${mod.id}`}>
                                    {actionLoading === `update-module-${mod.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-600" />}
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingModuleId(null)}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-semibold truncate">{mod.title}</h4>
                                  <Badge variant="secondary" className="text-[10px] rounded-full shrink-0">
                                    {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {editingModuleId !== mod.id && (
                              <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="icon" variant="ghost" className="h-7 w-7"
                                  onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title) }}
                                >
                                  <Edit3 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteModule(mod.id)}
                                  disabled={actionLoading === `delete-module-${mod.id}`}
                                >
                                  {actionLoading === `delete-module-${mod.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Lessons */}
                          <AnimatePresence>
                            {expandedModules.has(mod.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <Separator />
                                <div className="p-2 space-y-1 bg-muted/10">
                                  {mod.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${lessonTypeColors[lesson.type] || 'bg-muted'}`}>
                                        {lessonTypeIcons[lesson.type] || <FileQuestion className="w-3.5 h-3.5" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        {editingLessonId === lesson.id ? (
                                          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-1.5">
                                              <Input
                                                value={editingLessonData.title}
                                                onChange={(e) => setEditingLessonData({ ...editingLessonData, title: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateLesson(lesson.id)}
                                                className="h-7 rounded-lg text-xs flex-1"
                                                autoFocus
                                              />
                                              <Select value={editingLessonData.type} onValueChange={(val) => setEditingLessonData({ ...editingLessonData, type: val })}>
                                                <SelectTrigger className="h-7 w-24 rounded-lg text-xs">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="QUIZ">Quiz</SelectItem>
                                                  <SelectItem value="VIDEO">Video</SelectItem>
                                                  <SelectItem value="READING">Reading</SelectItem>
                                                  <SelectItem value="MIXED">Mixed</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <div className="flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-yellow-500" />
                                                <Input type="number" value={editingLessonData.xpReward}
                                                  onChange={(e) => setEditingLessonData({ ...editingLessonData, xpReward: Number(e.target.value) })}
                                                  className="h-6 w-14 rounded text-xs" min={1} />
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Gem className="w-3 h-3 text-blue-500" />
                                                <Input type="number" value={editingLessonData.gemReward}
                                                  onChange={(e) => setEditingLessonData({ ...editingLessonData, gemReward: Number(e.target.value) })}
                                                  className="h-6 w-14 rounded text-xs" min={0} />
                                              </div>
                                              <div className="flex-1" />
                                              <Button size="icon" variant="ghost" className="h-6 w-6"
                                                onClick={() => handleUpdateLesson(lesson.id)}
                                                disabled={actionLoading === `update-lesson-${lesson.id}`}>
                                                {actionLoading === `update-lesson-${lesson.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 text-green-600" />}
                                              </Button>
                                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingLessonId(null)}>
                                                <X className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <h5 className="text-xs font-medium truncate">{lesson.title}</h5>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                              <Badge className={`text-[9px] rounded-full border-0 ${lessonTypeColors[lesson.type] || ''}`}>
                                                {lesson.type}
                                              </Badge>
                                              <span>{lesson._count.questions} questions</span>
                                              <span className="flex items-center gap-0.5">
                                                <Zap className="w-2.5 h-2.5" />{lesson.xpReward} XP
                                              </span>
                                              <span className="flex items-center gap-0.5">
                                                <Gem className="w-2.5 h-2.5" />{lesson.gemReward}
                                              </span>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                      {editingLessonId !== lesson.id && (
                                        <div className="flex items-center gap-0.5 shrink-0">
                                          <Button
                                            size="icon" variant="ghost" className="h-7 w-7"
                                            onClick={() => {
                                              setEditingLessonId(lesson.id)
                                              setEditingLessonData({ title: lesson.title, type: lesson.type, xpReward: lesson.xpReward, gemReward: lesson.gemReward })
                                            }}
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="icon" variant="ghost" className="h-7 w-7"
                                            onClick={() => fetchQuestions(lesson.id)}
                                            title="View questions"
                                          >
                                            <FileQuestion className="w-3 h-3" />
                                          </Button>
                                          {lesson.type === 'QUIZ' && (
                                            <Button
                                              size="icon" variant="ghost" className="h-7 w-7"
                                              onClick={() => {
                                                setBulkImportLessonId(lesson.id)
                                                setBulkImportOpen(true)
                                                setBulkJson('')
                                              }}
                                              title="Bulk import questions"
                                            >
                                              <Upload className="w-3 h-3" />
                                            </Button>
                                          )}
                                          <Button
                                            size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteLesson(lesson.id)}
                                            disabled={actionLoading === `delete-lesson-${lesson.id}`}
                                          >
                                            {actionLoading === `delete-lesson-${lesson.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  {/* Add Lesson button */}
                                  {addLessonToModule === mod.id ? (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                    >
                                      <div className="p-2 border rounded-lg bg-card space-y-2">
                                        <Label className="text-xs font-medium">New Lesson</Label>
                                        <Input
                                          placeholder="Lesson title..."
                                          value={newLesson.title}
                                          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                                          onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                                          className="h-8 rounded-lg text-xs"
                                          autoFocus
                                        />
                                        <div className="flex items-center gap-2">
                                          <Select value={newLesson.type} onValueChange={(val) => setNewLesson({ ...newLesson, type: val })}>
                                            <SelectTrigger className="h-8 w-24 rounded-lg text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="QUIZ">Quiz</SelectItem>
                                              <SelectItem value="VIDEO">Video</SelectItem>
                                              <SelectItem value="READING">Reading</SelectItem>
                                              <SelectItem value="MIXED">Mixed</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <div className="flex items-center gap-1">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            <Input type="number" value={newLesson.xpReward}
                                              onChange={(e) => setNewLesson({ ...newLesson, xpReward: Number(e.target.value) })}
                                              className="h-8 w-16 rounded-lg text-xs" min={1} />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Gem className="w-3 h-3 text-blue-500" />
                                            <Input type="number" value={newLesson.gemReward}
                                              onChange={(e) => setNewLesson({ ...newLesson, gemReward: Number(e.target.value) })}
                                              className="h-8 w-16 rounded-lg text-xs" min={0} />
                                          </div>
                                          <div className="flex-1" />
                                          <Button size="sm" onClick={handleAddLesson} disabled={!newLesson.title.trim() || addingLesson}
                                            className="h-8 gap-1 rounded-lg">
                                            {addingLesson ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                            Add
                                          </Button>
                                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddLessonToModule(null)}>
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full rounded-lg gap-1.5 text-muted-foreground h-8"
                                      onClick={() => { playClick(); setAddLessonToModule(mod.id) }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      Add Lesson
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </TabsContent>

        {/* TAB 3: Settings */}
        <TabsContent value="settings">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="text-sm font-medium">Current Status</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {existingCourse?.status === 'DRAFT' && 'Only visible to you. Submit for review when ready.'}
                      {existingCourse?.status === 'UNDER_REVIEW' && 'Your course is being reviewed by our team.'}
                      {existingCourse?.status === 'PUBLISHED' && 'Your course is live and visible to all students.'}
                      {existingCourse?.status === 'UNLISTED' && 'Your course is only accessible via direct link.'}
                    </p>
                  </div>
                  <Badge className={`rounded-full border-0 ${
                    existingCourse?.status === 'DRAFT' ? 'bg-gray-500/10 text-gray-600' :
                    existingCourse?.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-600' :
                    existingCourse?.status === 'UNDER_REVIEW' ? 'bg-yellow-500/10 text-yellow-600' :
                    'bg-orange-500/10 text-orange-600'
                  }`}>
                    {existingCourse?.status}
                  </Badge>
                </div>

                {existingCourse?.status === 'DRAFT' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave('submit')}
                      disabled={submitting}
                      className="flex-1 rounded-xl gap-1.5 bg-primary hover:bg-primary/90"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit for Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Content Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Modules</span>
                  <span className="text-sm font-medium">{modules.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Total Lessons</span>
                  <span className="text-sm font-medium">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm text-muted-foreground">Total Questions</span>
                  <span className="text-sm font-medium">{totalQuestions}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                {existingCourse?.status === 'DRAFT' ? (
                  <Button
                    variant="destructive"
                    className="w-full rounded-xl gap-1.5"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this course? This cannot be undone.')) {
                        fetch(`/api/teacher/courses/${courseId}`, { method: 'DELETE' })
                          .then(res => {
                            if (res.ok) navigateTo('teacher-dashboard')
                          })
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Course
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Only draft courses can be deleted. Contact support to remove published courses.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Questions Viewer Dialog */}
      <Dialog open={!!viewingLessonQuestions} onOpenChange={(open) => { if (!open) setViewingLessonQuestions(null) }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5" />
              Lesson Questions
            </DialogTitle>
            <DialogDescription>
              {questions.length} question{questions.length !== 1 ? 's' : ''} in this lesson
            </DialogDescription>
          </DialogHeader>
          {loadingQuestions ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-3xl mb-2">❓</div>
              <p className="text-sm text-muted-foreground">No questions yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Use the Upload button on the lesson to bulk import questions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q, idx) => {
                let options: string[] = []
                try {
                  if (q.options) options = JSON.parse(q.options)
                } catch { /* ignore */ }
                return (
                  <div key={q.id} className="p-3 rounded-lg border bg-muted/10 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-muted-foreground shrink-0 mt-0.5">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{q.question}</p>
                        <Badge className="text-[9px] rounded-full border-0 mt-1">{q.type}</Badge>
                        {options.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {options.map((opt, oi) => (
                              <p key={oi} className={`text-xs ${opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                {opt === q.correctAnswer ? '✓' : '○'} {opt}
                              </p>
                            ))}
                          </div>
                        )}
                        {options.length === 0 && (
                          <p className="text-xs text-green-600 font-medium mt-1">Answer: {q.correctAnswer}</p>
                        )}
                        {q.explanation && (
                          <p className="text-[11px] text-muted-foreground mt-1 italic">💡 {q.explanation}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{q.points}pts</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Bulk Import Questions
            </DialogTitle>
            <DialogDescription>
              Paste a JSON array of questions to import them all at once.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-700">
                <p className="font-medium mb-1">Required format:</p>
                <pre className="bg-yellow-500/5 rounded p-2 text-[10px] overflow-x-auto">{`[{
  "question": "What is 2+2?",
  "type": "MCQ",
  "options": ["3","4","5","6"],
  "correctAnswer": "4",
  "hint": "Basic math",
  "explanation": "2+2=4",
  "points": 10
}]`}</pre>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full rounded-lg gap-1.5" onClick={copyBulkTemplate}>
              <Copy className="w-3.5 h-3.5" />
              Copy Example Template
            </Button>
            <Textarea
              placeholder='Paste your JSON array here...'
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              className="rounded-xl min-h-[200px] font-mono text-xs"
            />
            <Button
              onClick={handleBulkImport}
              disabled={!bulkJson.trim() || importing}
              className="w-full rounded-xl gap-1.5"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Import Questions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
