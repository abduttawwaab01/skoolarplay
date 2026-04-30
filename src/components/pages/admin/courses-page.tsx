'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronRight, Eye, GripVertical, Crown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Lesson {
  id: string; title: string; type: string; order: number; xpReward: number; gemReward: number; isActive: boolean;
  isLocked: boolean; lockReason: string | null; unlockThreshold: number; isPremium: boolean
  _count: { questions: number; videoContent: number; progress: number }
}

interface Module {
  id: string; title: string; order: number; isPremium: boolean
  lessons: Lesson[]
}

interface Course {
  id: string; title: string; description: string | null; categoryId: string
  icon: string | null; color: string | null; difficulty: string; order: number; isActive: boolean
  certificationEnabled: boolean; minimumLevel: string | null; isPremium: boolean
  category: { id: string; name: string }
  modules: Module[]
  _count: { enrollments: number }
}

interface Category {
  id: string; name: string
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  // Course Dialog
  const [courseDialog, setCourseDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseForm, setCourseForm] = useState({ title: '', description: '', categoryId: '', icon: '📚', color: '#008751', difficulty: 'BEGINNER', certificationEnabled: false, minimumLevel: 'B1', isPremium: false })

  // Module Dialog
  const [moduleDialog, setModuleDialog] = useState(false)
  const [moduleCourseId, setModuleCourseId] = useState('')
  const [moduleForm, setModuleForm] = useState({ title: '', isPremium: false })
  const [editingModule, setEditingModule] = useState<Module | null>(null)

