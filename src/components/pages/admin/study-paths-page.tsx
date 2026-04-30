'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, GraduationCap, Code2, Globe, Briefcase, Database, BookOpen, X, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Course {
  id: string
  title: string
  description: string | null
  isPremium: boolean
  studyPathId: string | null
  category?: { id: string; name: string }
}

interface StudyPath {
  id: string
  title: string
  description: string | null
  type: string
  icon: string | null
  color: string | null
  order: number
  isActive: boolean
  createdAt: string
  courses: Course[]
}

const pathTypeConfig = {
  EXAM: { icon: GraduationCap, label: 'Exam Prep', gradient: 'from-blue-600 to-indigo-700' },
  SKILL: { icon: Code2, label: 'Tech Skills', gradient: 'from-purple-600 to-pink-600' },
  LANGUAGE: { icon: Globe, label: 'Language', gradient: 'from-green-600 to-emerald-700' },
  BUSINESS: { icon: Briefcase, label: 'Business', gradient: 'from-amber-600 to-orange-600' },
}

const pathColors = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Green', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Orange', value: '#ea580c' },
]

export function AdminStudyPathsPage() {
  const [studyPaths, setStudyPaths] = useState<StudyPath[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [pathDialog, setPathDialog] = useState(false)
  const [editingPath, setEditingPath] = useState<StudyPath | null>(null)
  const [pathForm, setPathForm] = useState({
    title: '',
    description: '',
    type: 'EXAM',
    icon: '🎓',
    color: '#2563eb',
    isActive: true,
  })

  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [courseSearch, setCourseSearch] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [seeding, setSeeding] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/study-paths')
      if (res.ok) {
        const data = await res.json()
        setStudyPaths(data.studyPaths || [])
      } else {
        toast.error('Failed to fetch study paths')
      }
    } catch {
      toast.error('Failed to fetch study paths')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredPaths = studyPaths.filter((path) =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (path.description && path.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const openPathDialog = async (path?: StudyPath) => {
    setEditingPath(path || null)
    setPathForm({
      title: path?.title || '',
      description: path?.description || '',
      type: path?.type || 'EXAM',
      icon: path?.icon || '🎓',
      color: path?.color || '#2563eb',
      isActive: path?.isActive ?? true,
    })
    
    // Set initially selected courses from the path
    setSelectedCourses(path?.courses.map(c => c.id) || [])
    
    // Fetch available courses (excluding those already assigned to other paths)
    setCoursesLoading(true)
    try {
      const excludeId = path?.id || ''
      const res = await fetch(`/api/admin/study-paths/courses?excludePathId=${excludeId}`)
      if (res.ok) {
        const data = await res.json()
        // Combine: courses from other paths + courses already in this path
        const otherPathCourses = data.courses || []
        const currentPathCourses = path?.courses || []
        setAvailableCourses([...currentPathCourses, ...otherPathCourses])
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    } finally {
      setCoursesLoading(false)
    }
    
    setPathDialog(true)
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const filteredCourses = availableCourses.filter(c => 
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(courseSearch.toLowerCase()))
  )

  const handleSavePath = async () => {
    if (!pathForm.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      const payload = {
        ...pathForm,
        courseIds: selectedCourses,
      }
      
      const res = editingPath
        ? await fetch(`/api/admin/study-paths/${editingPath.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/study-paths', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathForm),
          })

      if (res.ok) {
        toast.success(editingPath ? 'Study path updated' : 'Study path created')
        setPathDialog(false)
        fetchData()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save study path')
      }
    } catch {
      toast.error('Failed to save study path')
    }
  }

  const handleDeletePath = async () => {
    if (!deleteTarget) return

    try {
      const res = await fetch(`/api/admin/study-paths/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Study path deleted')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error('Failed to delete study path')
      }
    } catch {
      toast.error('Failed to delete study path')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Paths</h1>
          <p className="text-muted-foreground">Manage learning paths and curricula</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            setSeeding(true)
            try {
              const res = await fetch('/api/admin/study-paths/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seedDefault: true }),
              })
              if (res.ok) {
                const data = await res.json()
                toast.success(data.message || 'Seed completed')
                fetchData()
              } else {
                toast.error('Failed to seed')
              }
            } catch {
              toast.error('Failed to seed')
            } finally {
              setSeeding(false)
            }
          }} disabled={seeding}>
            <Database className="w-4 h-4 mr-2" />
            Seed Default Paths
          </Button>
          <Button onClick={() => openPathDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Path
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search study paths..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredPaths.map((path) => {
            const config = pathTypeConfig[path.type as keyof typeof pathTypeConfig] || pathTypeConfig.EXAM
            const Icon = config.icon

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`overflow-hidden ${!path.isActive ? 'opacity-60' : ''}`}>
                  <div
                    className={`h-2 bg-gradient-to-r ${config.gradient}`}
                  />
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{path.icon}</span>
                          <h3 className="font-semibold">{path.title}</h3>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPathDialog(path)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget({ id: path.id, name: path.title })}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {path.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {path.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{path.courses.length} course(s)</span>
                      <span>•</span>
                      <span>Order: {path.order}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={path.isActive}
                        onCheckedChange={async (checked) => {
                          const res = await fetch(`/api/admin/study-paths/${path.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isActive: checked }),
                          })
                          if (res.ok) {
                            setStudyPaths((prev) =>
                              prev.map((p) =>
                                p.id === path.id ? { ...p, isActive: checked } : p
                              )
                            )
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {path.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredPaths.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No Study Paths</h3>
            <p className="text-muted-foreground mb-4">
              Create your first study path to get started.
            </p>
            <Button onClick={() => openPathDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Path
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={pathDialog} onOpenChange={setPathDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPath ? 'Edit Study Path' : 'Create Study Path'}
            </DialogTitle>
            <DialogDescription>
              Define a learning path with courses
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={pathForm.title}
                onChange={(e) => setPathForm({ ...pathForm, title: e.target.value })}
                placeholder="e.g., WAEC Exam Prep"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={pathForm.description}
                onChange={(e) => setPathForm({ ...pathForm, description: e.target.value })}
                placeholder="Describe this learning path..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={pathForm.type}
                onValueChange={(value) => setPathForm({ ...pathForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(pathTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Input
                value={pathForm.icon}
                onChange={(e) => setPathForm({ ...pathForm, icon: e.target.value })}
                placeholder="e.g., 🎓"
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {pathColors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`w-8 h-8 rounded-full transition-transform ${
                      pathForm.color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setPathForm({ ...pathForm, color: c.value })}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={pathForm.isActive}
                onCheckedChange={(checked) => setPathForm({ ...pathForm, isActive: checked })}
              />
              <Label>Active</Label>
            </div>

            {/* Courses Section */}
            <div className="space-y-2">
              <Label>Courses</Label>
              <p className="text-xs text-muted-foreground">
                Select courses to include in this study path
              </p>
              
              {coursesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading courses...
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="mb-2"
                  />
                  
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {filteredCourses.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground text-center">
                        No courses available
                      </p>
                    ) : (
                      filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => toggleCourse(course.id)}
                          className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50 border-b last:border-b-0 ${
                            selectedCourses.includes(course.id) ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            selectedCourses.includes(course.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {selectedCourses.includes(course.id) && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{course.title}</p>
                            {course.category && (
                              <p className="text-xs text-muted-foreground">{course.category.name}</p>
                            )}
                          </div>
                          {course.isPremium && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                              Premium
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {selectedCourses.length} course(s) selected
                  </p>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPathDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePath}>
              {editingPath ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Study Path</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action can be undone by reactivating the path.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePath}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}