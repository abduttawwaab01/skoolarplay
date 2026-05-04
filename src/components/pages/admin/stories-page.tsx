'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Eye, BookOpen, FileText, ChevronDown, ChevronUp,
  Volume2, VolumeX, Languages, Clock, Award, Sparkles, CheckCircle2,
  XCircle, Bookmark, Settings2, Copy, Loader2, ArrowLeft, Save,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface StoryChapter {
  title: string
  narrative: string
  questions?: {
    text: string
    options: string[]
    correctIndex: number
    explanation?: string
  }[]
  vocabulary?: {
    word: string
    translation: string
    context?: string
  }[]
}

interface StoryLesson {
  id: string
  lessonId: string
  title: string
  narrative: string
  character: string | null
  setting: string | null
  mood: string | null
  choices: string | null
  languageCode: string | null
  readingLevel: string
  estimatedReadingTime: number
  ttsVoice: string | null
  ttsSpeed: number
  ttsLanguage: string | null
  chapters: string | null
  hasBranching: boolean
  branchingPaths: string | null
  totalQuestions: number
  passingScore: number
  xpReward: number
  gemReward: number
  lesson: {
    id: string
    title: string
    type: string
    isActive: boolean
    module: { id: string; title: string; course: { id: string; title: string } }
  } | null
}

const MOODS = ['ADVENTURE', 'MYSTERY', 'COMEDY', 'DRAMA', 'ROMANCE', 'FANTASY', 'SCI_FI', 'EDUCATIONAL']
const MOOD_EMOJIS: Record<string, string> = {
  ADVENTURE: '⚔️', MYSTERY: '🔍', COMEDY: '😂', DRAMA: '🎭',
  ROMANCE: '💕', FANTASY: '🧙', SCI_FI: '🚀', EDUCATIONAL: '📚',
}
const READING_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'yo', name: 'Yorùbá' },
  { code: 'ig', name: 'Igbo' },
  { code: 'ha', name: 'Hausa' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
]
const TTS_VOICES = ['jam', 'tongtong', 'chuichui', 'xiaochen', 'kazi', 'douji', 'luodo']

