'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Eye, Upload, Search, ChevronDown, ChevronUp,
  Play, CheckCircle2, XCircle, AlertTriangle, Settings, Loader2,
  Video, HelpCircle, Shield, Zap, Gem
} from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Video {
  id: string
  lessonId: string
  title: string
  url: string
  duration: number
  lesson: {
    id: string
    title: string
    module: {
      id: string
      title: string
      course: {
        id: string
        title: string
      }
    }
  }
  quiz?: VideoQuiz | null
}

interface VideoQuiz {
  id: string
  videoId: string
  title: string
  passingScore: number
  timeLimit: number | null
  xpReward: number
  gemReward: number
  isActive: boolean
  requireFullscreen: boolean
  preventTabSwitch: boolean
  preventCopyPaste: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  questions: VideoQuizQuestion[]
}

interface VideoQuizQuestion {
  id: string
  videoQuizId: string
  type: string
  question: string
  hint: string | null
  explanation: string | null
  options: string | null
  correctAnswer: string
  order: number
  points: number
}

interface Option {
  text: string
  isCorrect: boolean
}

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'CHECKBOX', label: 'Multiple Selection' },
  { value: 'DRAG_DROP', label: 'Drag and Drop' },
  { value: 'MATCHING', label: 'Matching' },
  { value: 'ORDERING', label: 'Ordering' },
  { value: 'SPEECH', label: 'Speech Recognition' },
]

