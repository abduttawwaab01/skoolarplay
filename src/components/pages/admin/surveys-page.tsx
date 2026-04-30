'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp, BarChart3, Users, ToggleLeft, ToggleRight, Calendar, CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface SurveyQuestion {
  id: string
  type: string
  question: string
  options: string | null
  isRequired: boolean
  order: number
}

interface Survey {
  id: string
  title: string
  description: string | null
  triggerType: string
  triggerConfig: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { questions: number; responses: number }
  questions?: SurveyQuestion[]
}

const QUESTION_TYPES = [
  { value: 'TEXT', label: 'Text (Open-ended)', hasOptions: false },
  { value: 'MCQ', label: 'Multiple Choice (Single)', hasOptions: true },
  { value: 'MULTIPLE_SELECT', label: 'Multiple Select (Checkbox)', hasOptions: true },
  { value: 'RATING', label: 'Rating (1-5)', hasOptions: false },
  { value: 'YES_NO', label: 'Yes / No', hasOptions: false },
  { value: 'NUMBER', label: 'Number', hasOptions: false },
]

const TRIGGER_TYPES = [
  { value: 'COURSE_COMPLETION', label: 'Course Completion', description: 'Triggered after user completes a course' },
  { value: 'MANUAL', label: 'Manual', description: 'Only shown via notification/dashboard' },
  { value: 'SCHEDULED', label: 'Scheduled', description: 'Send at specific intervals' },
]

export function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedSurvey, setExpandedSurvey] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewResponsesOpen, setViewResponsesOpen] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [editing, setEditing] = useState<Survey | null>(null)
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    triggerType: 'COURSE_COMPLETION',
    isActive: true,
  })
  const [questions, setQuestions] = useState<Array<{
    type: string
    question: string
    options: string
    isRequired: boolean
  }>>([])

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const res = await fetch('/api/surveys?include=questions')
      const data = await res.json()
      setSurveys(data.surveys || [])
    } catch {
      toast.error('Failed to fetch surveys')
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async (surveyId: string) => {
    setResponsesLoading(true)
    try {
      const res = await fetch(`/api/surveys/${surveyId}/responses`)
      const data = await res.json()
      setResponses(data.responses || [])
    } catch {
      toast.error('Failed to fetch responses')
    } finally {
      setResponsesLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', triggerType: 'COURSE_COMPLETION', isActive: true })
    setQuestions([{ type: 'TEXT', question: '', options: '', isRequired: true }])
    setDialogOpen(true)
  }

  const openEdit = (survey: Survey) => {
    setEditing(survey)
    setForm({
      title: survey.title,
      description: survey.description || '',
      triggerType: survey.triggerType,
      isActive: survey.isActive,
    })
    setQuestions((survey.questions || []).map(q => ({
      type: q.type,
      question: q.question,
      options: q.options ? JSON.parse(q.options).join('\n') : '',
      isRequired: q.isRequired,
    })))
    setDialogOpen(true)
  }

  const openViewResponses = async (survey: Survey) => {
    setCurrentSurvey(survey)
    await fetchResponses(survey.id)
    setViewResponsesOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    if (questions.length === 0) {
      toast.error('At least one question is required')
      return
    }

    try {
      const payload = {
        ...form,
        questions: questions.map((q, i) => ({
          ...q,
          order: i,
          options: q.options ? q.options.split('\n').filter(o => o.trim()) : null,
        })),
      }

      const url = editing ? `/api/surveys/${editing.id}` : '/api/surveys'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(editing ? 'Survey updated' : 'Survey created')
        setDialogOpen(false)
        fetchSurveys()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleToggleActive = async (survey: Survey) => {
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !survey.isActive }),
      })
      if (res.ok) {
        toast.success(survey.isActive ? 'Survey disabled' : 'Survey enabled')
        fetchSurveys()
      }
    } catch {
      toast.error('Failed to update survey')
    }
  }

  const handleDelete = async (survey: Survey) => {
    if (!confirm(`Delete survey "${survey.title}"? This will also delete all responses.`)) return
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Survey deleted')
        fetchSurveys()
      }
    } catch {
      toast.error('Failed to delete survey')
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, { type: 'TEXT', question: '', options: '', isRequired: true }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions]
    ;(updated[index] as any)[field] = value
    setQuestions(updated)
  }

  const filteredSurveys = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surveys & Feedback</h1>
          <p className="text-muted-foreground">Create and manage course feedback surveys</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search surveys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Surveys List */}
      <div className="grid gap-4">
        {filteredSurveys.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
            <p className="text-muted-foreground mb-4">Create your first survey to collect feedback</p>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          </Card>
        ) : (
          filteredSurveys.map(survey => (
            <Card key={survey.id} className="overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedSurvey(expandedSurvey === survey.id ? null : survey.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{survey.title}</h3>
                      <Badge variant={survey.isActive ? 'default' : 'secondary'}>
                        {survey.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {survey.triggerType.replace('_', ' ')}
                      </Badge>
                    </div>
                    {survey.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{survey.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {survey._count.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {survey._count.responses} responses
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openViewResponses(survey) }}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Responses
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(survey) }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(survey) }}
                    >
                      {survey.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(survey) }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    {expandedSurvey === survey.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Questions */}
              <AnimatePresence>
                {expandedSurvey === survey.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t bg-muted/30"
                  >
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-medium">Questions ({survey._count.questions})</h4>
                      {(survey.questions || []).map((q, i) => (
                        <div key={q.id} className="flex items-start gap-2 p-2 bg-background rounded-lg">
                          <span className="text-muted-foreground text-sm w-6">{i + 1}.</span>
                          <div className="flex-1">
                            <p className="text-sm">{q.question}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{q.type}</Badge>
                              {q.isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Survey' : 'Create New Survey'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Course Feedback Survey"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description for users"
              />
            </div>
            <div>
              <Label>Trigger Type</Label>
              <Select
                value={form.triggerType}
                onValueChange={(v) => setForm({ ...form, triggerType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>

            <Separator />

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions *</Label>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {questions.map((q, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={q.type} onValueChange={(v) => updateQuestion(i, 'type', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={q.isRequired}
                            onCheckedChange={(v) => updateQuestion(i, 'isRequired', v)}
                          />
                          <span className="text-sm">Required</span>
                        </div>
                      </div>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                        placeholder="Enter question..."
                      />
                      {['MCQ', 'MULTIPLE_SELECT'].includes(q.type) && (
                        <Textarea
                          value={q.options}
                          onChange={(e) => updateQuestion(i, 'options', e.target.value)}
                          placeholder="Enter options (one per line)..."
                          rows={3}
                        />
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'} Survey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Responses Dialog */}
      <Dialog open={viewResponsesOpen} onOpenChange={setViewResponsesOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Responses: {currentSurvey?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{responses.length} total responses</p>
          </DialogHeader>
          {responsesLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : responses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No responses yet</div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, i) => (
                <Card key={response.id} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="font-medium">{response.user?.name || 'Anonymous'}</div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(response.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(response.answers || []).map((answer: any) => (
                      <div key={answer.id} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground min-w-[100px]">Q:</span>
                        <span>{answer.answerText || answer.answer}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
