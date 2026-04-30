'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, ExternalLink, PlusCircle, BookOpen, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

interface Video {
  id: string
  lessonId: string
  title: string
  url: string
  duration: number
  order: number
  createdAt: string
  lesson: {
    id: string
    title: string
    module: { id: string; title: string; course: { id: string; title: string } }
  }
}

function getEmbedUrl(url: string): string {
  // Convert YouTube URLs to embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  return url
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [modules, setModules] = useState<{ id: string; title: string }[]>([])
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([])

  const [filterCourse, setFilterCourse] = useState('')
  const [filterModule, setFilterModule] = useState('')
  const [filterLesson, setFilterLesson] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [deleteVideo, setDeleteVideo] = useState<Video | null>(null)
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null)

  const [formLessonId, setFormLessonId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formDuration, setFormDuration] = useState('')

  // Quick create state
  const [quickCreateDialog, setQuickCreateDialog] = useState<'course' | 'module' | 'lesson' | null>(null)
  const [quickCourseForm, setQuickCourseForm] = useState({ title: '', categoryId: '', difficulty: 'BEGINNER' })
  const [quickModuleForm, setQuickModuleForm] = useState({ title: '', courseId: '' })
  const [quickLessonForm, setQuickLessonForm] = useState({ title: '', moduleId: '' })
  const [quickCreateExpanded, setQuickCreateExpanded] = useState(false)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCourse) params.set('courseId', filterCourse)
      if (filterModule) params.set('moduleId', filterModule)
      if (filterLesson) params.set('lessonId', filterLesson)

      const res = await fetch(`/api/admin/videos?${params}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos)
      }
    } catch {
      toast.error('Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }, [filterCourse, filterModule, filterLesson])

  useEffect(() => {
    fetch('/api/admin/courses').then(res => res.json()).then(data => {
      setCourses((data.courses || []).map((c: any) => ({ id: c.id, title: c.title })))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (filterCourse) {
      fetch(`/api/admin/courses/${filterCourse}`).then(res => res.json()).then(data => {
        setModules((data.course?.modules || []).map((m: any) => ({ id: m.id, title: m.title })))
        setFilterModule('')
        setFilterLesson('')
        setLessons([])
      }).catch(() => {})
    } else {
      setModules([])
      setFilterModule('')
      setFilterLesson('')
      setLessons([])
    }
  }, [filterCourse])

  useEffect(() => {
    if (filterModule) {
      fetch(`/api/admin/modules/${filterModule}`).then(res => res.json()).then(data => {
        setLessons((data.module?.lessons || []).map((l: any) => ({ id: l.id, title: l.title })))
        setFilterLesson('')
      }).catch(() => {})
    } else {
      setLessons([])
      setFilterLesson('')
    }
  }, [filterModule])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  const openNewVideo = () => {
    setEditingVideo(null)
    setFormLessonId(filterLesson || '')
    setFormTitle('')
    setFormUrl('')
    setFormDuration('')
    setDialogOpen(true)
  }

  const openEditVideo = (v: Video) => {
    setEditingVideo(v)
    setFormLessonId(v.lessonId)
    setFormTitle(v.title)
    setFormUrl(v.url)
    setFormDuration(formatDuration(v.duration))
    setDialogOpen(true)
  }

  const parseDuration = (str: string): number => {
    const parts = str.split(':')
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]) || 0
    return parseInt(str) || 0
  }

  const handleSave = async () => {
    if (!formLessonId || !formTitle || !formUrl) {
      toast.error('Lesson, title, and URL are required')
      return
    }

    try {
      const payload = {
        lessonId: formLessonId,
        title: formTitle,
        url: formUrl,
        duration: parseDuration(formDuration),
      }

      const url = editingVideo ? `/api/admin/videos/${editingVideo.id}` : '/api/admin/videos'
      const method = editingVideo ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editingVideo ? 'Video updated' : 'Video created')
        setDialogOpen(false)
        fetchVideos()
      } else {
        toast.error('Failed to save video')
      }
    } catch {
      toast.error('Failed to save video')
    }
  }

  const handleDelete = async () => {
    if (!deleteVideo) return
    try {
      const res = await fetch(`/api/admin/videos/${deleteVideo.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Video deleted')
        setDeleteVideo(null)
        fetchVideos()
      }
    } catch {
      toast.error('Failed to delete video')
    }
  }

  return (
    <div className="space-y-4">
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

      {/* Quick Create Section - Only show when adding video to VIDEO lesson */}
      <Card>
        <CardHeader className="pb-3">
          <button onClick={() => setQuickCreateExpanded(!quickCreateExpanded)} className="flex items-center justify-between w-full text-left">
            <CardTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-green-500" />
              Quick Create (For Video Lessons)
            </CardTitle>
            {quickCreateExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {quickCreateExpanded && (
          <CardContent className="pt-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              Videos can only be added to VIDEO type lessons. Create a course → module → VIDEO lesson, then add videos.
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
                New VIDEO Lesson
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{videos.length} videos</p>
        <Button onClick={openNewVideo} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Video
        </Button>
      </div>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Lesson</TableHead>
                  <TableHead className="hidden lg:table-cell">URL</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="hidden sm:table-cell">Added</TableHead>
                  <TableHead className="w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><div className="h-10 bg-muted animate-pulse rounded" /></TableCell></TableRow>
                  ))
                ) : videos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No videos found</TableCell>
                  </TableRow>
                ) : (
                  videos.map((v, i) => (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">🎬 {v.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{v.lesson.title}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate block max-w-[200px]">
                          {v.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">{formatDuration(v.duration)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewVideo(v)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditVideo(v)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteVideo(v)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'New Video'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select value={formLessonId} onValueChange={setFormLessonId}>
                <SelectTrigger><SelectValue placeholder="Select lesson" /></SelectTrigger>
                <SelectContent>
                  {(filterLesson ? [lessons.find(l => l.id === filterLesson)].filter((l): l is { id: string; title: string } => Boolean(l)) : lessons).map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Video title" />
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="YouTube or direct URL" />
            </div>
            <div className="space-y-2">
              <Label>Duration (mm:ss)</Label>
              <Input value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="5:30" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingVideo ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewVideo} onOpenChange={() => setPreviewVideo(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewVideo?.title}</DialogTitle>
            <DialogDescription>{previewVideo?.lesson.title}</DialogDescription>
          </DialogHeader>
          {previewVideo && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getEmbedUrl(previewVideo.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteVideo} onOpenChange={() => setDeleteVideo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Video</DialogTitle>
            <DialogDescription>Are you sure you want to delete &quot;{deleteVideo?.title}&quot;?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVideo(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Create Course Dialog */}
      <Dialog open={quickCreateDialog === 'course'} onOpenChange={(open) => !open && setQuickCreateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Course</DialogTitle>
            <DialogDescription>Create a new course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input value={quickCourseForm.title} onChange={(e) => setQuickCourseForm({ ...quickCourseForm, title: e.target.value })} placeholder="e.g., Physics for WAEC" />
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
              <Input value={quickModuleForm.title} onChange={(e) => setQuickModuleForm({ ...quickModuleForm, title: e.target.value })} placeholder="e.g., Chapter 1: Motion" />
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

      {/* Quick Create Lesson Dialog - For VIDEO lessons */}
      <Dialog open={quickCreateDialog === 'lesson'} onOpenChange={(open) => !open && setQuickCreateDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Create Video Lesson</DialogTitle>
            <DialogDescription>Create a VIDEO type lesson for video content</DialogDescription>
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
              <Input value={quickLessonForm.title} onChange={(e) => setQuickLessonForm({ ...quickLessonForm, title: e.target.value })} placeholder="e.g., Introduction to Motion" />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">This lesson will be set to VIDEO type so you can add video content.</p>
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
                body: JSON.stringify({ title: quickLessonForm.title, type: 'VIDEO' }),
              })
              if (res.ok) {
                toast.success('Video lesson created! Now add videos to it.')
                setQuickCreateDialog(null)
                setQuickLessonForm({ title: '', moduleId: '' })
                if (filterModule) {
                  fetch(`/api/admin/modules/${filterModule}`).then(r => r.json()).then(data => {
                    setLessons((data.module?.lessons || []).map((l: any) => ({ id: l.id, title: l.title })))
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
