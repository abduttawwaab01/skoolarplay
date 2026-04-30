'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle, MessageSquare, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  questions?: SurveyQuestion[]
  hasResponded?: boolean
}

interface SurveyDialogProps {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function SurveyDialog({ survey, open, onOpenChange, onComplete }: SurveyDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && survey) {
      setCurrentQuestion(0)
      setAnswers({})
      setSubmitted(false)
    }
  }, [open, survey])

  if (!survey) return null

  const questions = survey.questions || []
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const getQuestionOptions = (question: SurveyQuestion): string[] => {
    if (!question.options) return []
    try {
      return JSON.parse(question.options)
    } catch {
      return []
    }
  }

  const handleAnswer = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    const q = questions[currentQuestion]
    if (q.isRequired && !answers[q.id]) {
      toast.error('Please answer this question to continue')
      return
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    // Check required questions
    const missing = questions.filter(q => q.isRequired && !answers[q.id])
    if (missing.length > 0) {
      toast.error('Please answer all required questions')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/surveys/${survey.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      if (res.ok) {
        setSubmitted(true)
        toast.success('Thank you for your feedback!')
        onComplete?.()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit')
      }
    } catch {
      toast.error('Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (q: SurveyQuestion) => {
    const value = answers[q.id]

    switch (q.type) {
      case 'TEXT':
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
          />
        )

      case 'MCQ':
        const mcqOptions = getQuestionOptions(q)
        return (
          <RadioGroup
            value={(value as string) || ''}
            onValueChange={(v) => handleAnswer(q.id, v)}
            className="space-y-2"
          >
            {mcqOptions.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <RadioGroupItem value={opt} id={`${q.id}-${i}`} />
                <Label htmlFor={`${q.id}-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'MULTIPLE_SELECT':
        const msOptions = getQuestionOptions(q)
        const selected = (value as string[]) || []
        return (
          <div className="space-y-2">
            {msOptions.map((opt, i) => (
              <div key={i} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  id={`${q.id}-${i}`}
                  checked={selected.includes(opt)}
                  onCheckedChange={(checked) => {
                    const current = selected.includes(opt)
                      ? selected.filter(v => v !== opt)
                      : [...selected, opt]
                    handleAnswer(q.id, current)
                  }}
                />
                <Label htmlFor={`${q.id}-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
              </div>
            ))}
          </div>
        )

      case 'RATING':
        return (
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleAnswer(q.id, star)}
                className="p-2 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${(value as number) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                />
              </button>
            ))}
          </div>
        )

      case 'YES_NO':
        return (
          <RadioGroup
            value={(value as string) || ''}
            onValueChange={(v) => handleAnswer(q.id, v)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg flex-1 justify-center cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="Yes" id={`${q.id}-yes`} />
              <Label htmlFor={`${q.id}-yes`} className="cursor-pointer font-medium">Yes</Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg flex-1 justify-center cursor-pointer hover:bg-muted/50">
              <RadioGroupItem value="No" id={`${q.id}-no`} />
              <Label htmlFor={`${q.id}-no`} className="cursor-pointer font-medium">No</Label>
            </div>
          </RadioGroup>
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={(value as string) || ''}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
            placeholder="Enter a number..."
          />
        )

      default:
        return (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
          />
        )
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (submitted) {
    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md p-6"
            >
              <Card className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
                <p className="text-muted-foreground mb-6">Your feedback has been submitted successfully.</p>
                <Button onClick={handleClose}>Close</Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden"
          >
            <Card className="flex flex-col max-h-[85vh]">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{survey.title}</CardTitle>
                    {survey.description && (
                      <CardDescription className="mt-1">{survey.description}</CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6">
                {questions.length > 0 ? (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">
                        {questions[currentQuestion].question}
                        {questions[currentQuestion].isRequired && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                    </div>
                    <div className="min-h-[150px]">
                      {renderQuestion(questions[currentQuestion])}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions in this survey
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQuestion < questions.length - 1 ? (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

interface PendingSurveyCardProps {
  survey: {
    id: string
    title: string
    description: string | null
    _count: { responses: number }
  }
  onClick: () => void
}

export function PendingSurveyCard({ survey, onClick }: PendingSurveyCardProps) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-all border-primary/20 bg-primary/5"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{survey.title}</h4>
          {survey.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{survey.description}</p>
          )}
          <Badge variant="secondary" className="mt-2 text-xs">
            Take Survey
          </Badge>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
    </Card>
  )
}