export function AdminStoriesPage() {
  const [stories, setStories] = useState<StoryLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [modules, setModules] = useState<{ id: string; title: string; courseId: string }[]>([])
  const [lessons, setLessons] = useState<{ id: string; title: string; moduleId: string }[]>([])

  const [filterCourse, setFilterCourse] = useState('')
  const [filterReadingLevel, setFilterReadingLevel] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStory, setEditingStory] = useState<StoryLesson | null>(null)
  const [deleteStory, setDeleteStory] = useState<StoryLesson | null>(null)
  const [previewStory, setPreviewStory] = useState<StoryLesson | null>(null)
  const [activeTab, setActiveTab] = useState('details')

  const [formLessonId, setFormLessonId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formCharacter, setFormCharacter] = useState('')
  const [formSetting, setFormSetting] = useState('')
  const [formMood, setFormMood] = useState('ADVENTURE')
  const [formLanguageCode, setFormLanguageCode] = useState('en')
  const [formReadingLevel, setFormReadingLevel] = useState('BEGINNER')
  const [formEstimatedReadingTime, setFormEstimatedReadingTime] = useState(5)
  const [formTtsVoice, setFormTtsVoice] = useState('jam')
  const [formTtsSpeed, setFormTtsSpeed] = useState(1.0)
  const [formTtsLanguage, setFormTtsLanguage] = useState('')
  const [formPassingScore, setFormPassingScore] = useState(60)
  const [formXpReward, setFormXpReward] = useState(25)
  const [formGemReward, setFormGemReward] = useState(5)
  const [formChapters, setFormChapters] = useState<StoryChapter[]>([])

  const fetchStories = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCourse) params.set('courseId', filterCourse)
      if (filterReadingLevel) params.set('readingLevel', filterReadingLevel)

      const res = await fetch(`/api/admin/stories?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setStories(data.stories || [])
    } catch {
      toast.error('Failed to load stories')
    } finally {
      setLoading(false)
    }
  }, [filterCourse, filterReadingLevel])

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setCourses(data.courses || [])
    } catch {
      console.error('Failed to fetch courses')
    }
  }, [])

  const openCreate = () => {
    setEditingStory(null)
    setFormLessonId('')
    setFormTitle('')
    setFormCharacter('')
    setFormSetting('')
    setFormMood('ADVENTURE')
    setFormLanguageCode('en')
    setFormReadingLevel('BEGINNER')
    setFormEstimatedReadingTime(5)
    setFormTtsVoice('jam')
    setFormTtsSpeed(1.0)
    setFormTtsLanguage('')
    setFormPassingScore(60)
    setFormXpReward(25)
    setFormGemReward(5)
    setFormChapters([{ title: '', narrative: '', questions: [], vocabulary: [] }])
    setActiveTab('details')
    setDialogOpen(true)
  }

  const openEdit = (story: StoryLesson) => {
    setEditingStory(story)
    setFormLessonId(story.lessonId)
    setFormTitle(story.title)
    setFormCharacter(story.character || '')
    setFormSetting(story.setting || '')
    setFormMood(story.mood || 'ADVENTURE')
    setFormLanguageCode(story.languageCode || 'en')
    setFormReadingLevel(story.readingLevel)
    setFormEstimatedReadingTime(story.estimatedReadingTime)
    setFormTtsVoice(story.ttsVoice || 'jam')
    setFormTtsSpeed(story.ttsSpeed)
    setFormTtsLanguage(story.ttsLanguage || '')
    setFormPassingScore(story.passingScore)
    setFormXpReward(story.xpReward)
    setFormGemReward(story.gemReward)
    try {
      setFormChapters(story.chapters ? JSON.parse(story.chapters) : [{ title: '', narrative: '', questions: [], vocabulary: [] }])
    } catch {
      setFormChapters([{ title: '', narrative: '', questions: [], vocabulary: [] }])
    }
    setActiveTab('details')
    setDialogOpen(true)
  }

  const saveStory = async () => {
    if (!formTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formChapters.length || !formChapters[0]?.narrative.trim()) {
      toast.error('At least one chapter with narrative is required')
      return
    }

    const validChapters = formChapters.filter(ch => ch.narrative.trim())
    if (validChapters.length === 0) {
      toast.error('At least one chapter must have content')
      return
    }

    const totalQuestions = validChapters.reduce((sum, ch) => sum + (ch.questions?.length || 0), 0)

    const storyData = {
      lessonId: formLessonId || editingStory?.lessonId,
      title: formTitle.trim(),
      narrative: validChapters.map(ch => ch.narrative).join('\n\n'),
      character: formCharacter.trim() || null,
      setting: formSetting.trim() || null,
      mood: formMood,
      languageCode: formLanguageCode,
      readingLevel: formReadingLevel,
      estimatedReadingTime: formEstimatedReadingTime,
      ttsVoice: formTtsVoice,
      ttsSpeed: formTtsSpeed,
      ttsLanguage: formTtsLanguage.trim() || null,
      chapters: JSON.stringify(validChapters),
      hasBranching: false,
      branchingPaths: null,
      totalQuestions,
      passingScore: formPassingScore,
      xpReward: formXpReward,
      gemReward: formGemReward,
    }

    try {
      const url = editingStory ? `/api/admin/stories/${editingStory.id}` : '/api/admin/stories'
      const res = await fetch(url, {
        method: editingStory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      toast.success(editingStory ? 'Story updated successfully' : 'Story created successfully')
      setDialogOpen(false)
      fetchStories()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save story')
    }
  }

  const deleteStoryAction = async () => {
    if (!deleteStory) return
    try {
      const res = await fetch(`/api/admin/stories/${deleteStory.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Story deleted')
      setDeleteStory(null)
      fetchStories()
    } catch {
      toast.error('Failed to delete story')
    }
  }

  const toggleStoryActive = async (story: StoryLesson) => {
    try {
      const res = await fetch(`/api/admin/stories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !story.lesson?.isActive }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(`Story ${story.lesson?.isActive ? 'disabled' : 'enabled'}`)
      fetchStories()
    } catch {
      toast.error('Failed to update story status')
    }
  }

  const addChapter = () => {
    setFormChapters([...formChapters, { title: '', narrative: '', questions: [], vocabulary: [] }])
  }

  const removeChapter = (idx: number) => {
    if (formChapters.length <= 1) {
      toast.error('At least one chapter is required')
      return
    }
    setFormChapters(formChapters.filter((_, i) => i !== idx))
  }

  const updateChapter = (idx: number, field: keyof StoryChapter, value: any) => {
    const updated = [...formChapters]
    updated[idx] = { ...updated[idx], [field]: value }
    setFormChapters(updated)
  }

  const addQuestion = (chapterIdx: number) => {
    const updated = [...formChapters]
    if (!updated[chapterIdx].questions) updated[chapterIdx].questions = []
    updated[chapterIdx].questions!.push({ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })
    setFormChapters(updated)
  }

  const removeQuestion = (chapterIdx: number, qIdx: number) => {
    const updated = [...formChapters]
    updated[chapterIdx].questions = updated[chapterIdx].questions!.filter((_, i) => i !== qIdx)
    setFormChapters(updated)
  }

  const updateQuestion = (chapterIdx: number, qIdx: number, field: string, value: any) => {
    const updated = [...formChapters]
    const questions = updated[chapterIdx].questions!
    questions[qIdx] = { ...questions[qIdx], [field]: value }
    setFormChapters(updated)
  }

  const updateOption = (chapterIdx: number, qIdx: number, optIdx: number, value: string) => {
    const updated = [...formChapters]
    const questions = updated[chapterIdx].questions!
    const options = [...questions[qIdx].options]
    options[optIdx] = value
    questions[qIdx] = { ...questions[qIdx], options }
    setFormChapters(updated)
  }

  const addVocab = (chapterIdx: number) => {
    const updated = [...formChapters]
    if (!updated[chapterIdx].vocabulary) updated[chapterIdx].vocabulary = []
    updated[chapterIdx].vocabulary!.push({ word: '', translation: '', context: '' })
    setFormChapters(updated)
  }

  const removeVocab = (chapterIdx: number, vIdx: number) => {
    const updated = [...formChapters]
    updated[chapterIdx].vocabulary = updated[chapterIdx].vocabulary!.filter((_, i) => i !== vIdx)
    setFormChapters(updated)
  }

  const updateVocab = (chapterIdx: number, vIdx: number, field: string, value: string) => {
    const updated = [...formChapters]
    const vocab = updated[chapterIdx].vocabulary!
    vocab[vIdx] = { ...vocab[vIdx], [field]: value }
    setFormChapters(updated)
  }

  useEffect(() => {
    fetchStories()
    fetchCourses()
  }, [fetchStories, fetchCourses])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Story Mode</h1>
          <p className="text-muted-foreground">Manage interactive reading stories with TTS</p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New Story
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Label>Filter by Course</Label>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger><SelectValue placeholder="All courses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All courses</SelectItem>
              {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Label>Filter by Reading Level</Label>
          <Select value={filterReadingLevel} onValueChange={setFilterReadingLevel}>
            <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
              {READING_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stories Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first interactive story</p>
            <Button onClick={openCreate} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Create Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Story</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Chapters</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>XP / Gems</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map(story => (
                <TableRow key={story.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{MOOD_EMOJIS[story.mood || 'ADVENTURE'] || '📖'}</span>
                      <div>
                        <p className="font-medium">{story.title}</p>
                        {story.character && <p className="text-xs text-muted-foreground">{story.character}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {story.readingLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs uppercase">{story.languageCode || 'en'}</span>
                  </TableCell>
                  <TableCell>{story.chapters ? JSON.parse(story.chapters).length : 1}</TableCell>
                  <TableCell>{story.totalQuestions}</TableCell>
                  <TableCell>
                    <span className="text-xs">{story.xpReward} XP / {story.gemReward} 💎</span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    <span className="text-xs text-muted-foreground">
                      {story.lesson?.module?.course?.title || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={story.lesson?.isActive !== false}
                      onCheckedChange={() => toggleStoryActive(story)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewStory(story)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(story)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteStory(story)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {editingStory ? 'Edit Story' : 'Create New Story'}
            </DialogTitle>
            <DialogDescription>
              Build interactive stories with chapters, questions, and vocabulary
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="chapters">Chapters ({formChapters.length})</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="details" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Story Title *</Label>
                    <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g. The Lost Phone" />
                  </div>
                  <div>
                    <Label>Character</Label>
                    <Input value={formCharacter} onChange={e => setFormCharacter(e.target.value)} placeholder="e.g. Adaeze" />
                  </div>
                  <div>
                    <Label>Setting</Label>
                    <Input value={formSetting} onChange={e => setFormSetting(e.target.value)} placeholder="e.g. Lagos, Nigeria" />
                  </div>
                  <div>
                    <Label>Mood</Label>
                    <Select value={formMood} onValueChange={setFormMood}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MOODS.map(m => <SelectItem key={m} value={m}>{MOOD_EMOJIS[m]} {m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select value={formLanguageCode} onValueChange={setFormLanguageCode}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reading Level</Label>
                    <Select value={formReadingLevel} onValueChange={setFormReadingLevel}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {READING_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Est. Reading Time (min)</Label>
                    <Input type="number" value={formEstimatedReadingTime} onChange={e => setFormEstimatedReadingTime(parseInt(e.target.value) || 5)} min={1} />
                  </div>
                  <Separator className="col-span-2" />
                  <div>
                    <Label>TTS Voice</Label>
                    <Select value={formTtsVoice} onValueChange={setFormTtsVoice}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TTS_VOICES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>TTS Speed: {formTtsSpeed.toFixed(1)}x</Label>
                    <Input type="range" min="0.5" max="2.0" step="0.1" value={formTtsSpeed} onChange={e => setFormTtsSpeed(parseFloat(e.target.value))} className="mt-2" />
                  </div>
                  <div>
                    <Label>TTS Language Override</Label>
                    <Select value={formTtsLanguage} onValueChange={setFormTtsLanguage}>
                      <SelectTrigger><SelectValue placeholder="Same as story language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Use story language</SelectItem>
                        {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="col-span-2" />
                  <div>
                    <Label>Passing Score (%)</Label>
                    <Input type="number" value={formPassingScore} onChange={e => setFormPassingScore(parseInt(e.target.value) || 60)} min={0} max={100} />
                  </div>
                  <div>
                    <Label>XP Reward</Label>
                    <Input type="number" value={formXpReward} onChange={e => setFormXpReward(parseInt(e.target.value) || 25)} min={0} />
                  </div>
                  <div>
                    <Label>Gem Reward</Label>
                    <Input type="number" value={formGemReward} onChange={e => setFormGemReward(parseInt(e.target.value) || 5)} min={0} />
                  </div>
                  <div>
                    <Label>Link to Lesson (optional)</Label>
                    <Select value={formLessonId} onValueChange={setFormLessonId}>
                      <SelectTrigger><SelectValue placeholder="Select a lesson or create new" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Auto-create lesson</SelectItem>
                        {lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chapters" className="mt-0 space-y-6">
                {formChapters.map((chapter, idx) => (
                  <Card key={idx} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Chapter {idx + 1}
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => removeChapter(idx)} className="h-7 w-7 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        value={chapter.title}
                        onChange={e => updateChapter(idx, 'title', e.target.value)}
                        placeholder="Chapter title"
                        className="mt-2"
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Narrative *</Label>
                        <Textarea
                          value={chapter.narrative}
                          onChange={e => updateChapter(idx, 'narrative', e.target.value)}
                          placeholder="Write the story content..."
                          rows={8}
                          className="font-serif"
                        />
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Comprehension Questions ({chapter.questions?.length || 0})
                          </Label>
                          <Button variant="outline" size="sm" onClick={() => addQuestion(idx)} className="h-7">
                            <Plus className="w-3 h-3 mr-1" /> Add Question
                          </Button>
                        </div>
                        {chapter.questions?.map((q, qIdx) => (
                          <Card key={qIdx} className="p-3 space-y-2 bg-muted/30">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Question {qIdx + 1}</span>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeQuestion(idx, qIdx)}>
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </div>
                            <Input
                              value={q.text}
                              onChange={e => updateQuestion(idx, qIdx, 'text', e.target.value)}
                              placeholder="Question text"
                            />
                            <div className="space-y-1">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${oIdx === q.correctIndex ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <Input
                                    value={opt}
                                    onChange={e => updateOption(idx, qIdx, oIdx, e.target.value)}
                                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                    className="flex-1"
                                  />
                                  {oIdx === q.correctIndex && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                </div>
                              ))}
                              <Label className="text-xs text-muted-foreground">Click option letter to set correct answer</Label>
                              <div className="flex gap-1">
                                {q.options.map((_, oIdx) => (
                                  <Button
                                    key={oIdx}
                                    variant="outline"
                                    size="sm"
                                    className={`h-6 px-2 text-xs ${oIdx === q.correctIndex ? 'bg-green-500 text-white border-green-500' : ''}`}
                                    onClick={() => updateQuestion(idx, qIdx, 'correctIndex', oIdx)}
                                  >
                                    {String.fromCharCode(65 + oIdx)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <Input
                              value={q.explanation || ''}
                              onChange={e => updateQuestion(idx, qIdx, 'explanation', e.target.value)}
                              placeholder="Explanation (shown after answering)"
                            />
                          </Card>
                        ))}
                      </div>

                      <Separator />

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="flex items-center gap-2">
                            <Bookmark className="w-4 h-4" />
                            Vocabulary ({chapter.vocabulary?.length || 0})
                          </Label>
                          <Button variant="outline" size="sm" onClick={() => addVocab(idx)} className="h-7">
                            <Plus className="w-3 h-3 mr-1" /> Add Word
                          </Button>
                        </div>
                        {chapter.vocabulary?.map((v, vIdx) => (
                          <div key={vIdx} className="flex items-center gap-2 mb-2">
                            <Input
                              value={v.word}
                              onChange={e => updateVocab(idx, vIdx, 'word', e.target.value)}
                              placeholder="Word"
                              className="flex-1"
                            />
                            <Input
                              value={v.translation}
                              onChange={e => updateVocab(idx, vIdx, 'translation', e.target.value)}
                              placeholder="Translation"
                              className="flex-1"
                            />
                            <Input
                              value={v.context || ''}
                              onChange={e => updateVocab(idx, vIdx, 'context', e.target.value)}
                              placeholder="Context (optional)"
                              className="flex-1"
                            />
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removeVocab(idx, vIdx)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" onClick={addChapter} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Chapter
                </Button>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        {MOOD_EMOJIS[formMood] || '📖'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{formTitle || 'Untitled Story'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {formCharacter && <span>{formCharacter}</span>}
                          {formSetting && <span>• {formSetting}</span>}
                        </div>
                      </div>
                      <Badge className="ml-auto">{formReadingLevel}</Badge>
                    </div>
                    <Separator />
                    {formChapters.map((ch, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">
                          Chapter {idx + 1}: {ch.title || 'Untitled'}
                        </h4>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">
                          {ch.narrative || '(No content)'}
                        </p>
                        {ch.questions && ch.questions.length > 0 && (
                          <div className="pl-4 border-l-2 border-muted">
                            <p className="text-xs text-muted-foreground mb-1">{ch.questions.length} question(s)</p>
                            {ch.questions.slice(0, 2).map((q, qIdx) => (
                              <div key={qIdx} className="text-xs mb-1">
                                <span className="font-medium">Q: {q.text || '(empty)'}</span>
                                {q.options[q.correctIndex] && (
                                  <span className="text-green-600 ml-2">✓ {q.options[q.correctIndex]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {ch.vocabulary && ch.vocabulary.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {ch.vocabulary.slice(0, 5).map((v, vIdx) => (
                              <Badge key={vIdx} variant="outline" className="text-xs">
                                {v.word}: {v.translation}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <Separator />
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm">
                      <span>{formChapters.length} chapters</span>
                      <span>{formChapters.reduce((s, c) => s + (c.questions?.length || 0), 0)} questions</span>
                      <span>{formXpReward} XP / {formGemReward} 💎</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveStory} className="rounded-full">
              <Save className="w-4 h-4 mr-2" />
              {editingStory ? 'Update Story' : 'Create Story'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewStory} onOpenChange={() => setPreviewStory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Story Preview: {previewStory?.title}
            </DialogTitle>
          </DialogHeader>
          {previewStory && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">{previewStory.readingLevel}</Badge>
                <Badge variant="outline">{previewStory.languageCode?.toUpperCase()}</Badge>
                <Badge variant="outline">{MOOD_EMOJIS[previewStory.mood || 'ADVENTURE']} {previewStory.mood}</Badge>
                <span className="text-muted-foreground">{previewStory.estimatedReadingTime} min read</span>
              </div>
              {previewStory.character && (
                <p className="text-sm"><strong>Character:</strong> {previewStory.character}</p>
              )}
              {previewStory.setting && (
                <p className="text-sm"><strong>Setting:</strong> {previewStory.setting}</p>
              )}
              <Separator />
              {(() => {
                try {
                  const chapters: StoryChapter[] = previewStory.chapters ? JSON.parse(previewStory.chapters) : []
                  return chapters.map((ch, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold">{ch.title || `Chapter ${idx + 1}`}</h4>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{ch.narrative}</p>
                      {ch.vocabulary && ch.vocabulary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ch.vocabulary.map((v, vIdx) => (
                            <Badge key={vIdx} variant="secondary" className="text-xs">
                              {v.word}: {v.translation}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {ch.questions && ch.questions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-semibold">Questions:</p>
                          {ch.questions.map((q, qIdx) => (
                            <div key={qIdx} className="pl-3 border-l-2 border-muted">
                              <p className="text-sm font-medium">{q.text}</p>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {q.options.map((opt, oIdx) => (
                                  <span key={oIdx} className={`text-xs px-2 py-1 rounded ${oIdx === q.correctIndex ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-muted'}`}>
                                    {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === q.correctIndex && '✓'}
                                  </span>
                                ))}
                              </div>
                              {q.explanation && <p className="text-xs text-muted-foreground mt-1">💡 {q.explanation}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                      <Separator />
                    </div>
                  ))
                } catch {
                  return <p className="text-sm">{previewStory.narrative}</p>
                }
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteStory} onOpenChange={() => setDeleteStory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Story
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteStory?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStory(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteStoryAction}>Delete Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