  // Lesson Dialog
  const [lessonDialog, setLessonDialog] = useState(false)
  const [lessonModuleId, setLessonModuleId] = useState('')
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'QUIZ', xpReward: 10, gemReward: 1, isLocked: false, lockReason: '', unlockThreshold: 60, isPremium: false })
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'course' | 'module' | 'lesson'; id: string; name: string } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [coursesRes, catsRes] = await Promise.all([
        fetch('/api/admin/courses'),
        fetch('/api/categories'),
      ])
      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(Array.isArray(data.courses) ? data.courses : [])
      }
      if (catsRes.ok) {
        const data = await catsRes.json()
        setCategories(Array.isArray(data.categories) ? data.categories : (Array.isArray(data) ? data : []))
      }
    } catch {
      toast.error('Failed to fetch data')
      setCourses([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCourseDialog = (course?: Course) => {
    setEditingCourse(course || null)
    setCourseForm({
      title: course?.title || '',
      description: course?.description || '',
      categoryId: course?.categoryId || '',
      icon: course?.icon || '📚',
      color: course?.color || '#008751',
      difficulty: course?.difficulty || 'BEGINNER',
      certificationEnabled: course?.certificationEnabled || false,
      minimumLevel: course?.minimumLevel || 'B1',
      isPremium: (course as any)?.isPremium || false,
    })
    setCourseDialog(true)
  }

  const handleSaveCourse = async () => {
    if (!courseForm.title || !courseForm.categoryId) {
      toast.error('Title and category are required')
      return
    }
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'
      const method = editingCourse ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      })
      if (res.ok) {
        toast.success(editingCourse ? 'Course updated' : 'Course created')
        setCourseDialog(false)
        fetchData()
      } else {
        toast.error('Failed to save course')
      }
    } catch {
      toast.error('Failed to save course')
    }
  }

  const handleToggleCourse = async (course: Course) => {
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !course.isActive }),
      })
      if (res.ok) {
        toast.success(course.isActive ? 'Course deactivated' : 'Course activated')
        fetchData()
      }
    } catch {
      toast.error('Failed to toggle course')
    }
  }

  const openModuleDialog = (courseId: string, mod?: Module) => {
    setModuleCourseId(courseId)
    setEditingModule(mod || null)
    setModuleForm({ title: mod?.title || '', isPremium: (mod as any)?.isPremium || false })
    setModuleDialog(true)
  }

  const handleSaveModule = async () => {
    if (!moduleForm.title) { toast.error('Title is required'); return }
    try {
      if (editingModule) {
        const res = await fetch(`/api/admin/modules/${editingModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: moduleForm.title, isPremium: moduleForm.isPremium }),
        })
        if (res.ok) { toast.success('Module updated'); setModuleDialog(false); fetchData() }
      } else {
        const res = await fetch(`/api/admin/courses/${moduleCourseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: moduleForm.title, isPremium: moduleForm.isPremium }),
        })
        if (res.ok) { toast.success('Module created'); setModuleDialog(false); fetchData() }
      }
    } catch {
      toast.error('Failed to save module')
    }
  }

  const openLessonDialog = (moduleId: string, lesson?: Lesson) => {
    setLessonModuleId(moduleId)
    setEditingLesson(lesson || null)
    setLessonForm({
      title: lesson?.title || '',
      type: lesson?.type || 'QUIZ',
      xpReward: lesson?.xpReward || 10,
      gemReward: lesson?.gemReward || 1,
      isLocked: lesson?.isLocked || false,
      lockReason: lesson?.lockReason || '',
      unlockThreshold: lesson?.unlockThreshold || 60,
      isPremium: lesson?.isPremium || false,
    })
    setLessonDialog(true)
  }

  const handleSaveLesson = async () => {
    if (!lessonForm.title) { toast.error('Title is required'); return }
    try {
      if (editingLesson) {
        const res = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonForm),
        })
        if (res.ok) { toast.success('Lesson updated'); setLessonDialog(false); fetchData() }
      } else {
        const res = await fetch(`/api/admin/modules/${lessonModuleId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonForm),
        })
        if (res.ok) { toast.success('Lesson created'); setLessonDialog(false); fetchData() }
      }
    } catch {
      toast.error('Failed to save lesson')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const urls: Record<string, string> = {
        course: `/api/admin/courses/${deleteTarget.id}`,
        module: `/api/admin/modules/${deleteTarget.id}`,
        lesson: `/api/admin/lessons/${deleteTarget.id}`,
      }
      const res = await fetch(urls[deleteTarget.type], { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted`)
        setDeleteTarget(null)
        fetchData()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    INTERMEDIATE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const lessonTypeIcons: Record<string, string> = {
    QUIZ: '❓', VIDEO: '🎬', READING: '📖', MIXED: '🔄',
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground">{courses.length} total courses</p>
        </div>
        <Button onClick={() => openCourseDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="p-6 h-20" /></Card>
        ))}</div>
      ) : courses.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No courses yet. Add your first course!</Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="overflow-hidden">
                <div
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!course.isActive ? 'opacity-60' : ''}`}
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl shrink-0">{course.icon || '📚'}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{course.title}</h3>
                          <Badge variant="outline" className={difficultyColors[course.difficulty] || ''}>
                            {course.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.category.name}
                          </Badge>
                          {!course.isActive && <Badge variant="secondary">Inactive</Badge>}
                          {(course as any).isPremium && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs gap-1">
                              <Crown className="w-3 h-3" /> Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {course.modules.length} modules · {course._count.enrollments} enrolled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Switch
                        checked={course.isActive}
                        onCheckedChange={() => handleToggleCourse(course)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); openCourseDialog(course) }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget({ type: 'course', id: course.id, name: course.title })
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {expandedCourse === course.id ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Course Content */}
                <AnimatePresence>
                  {expandedCourse === course.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t bg-muted/30 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">Modules</h4>
                          <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openModuleDialog(course.id)}>
                            <Plus className="w-3 h-3" />
                            Add Module
                          </Button>
                        </div>

                        {course.modules.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">No modules yet</p>
                        ) : (
                          <div className="space-y-2">
                            {course.modules.map((mod) => (
                              <div key={mod.id} className="bg-background rounded-lg border">
                                <div
                                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 rounded-lg"
                                  onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium text-sm">{mod.title}</span>
                                    <Badge variant="secondary" className="text-xs">{mod.lessons.length} lessons</Badge>
                                    {(mod as any).isPremium && (
                                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] gap-0.5">
                                        <Crown className="w-2.5 h-2.5" /> Premium
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Switch
                                      checked={(mod as any).isActive ?? true}
                                      onCheckedChange={async (checked) => {
                                        const res = await fetch(`/api/admin/modules/${mod.id}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ isActive: checked }),
                                        })
                                        if (res.ok) fetchData()
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="scale-75"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={(e) => { e.stopPropagation(); openModuleDialog(course.id, mod) }}
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteTarget({ type: 'module', id: mod.id, name: mod.title })
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                    {expandedModule === mod.id ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </div>
                                </div>

                                <AnimatePresence>
                                  {expandedModule === mod.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="border-t px-3 py-2 space-y-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs text-muted-foreground">Lessons</span>
                                          <Button size="sm" variant="outline" className="gap-1 h-6 text-xs" onClick={() => openLessonDialog(mod.id)}>
                                            <Plus className="w-3 h-3" />
                                            Add
                                          </Button>
                                        </div>
                                        {mod.lessons.length === 0 ? (
                                          <p className="text-xs text-muted-foreground text-center py-2">No lessons</p>
                                        ) : (
                                          mod.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm">{lessonTypeIcons[lesson.type] || '❓'}</span>
                                                <span className="text-sm font-medium truncate">{lesson.title}</span>
                                                <span className="text-xs text-muted-foreground shrink-0">
                                                  +{lesson.xpReward}xp · +{lesson.gemReward}💎
                                                </span>
                                                {lesson.isLocked && <span className="text-[10px] text-red-500 font-medium">Locked</span>}
                                                {lesson.isPremium && (
                                                  <span className="text-[10px] text-amber-500 font-medium flex items-center gap-0.5">
                                                    <Crown className="w-2.5 h-2.5" /> Premium
                                                  </span>
                                                )}
                                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                                  {lesson._count.questions}q
                                                </Badge>
                                              </div>
                                              <div className="flex items-center gap-1 shrink-0">
                                                <Switch
                                                  checked={lesson.isActive}
                                                  onCheckedChange={async (checked) => {
                                                    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
                                                      method: 'PUT',
                                                      headers: { 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({ isActive: checked }),
                                                    })
                                                    if (res.ok) fetchData()
                                                  }}
                                                  className="scale-75"
                                                />
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openLessonDialog(mod.id, lesson)}>
                                                  <Pencil className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-destructive"
                                                  onClick={() => setDeleteTarget({ type: 'lesson', id: lesson.id, name: lesson.title })}
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
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

      {/* Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="Course title" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={courseForm.categoryId} onValueChange={(v) => setCourseForm({ ...courseForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={courseForm.difficulty} onValueChange={(v) => setCourseForm({ ...courseForm, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input value={courseForm.icon} onChange={(e) => setCourseForm({ ...courseForm, icon: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={courseForm.color} onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })} className="w-12 h-9 p-1" />
                  <Input value={courseForm.color} onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 justify-center mt-2">
                <div className="flex items-center gap-2">
                  <Switch checked={courseForm.certificationEnabled} onCheckedChange={(c) => setCourseForm({...courseForm, certificationEnabled: c})} />
                  <Label>Enable Certification</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Final Level</Label>
                <Select value={courseForm.minimumLevel} onValueChange={(v) => setCourseForm({ ...courseForm, minimumLevel: v })} disabled={!courseForm.certificationEnabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C2">C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Switch checked={courseForm.isPremium} onCheckedChange={(c) => setCourseForm({...courseForm, isPremium: c})} />
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <Label className="font-medium">Premium Course (SkoolarPlay+)</Label>
              </div>
              <span className="text-xs text-muted-foreground ml-2">Only premium users can access</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCourse}>{editingCourse ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Edit Module' : 'New Module'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="Module title" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Switch checked={moduleForm.isPremium} onCheckedChange={(c) => setModuleForm({ ...moduleForm, isPremium: c })} />
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <Label className="font-medium">Premium Module</Label>
              </div>
              <span className="text-xs text-muted-foreground ml-2">Only premium users can access</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveModule}>{editingModule ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'New Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="READING">Reading</SelectItem>
                  <SelectItem value="MIXED">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" value={lessonForm.xpReward} onChange={(e) => setLessonForm({ ...lessonForm, xpReward: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Gem Reward</Label>
                <Input type="number" value={lessonForm.gemReward} onChange={(e) => setLessonForm({ ...lessonForm, gemReward: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch checked={lessonForm.isLocked} onCheckedChange={(c) => setLessonForm({...lessonForm, isLocked: c})} />
                <Label>Lock based on previous module/lesson</Label>
              </div>
              {lessonForm.isLocked && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Lock Reason Message</Label>
                    <Input value={lessonForm.lockReason} onChange={(e) => setLessonForm({ ...lessonForm, lockReason: e.target.value })} placeholder="Pass previous lesson" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unlock Threshold (%)</Label>
                    <Input type="number" value={lessonForm.unlockThreshold} onChange={(e) => setLessonForm({ ...lessonForm, unlockThreshold: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <Switch checked={lessonForm.isPremium} onCheckedChange={(c) => setLessonForm({ ...lessonForm, isPremium: c })} />
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <Label className="font-medium">Premium Lesson</Label>
              </div>
              <span className="text-xs text-muted-foreground ml-2">Only premium users can access</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveLesson}>{editingLesson ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete {deleteTarget?.type}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              {deleteTarget?.type === 'course' && ' All modules, lessons, questions, and progress data will be deleted.'}
              {deleteTarget?.type === 'module' && ' All lessons, questions, and progress data will be deleted.'}
              {deleteTarget?.type === 'lesson' && ' All questions and progress data will be deleted.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
