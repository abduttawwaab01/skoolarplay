'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, MessageSquare, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { SurveyDialog, PendingSurveyCard } from '@/components/shared/survey-dialog'
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
  _count: { responses: number }
  questions?: SurveyQuestion[]
  hasResponded?: boolean
}

export default function SurveysPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { navigateTo } = useAppStore()

  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false)
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSurveys()
    }
  }, [isAuthenticated])

  const fetchSurveys = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/surveys/available')
      if (res.ok) {
        const data = await res.json()
        setSurveys(data.surveys || [])
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTakeSurvey = (survey: Survey) => {
    if (survey.hasResponded) {
      toast.info('You have already completed this survey')
      return
    }
    setCurrentSurvey(survey)
    setSurveyDialogOpen(true)
  }

  const handleSurveyComplete = () => {
    fetchSurveys()
    setSurveyDialogOpen(false)
    setCurrentSurvey(null)
  }

  const pendingSurveys = surveys.filter(s => s.isActive && !s.hasResponded)
  const completedSurveys = surveys.filter(s => s.hasResponded)
  const allSurveys = surveys.filter(s => s.isActive)

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to view surveys.</p>
          <Button onClick={() => navigateTo('login')}>Log In</Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-4 md:p-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Surveys & Feedback</h1>
        <p className="text-muted-foreground">Help us improve by sharing your feedback</p>
      </div>

      {/* Pending Surveys */}
      {pendingSurveys.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Surveys ({pendingSurveys.length})
          </h2>
          <div className="grid gap-4">
            {pendingSurveys.map(survey => (
              <PendingSurveyCard
                key={survey.id}
                survey={survey}
                onClick={() => handleTakeSurvey(survey)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Surveys */}
      {completedSurveys.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed ({completedSurveys.length})
          </h2>
          <div className="grid gap-3">
            {completedSurveys.map(survey => (
              <Card key={survey.id} className="p-4 opacity-75">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium">{survey.title}</h4>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Surveys */}
      {allSurveys.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No surveys available</h3>
          <p className="text-muted-foreground">
            There are no surveys at the moment. Check back later!
          </p>
        </Card>
      ) : pendingSurveys.length === 0 && completedSurveys.length > 0 && (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">
            You've completed all available surveys. Thank you for your feedback!
          </p>
        </Card>
      )}

      {/* Survey Dialog */}
      <SurveyDialog
        survey={currentSurvey}
        open={surveyDialogOpen}
        onOpenChange={setSurveyDialogOpen}
        onComplete={handleSurveyComplete}
      />
    </motion.div>
  )
}
