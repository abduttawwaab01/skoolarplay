'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  Award,
  Target,
  Play,
  BarChart3,
  Filter,
  Search,
  BookOpen,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface Exam {
  id: string
  title: string
  description: string | null
  type: string
  subject: string
  year: number | null
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMark: number
  attemptsCount: number
  bestScore: { score: number; total: number; percentage: number; passed: boolean } | null
}

const examTypes = ['ALL', 'WAEC', 'JAMB', 'NECO', 'MOCK']
const subjects = [
  'All Subjects',
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature',
  'CRK',
  'Geography',
]

const typeColors: Record<string, string> = {
  WAEC: 'bg-blue-100 text-blue-700 border-blue-200',
  JAMB: 'bg-green-100 text-green-700 border-green-200',
  NECO: 'bg-purple-100 text-purple-700 border-purple-200',
  MOCK: 'bg-orange-100 text-orange-700 border-orange-200',
  CUSTOM: 'bg-gray-100 text-gray-700 border-gray-200',
}

const subjectIcons: Record<string, string> = {
  Mathematics: '🔢',
  English: '📖',
  Physics: '⚡',
  Chemistry: '🧪',
  Biology: '🧬',
  Economics: '💰',
  Government: '🏛️',
  Literature: '✍️',
  CRK: '🕊️',
  Geography: '🌍',
}

function HubSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  )
}

export function ExamHubPage() {
  const { navigateTo, goBack } = useAppStore()
  const playClick = useSoundEffect('click')
  const playOpen = useSoundEffect('open')
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('ALL')
  const [activeSubject, setActiveSubject] = useState('All Subjects')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    playOpen()
  }, [playOpen])

  useEffect(() => {
    fetchExams()
  }, [activeType, activeSubject])

  async function fetchExams() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeType !== 'ALL') params.set('type', activeType)
      if (activeSubject !== 'All Subjects') params.set('subject', activeSubject)

      const res = await fetch(`/api/exams?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setExams(data.exams || [])
      }
    } catch (err) {
      console.error('Failed to fetch exams:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredExams = searchQuery
    ? exams.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : exams

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                📝 Exam Center
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Practice with past questions and mock exams
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{filteredExams.length} exams available</span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 rounded-full h-10"
        />
      </motion.div>

      {/* Exam Type Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {examTypes.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={activeType === type ? 'default' : 'outline'}
            onClick={() => setActiveType(type)}
            className={`rounded-full shrink-0 ${
              activeType === type
                ? 'bg-[#008751] hover:bg-[#008751]/90 text-white border-0'
                : ''
            }`}
          >
            {type === 'ALL' ? 'All Types' : type}
          </Button>
        ))}
      </motion.div>

      {/* Subject Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {subjects.map((subject) => (
          <Button
            key={subject}
            size="sm"
            variant={activeSubject === subject ? 'secondary' : 'ghost'}
            onClick={() => setActiveSubject(subject)}
            className={`rounded-full shrink-0 text-xs ${
              activeSubject === subject
                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                : 'text-muted-foreground'
            }`}
          >
            {subject !== 'All Subjects' && (
              <span className="mr-1">{subjectIcons[subject] || '📚'}</span>
            )}
            {subject}
          </Button>
        ))}
      </motion.div>

      {/* Exam Grid */}
      {loading ? (
        <HubSkeleton />
      ) : filteredExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <FileText className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Exams Found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery ? 'Try a different search term' : 'No exams match the selected filters'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={`border text-xs rounded-full ${typeColors[exam.type] || typeColors.CUSTOM}`}>
                        {exam.type}
                      </Badge>
                      {exam.year && (
                        <span className="text-xs text-muted-foreground">{exam.year}</span>
                      )}
                    </div>
                    <span className="text-lg">{subjectIcons[exam.subject] || '📝'}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1 line-clamp-2">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{exam.subject}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Clock className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                      <p className="text-xs font-semibold">{exam.duration}m</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <FileText className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                      <p className="text-xs font-semibold">{exam.totalQuestions}Q</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Target className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-0.5" />
                      <p className="text-xs font-semibold">{exam.totalMarks}</p>
                    </div>
                  </div>

                  {/* Best Score */}
                  {exam.bestScore && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium">Best Score</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${
                          exam.bestScore.percentage >= 50 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {exam.bestScore.percentage}%
                        </span>
                        {exam.bestScore.passed && (
                          <Badge className="bg-green-100 text-green-700 text-[10px] border-0 rounded-full">
                            Passed
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attempts info */}
                  {exam.attemptsCount > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {exam.attemptsCount} attempt{exam.attemptsCount > 1 ? 's' : ''} made
                    </p>
                  )}

                  {/* Action */}
                  <div className="mt-auto">
                    <Button
                      onClick={() => { playOpen(); navigateTo('exam', { examId: exam.id }) }}
                      className={`w-full rounded-full h-10 font-semibold ${
                        exam.bestScore
                          ? 'bg-primary/10 text-primary hover:bg-primary/15'
                          : 'bg-[#008751] hover:bg-[#008751]/90 text-white'
                      }`}
                    >
                      {exam.bestScore ? (
                        <>
                          <BarChart3 className="w-4 h-4 mr-1.5" />
                          {exam.bestScore.passed ? 'Review' : 'Retry Exam'}
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1.5" />
                          Start Exam
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