export function AdminVideoQuizPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Quiz settings dialog
  const [quizSettingsOpen, setQuizSettingsOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [quizSettings, setQuizSettings] = useState({
    title: 'Video Quiz',
    passingScore: 60,
    timeLimit: null as number | null,
    xpReward: 15,
    gemReward: 2,
    requireFullscreen: false,
    preventTabSwitch: false,
    preventCopyPaste: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    isActive: true,
  })

  // Question dialog
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<VideoQuizQuestion | null>(null)
  const [questionType, setQuestionType] = useState('MCQ')
  const [questionText, setQuestionText] = useState('')
  const [questionHint, setQuestionHint] = useState('')
  const [questionExplanation, setQuestionExplanation] = useState('')
  const [questionPoints, setQuestionPoints] = useState(10)
  const [questionOptions, setQuestionOptions] = useState<Option[]>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [correctAnswer, setCorrectAnswer] = useState('')

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'quiz' | 'question'; id: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/videos')
      if (res.ok) {
        const data = await res.json()
        // Fetch quiz for each video
        const videosWithQuizzes = await Promise.all(
          (data.videos || []).map(async (video: Video) => {
            const quizRes = await fetch(`/api/admin/video-quiz?videoId=${video.id}`)
            if (quizRes.ok) {
              const quizData = await quizRes.json()
              return { ...video, quiz: quizData.quiz || null }
            }
            return { ...video, quiz: null }
          })
        )
        setVideos(videosWithQuizzes)
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      toast.error('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.lesson?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.lesson?.module?.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openQuizSettings = (video: Video) => {
    setSelectedVideo(video)
    if (video.quiz) {
      setQuizSettings({
        title: video.quiz.title,
        passingScore: video.quiz.passingScore,
        timeLimit: video.quiz.timeLimit,
        xpReward: video.quiz.xpReward,
        gemReward: video.quiz.gemReward,
        requireFullscreen: video.quiz.requireFullscreen,
        preventTabSwitch: video.quiz.preventTabSwitch,
        preventCopyPaste: video.quiz.preventCopyPaste,
        shuffleQuestions: video.quiz.shuffleQuestions,
        shuffleOptions: video.quiz.shuffleOptions,
        isActive: true,
      })
    } else {
      setQuizSettings({
        title: 'Video Quiz',
        passingScore: 60,
        timeLimit: null,
        xpReward: 15,
        gemReward: 2,
        requireFullscreen: false,
        preventTabSwitch: false,
        preventCopyPaste: false,
        shuffleQuestions: false,
        shuffleOptions: false,
        isActive: true,
      })
    }
    setQuizSettingsOpen(true)
  }

  const saveQuizSettings = async () => {
    if (!selectedVideo) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/video-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          ...quizSettings,
        }),
      })

      if (res.ok) {
        toast.success('Quiz settings saved')
        setQuizSettingsOpen(false)
        fetchVideos()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save quiz')
      }
    } catch (error) {
      toast.error('Failed to save quiz')
    } finally {
      setSaving(false)
    }
  }

  const openQuestionDialog = (video: Video, question?: VideoQuizQuestion) => {
    setSelectedVideo(video)
    if (question) {
      setEditingQuestion(question)
      setQuestionType(question.type)
      setQuestionText(question.question)
      setQuestionHint(question.hint || '')
      setQuestionExplanation(question.explanation || '')
      setQuestionPoints(question.points)

      if (question.type === 'MCQ') {
        try {
          const rawOptions = JSON.parse(question.options || '[]')
          const correctAnswer = question.correctAnswer || ''
          let options: Option[]
          
          if (Array.isArray(rawOptions) && rawOptions.length > 0) {
            if (typeof rawOptions[0] === 'string') {
              options = rawOptions.map((opt: string) => ({
                text: opt,
                isCorrect: opt === correctAnswer,
              }))
            } else {
              options = rawOptions.map((opt: any) => ({
                text: opt.text || opt,
                isCorrect: opt.isCorrect || opt.text === correctAnswer,
              }))
            }
          } else {
            options = [
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
            ]
          }
          setQuestionOptions(options)
          setCorrectAnswer(correctAnswer)
        } catch {
          setQuestionOptions([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ])
          setCorrectAnswer(question.correctAnswer || '')
        }
      } else if (question.type === 'TRUE_FALSE') {
        const correctAnswer = question.correctAnswer || ''
        setCorrectAnswer(correctAnswer)
        setQuestionOptions([
          { text: 'True', isCorrect: correctAnswer === 'True' },
          { text: 'False', isCorrect: correctAnswer === 'False' },
        ])
      } else if (question.type === 'CHECKBOX') {
        try {
          const rawOptions = JSON.parse(question.options || '[]')
          const correctAnswer = question.correctAnswer || '[]'
          let correctOptions: string[] = []
          try {
            correctOptions = JSON.parse(correctAnswer)
          } catch {}
          correctOptions = Array.isArray(correctOptions) ? correctOptions : []
          
          let options: Option[]
          if (Array.isArray(rawOptions) && rawOptions.length > 0) {
            if (typeof rawOptions[0] === 'string') {
              options = rawOptions.map((opt: string) => ({
                text: opt,
                isCorrect: correctOptions.some(ca => ca.toLowerCase().trim() === opt.toLowerCase().trim()),
              }))
            } else {
              options = rawOptions.map((opt: any) => ({
                text: opt.text || opt,
                isCorrect: opt.isCorrect || correctOptions.some(ca => ca.toLowerCase().trim() === (opt.text || opt).toLowerCase().trim()),
              }))
            }
          } else {
            options = [
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
              { text: '', isCorrect: false },
            ]
          }
          setQuestionOptions(options)
          setCorrectAnswer(correctAnswer)
        } catch {
          setQuestionOptions([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ])
          setCorrectAnswer('[]')
        }
      } else {
        setCorrectAnswer(question.correctAnswer || '')
        setQuestionOptions([
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ])
      }
    } else {
      setEditingQuestion(null)
      setQuestionType('MCQ')
      setQuestionText('')
      setQuestionHint('')
      setQuestionExplanation('')
      setQuestionPoints(10)
      setCorrectAnswer('')
      setQuestionOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    }
    setQuestionDialogOpen(true)
  }

  const saveQuestion = async () => {
    if (!selectedVideo || !questionText) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      let optionsData: string | null = null
      let finalCorrectAnswer: string = ''

      if (questionType === 'MCQ') {
        const validOptions = questionOptions.filter(o => o.text.trim())
        if (validOptions.length < 2) {
          toast.error('MCQ requires at least 2 options')
          setSaving(false)
          return
        }
        if (!correctAnswer) {
          toast.error('Please select the correct answer')
          setSaving(false)
          return
        }
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        finalCorrectAnswer = correctAnswer
      } else if (questionType === 'TRUE_FALSE') {
        optionsData = JSON.stringify(['True', 'False'])
        finalCorrectAnswer = correctAnswer === 'true' || correctAnswer === 'True' ? 'True' : 'False'
        if (!finalCorrectAnswer) {
          toast.error('Please select True or False')
          setSaving(false)
          return
        }
      } else if (questionType === 'FILL_BLANK') {
        if (!correctAnswer) {
          toast.error('Please enter the correct answer')
          setSaving(false)
          return
        }
        finalCorrectAnswer = correctAnswer
      } else if (questionType === 'CHECKBOX') {
        const validOptions = questionOptions.filter(o => o.text.trim())
        if (validOptions.length < 2) {
          toast.error('Checkbox requires at least 2 options')
          setSaving(false)
          return
        }
        const correctOptions = validOptions.filter(o => o.isCorrect).map(o => o.text)
        if (correctOptions.length === 0) {
          toast.error('Please select at least one correct answer')
          setSaving(false)
          return
        }
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        finalCorrectAnswer = JSON.stringify(correctOptions)
      } else if (questionType === 'DRAG_DROP') {
        const validOptions = questionOptions.filter(o => o.text.trim())
        if (validOptions.length < 2) {
          toast.error('Drag & Drop requires at least 2 words')
          setSaving(false)
          return
        }
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        finalCorrectAnswer = JSON.stringify(validOptions.map(o => o.text))
      } else if (questionType === 'MATCHING') {
        const validOptions = questionOptions.filter(o => o.text.trim())
        if (validOptions.length < 2) {
          toast.error('Matching requires at least 2 pairs')
          setSaving(false)
          return
        }
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        try {
          const pairs = JSON.parse(correctAnswer || '[]')
          finalCorrectAnswer = JSON.stringify(pairs)
        } catch {
          toast.error('Invalid matching pairs')
          setSaving(false)
          return
        }
      } else if (questionType === 'ORDERING') {
        const validOptions = questionOptions.filter(o => o.text.trim())
        if (validOptions.length < 2) {
          toast.error('Ordering requires at least 2 items')
          setSaving(false)
          return
        }
        optionsData = JSON.stringify(validOptions.map(o => o.text))
        finalCorrectAnswer = JSON.stringify(validOptions.map(o => o.text))
      } else if (questionType === 'SPEECH') {
        if (!correctAnswer) {
          toast.error('Please enter the expected word or phrase')
          setSaving(false)
          return
        }
        finalCorrectAnswer = correctAnswer
      }

      const payload = {
        videoQuizId: selectedVideo.quiz?.id,
        type: questionType,
        question: questionText,
        hint: questionHint || null,
        explanation: questionExplanation || null,
        options: optionsData,
        correctAnswer: finalCorrectAnswer,
        points: questionPoints,
      }

      let res
      if (editingQuestion) {
        res = await fetch('/api/admin/video-quiz-questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQuestion.id, ...payload }),
        })
      } else {
        res = await fetch('/api/admin/video-quiz-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        toast.success(editingQuestion ? 'Question updated' : 'Question added')
        setQuestionDialogOpen(false)
        fetchVideos()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save question')
      }
    } catch (error) {
      toast.error('Failed to save question')
    } finally {
      setSaving(false)
    }
  }

  const deleteQuizOrQuestion = async () => {
    if (!deleteConfirm) return
    setSaving(true)
    try {
      let res
      if (deleteConfirm.type === 'quiz') {
        res = await fetch(`/api/admin/video-quiz?videoId=${deleteConfirm.id}`, {
          method: 'DELETE',
        })
      } else {
        res = await fetch(`/api/admin/video-quiz-questions?id=${deleteConfirm.id}`, {
          method: 'DELETE',
        })
      }

      if (res.ok) {
        toast.success('Deleted successfully')
        setDeleteConfirm(null)
        fetchVideos()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  const updateOption = (index: number, text: string) => {
    const newOptions = [...questionOptions]
    newOptions[index] = { ...newOptions[index], text }
    setQuestionOptions(newOptions)
  }

  const setCorrectOption = (index: number) => {
    const newOptions = questionOptions.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setQuestionOptions(newOptions)
    setCorrectAnswer(newOptions[index].text)
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Quizzes</h1>
          <p className="text-muted-foreground">Manage quizzes for video lessons</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No videos found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Course / Module</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Quiz Status</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 rounded bg-muted flex items-center justify-center">
                          <Play className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{video.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{video.lesson?.module?.course?.title}</p>
                        <p className="text-muted-foreground">{video.lesson?.module?.title}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatDuration(video.duration)}</TableCell>
                    <TableCell>
                      {video.quiz ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <HelpCircle className="w-3 h-3 mr-1" />
                          No Quiz
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {video.quiz ? (
                        <span>{video.quiz.questions.length} questions</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openQuizSettings(video)}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          {video.quiz ? 'Edit Quiz' : 'Create Quiz'}
                        </Button>
                        {video.quiz && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openQuestionDialog(video)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Question
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quiz Settings Dialog */}
      <Dialog open={quizSettingsOpen} onOpenChange={setQuizSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Quiz Settings</DialogTitle>
            <DialogDescription>
              Configure quiz settings for: {selectedVideo?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Basic Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input
                    value={quizSettings.title}
                    onChange={(e) => setQuizSettings({ ...quizSettings, title: e.target.value })}
                    placeholder="Video Quiz"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={quizSettings.passingScore}
                    onChange={(e) => setQuizSettings({ ...quizSettings, passingScore: parseInt(e.target.value) || 60 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Limit (minutes, 0 = no limit)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quizSettings.timeLimit || 0}
                    onChange={(e) => setQuizSettings({ ...quizSettings, timeLimit: parseInt(e.target.value) || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Active Status</Label>
                  <Select
                    value={quizSettings.isActive ? 'true' : 'false'}
                    onValueChange={(v) => setQuizSettings({ ...quizSettings, isActive: v === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Rewards
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quizSettings.xpReward}
                    onChange={(e) => setQuizSettings({ ...quizSettings, xpReward: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gem Reward</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quizSettings.gemReward}
                    onChange={(e) => setQuizSettings({ ...quizSettings, gemReward: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Fullscreen</Label>
                    <p className="text-xs text-muted-foreground">Force fullscreen during quiz</p>
                  </div>
                  <Switch
                    checked={quizSettings.requireFullscreen}
                    onCheckedChange={(v) => setQuizSettings({ ...quizSettings, requireFullscreen: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prevent Tab Switch</Label>
                    <p className="text-xs text-muted-foreground">Detect when user switches tabs</p>
                  </div>
                  <Switch
                    checked={quizSettings.preventTabSwitch}
                    onCheckedChange={(v) => setQuizSettings({ ...quizSettings, preventTabSwitch: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prevent Copy/Paste</Label>
                    <p className="text-xs text-muted-foreground">Block copy and paste during quiz</p>
                  </div>
                  <Switch
                    checked={quizSettings.preventCopyPaste}
                    onCheckedChange={(v) => setQuizSettings({ ...quizSettings, preventCopyPaste: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Questions</Label>
                    <p className="text-xs text-muted-foreground">Randomize question order</p>
                  </div>
                  <Switch
                    checked={quizSettings.shuffleQuestions}
                    onCheckedChange={(v) => setQuizSettings({ ...quizSettings, shuffleQuestions: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shuffle Options</Label>
                    <p className="text-xs text-muted-foreground">Randomize MCQ option order</p>
                  </div>
                  <Switch
                    checked={quizSettings.shuffleOptions}
                    onCheckedChange={(v) => setQuizSettings({ ...quizSettings, shuffleOptions: v })}
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            {selectedVideo?.quiz && selectedVideo.quiz.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">Questions ({selectedVideo.quiz.questions.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedVideo.quiz.questions.map((q, index) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{index + 1}. {q.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{q.type}</Badge>
                          <span className="text-xs text-muted-foreground">{q.points} pts</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openQuestionDialog(selectedVideo, q)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ type: 'question', id: q.id })}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedVideo?.quiz && (
              <Button
                variant="destructive"
                onClick={() => {
                  setDeleteConfirm({ type: 'quiz', id: selectedVideo.id })
                  setQuizSettingsOpen(false)
                }}
                disabled={saving}
              >
                Delete Quiz
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setQuizSettingsOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveQuizSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </DialogTitle>
            <DialogDescription>
              Add a question to: {selectedVideo?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hint (optional)</Label>
                <Input
                  value={questionHint}
                  onChange={(e) => setQuestionHint(e.target.value)}
                  placeholder="A helpful hint"
                />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            {/* MCQ Options */}
            {questionType === 'MCQ' && (
              <div className="space-y-3">
                <Label>Options (click to set correct answer)</Label>
                <div className="space-y-2">
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Button
                        variant={option.isCorrect ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                        onClick={() => setCorrectOption(index)}
                      >
                        {index + 1}
                      </Button>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== index))}
                        disabled={questionOptions.length <= 2}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionOptions([...questionOptions, { text: '', isCorrect: false }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* True/False Options */}
            {questionType === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <Label>Select the correct answer</Label>
                <div className="flex gap-4">
                  {['True', 'False'].map((opt) => (
                    <Button
                      key={opt}
                      variant={correctAnswer === opt ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => {
                        setCorrectAnswer(opt)
                        setQuestionOptions([
                          { text: 'True', isCorrect: opt === 'True' },
                          { text: 'False', isCorrect: opt === 'False' },
                        ])
                      }}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the Blank */}
            {questionType === 'FILL_BLANK' && (
              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                <Input
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Enter the correct answer"
                />
              </div>
            )}

            {/* Checkbox (Multiple Selection) */}
            {questionType === 'CHECKBOX' && (
              <div className="space-y-3">
                <Label>Options (check all correct answers)</Label>
                <p className="text-xs text-muted-foreground">Select all options that are correct answers</p>
                <div className="space-y-2">
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={() => {
                          const newOptions = [...questionOptions]
                          newOptions[index] = { ...newOptions[index], isCorrect: !newOptions[index].isCorrect }
                          setQuestionOptions(newOptions)
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== index))}
                        disabled={questionOptions.length <= 2}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionOptions([...questionOptions, { text: '', isCorrect: false }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Drag and Drop */}
            {questionType === 'DRAG_DROP' && (
              <div className="space-y-3">
                <Label>Words to drag (place in correct order)</Label>
                <p className="text-xs text-muted-foreground">Add words that students will drag to fill in blanks</p>
                <div className="space-y-2">
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-300 shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Word ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== index))}
                        disabled={questionOptions.length <= 2}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionOptions([...questionOptions, { text: '', isCorrect: false }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Word
                  </Button>
                </div>
              </div>
            )}

            {/* Matching */}
            {questionType === 'MATCHING' && (
              <div className="space-y-3">
                <Label>Matching Pairs</Label>
                <p className="text-xs text-muted-foreground">Add items on the left and their matching answers on the right</p>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Items</p>
                    {questionOptions.map((opt, i) => (
                      <div key={i} className="flex gap-1">
                        <Input
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...questionOptions]
                            newOptions[i] = { ...newOptions[i], text: e.target.value }
                            setQuestionOptions(newOptions)
                          }}
                          placeholder={`Item ${i + 1}`}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Match To</p>
                    {questionOptions.map((opt, i) => {
                      let answers: string[] = []
                      try {
                        if (correctAnswer) {
                          const parsed = JSON.parse(correctAnswer)
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
                            setCorrectAnswer(JSON.stringify(newAnswers))
                          }}
                          placeholder={`Match ${i + 1}`}
                          className="text-sm"
                        />
                      )
                    })}
                  </div>
                  <div className="pt-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuestionOptions(questionOptions.slice(0, -1))}
                      disabled={questionOptions.length <= 2}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuestionOptions([...questionOptions, { text: '', isCorrect: false }])
                    const answers = [...(JSON.parse(correctAnswer || '[]') as string[]), '']
                    setCorrectAnswer(JSON.stringify(answers))
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Pair
                </Button>
              </div>
            )}

            {/* Ordering */}
            {questionType === 'ORDERING' && (
              <div className="space-y-3">
                <Label>Items (arrange in correct order)</Label>
                <p className="text-xs text-muted-foreground">Add items in the order they should be arranged</p>
                <div className="space-y-2">
                  {questionOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQuestionOptions(questionOptions.filter((_, i) => i !== index))}
                        disabled={questionOptions.length <= 2}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestionOptions([...questionOptions, { text: '', isCorrect: false }])}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            )}

            {/* Speech */}
            {questionType === 'SPEECH' && (
              <div className="space-y-2">
                <Label>Expected Word/Phrase *</Label>
                <Input
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="Enter the word or phrase to pronounce"
                />
                <p className="text-xs text-muted-foreground">Students will speak this word and their pronunciation will be checked</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Explanation (shown after answering)</Label>
              <Textarea
                value={questionExplanation}
                onChange={(e) => setQuestionExplanation(e.target.value)}
                placeholder="Explain the correct answer..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveQuestion} disabled={saving}>
              {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteConfirm?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteQuizOrQuestion} disabled={saving}>
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
