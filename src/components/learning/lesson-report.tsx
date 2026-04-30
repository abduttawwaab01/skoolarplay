'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, XCircle, Clock, Target, TrendingUp, TrendingDown,
  ChevronDown, ChevronUp, BookOpen, RotateCcw, ArrowRight, Zap, Gem,
  Lightbulb, AlertTriangle, Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LessonReportData {
  timeSpent: number
  totalQuestions: number
  correctCount: number
  percentage: number
  isPassed: boolean
  questions: Array<{
    questionId: string
    questionNumber: number
    question: string
    type: string
    options: string[] | null
    correctAnswer: any
    userAnswer: string | null
    isCorrect: boolean
    explanation: string | null
    points: number
  }>
  strengths: Array<{ questionType: string; questionNumber: number }>
  weaknesses: Array<{ questionType: string; questionNumber: number; explanation: string | null }>
  recommendation: string
}

interface LessonReportProps {
  report: LessonReportData
  lessonTitle?: string
  xpEarned: number
  gemsEarned: number
  onRetry?: () => void
  onContinue?: () => void
}

const questionTypeLabels: Record<string, string> = {
  MCQ: 'Multiple Choice',
  FILL_BLANK: 'Fill in the Blank',
  DRAG_DROP: 'Drag & Drop',
  MATCHING: 'Match the Pairs',
  TRUE_FALSE: 'True or False',
  ORDERING: 'Put in Order',
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

function formatAnswer(answer: any): string {
  if (answer === null || answer === undefined) return 'No answer'
  if (typeof answer === 'string') return answer
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer)
}

export function LessonReport({
  report,
  lessonTitle,
  xpEarned,
  gemsEarned,
  onRetry,
  onContinue,
}: LessonReportProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'analysis'>('overview')

  const toggleQuestion = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index)
  }

  const scoreColor = report.percentage === 100
    ? 'text-[#008751]'
    : report.percentage >= 80
      ? 'text-[#008751]'
      : report.percentage >= 60
        ? 'text-[#F59E0B]'
        : 'text-red-500'

  const scoreBgColor = report.percentage === 100
    ? 'bg-[#008751]'
    : report.percentage >= 80
      ? 'bg-[#008751]'
      : report.percentage >= 60
        ? 'bg-[#F59E0B]'
        : 'bg-red-500'

  const scoreGlowColor = report.percentage === 100
    ? 'shadow-[0_0_30px_rgba(0,135,81,0.3)]'
    : report.percentage >= 80
      ? 'shadow-[0_0_30px_rgba(0,135,81,0.2)]'
      : report.percentage >= 60
        ? 'shadow-[0_0_30px_rgba(245,158,11,0.2)]'
        : ''

  return (
    <div className="space-y-4">
      {/* Score Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${scoreBgColor}`} />
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                {lessonTitle && (
                  <p className="text-sm text-muted-foreground mb-1">{lessonTitle}</p>
                )}
                <h3 className="text-lg font-bold">Lesson Report</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[#008751] font-bold text-sm">
                  <Zap className="w-4 h-4" />+{xpEarned}
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-1 text-[#F59E0B] font-bold text-sm">
                  <Gem className="w-4 h-4" />+{gemsEarned}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Circular Score */}
              <div className={`relative flex-shrink-0 w-24 h-24 rounded-full ${scoreBgColor}/10 flex items-center justify-center ${scoreGlowColor} rounded-full`}>
                <div className={`w-20 h-20 rounded-full ${scoreBgColor}/10 flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${scoreColor}`}>{report.percentage}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-semibold">{report.correctCount}/{report.totalQuestions}</span>
                  </div>
                  <Progress value={report.percentage} className="h-2" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{formatTime(report.timeSpent)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Result:</span>
                    <Badge variant={report.isPassed ? 'default' : 'destructive'} className="text-xs">
                      {report.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
          {(['overview', 'questions', 'analysis'] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' && <BookOpen className="w-3.5 h-3.5 mr-1.5" />}
              {tab === 'questions' && <Target className="w-3.5 h-3.5 mr-1.5" />}
              {tab === 'analysis' && <TrendingUp className="w-3.5 h-3.5 mr-1.5" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Strengths */}
            {report.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      Strengths ({report.strengths.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                      {report.strengths.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                        >
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Q{s.questionNumber} - {questionTypeLabels[s.questionType] || s.questionType}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Weaknesses */}
            {report.weaknesses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400">
                      <TrendingDown className="w-4 h-4" />
                      Areas to Improve ({report.weaknesses.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      {report.weaknesses.map((w, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="flex items-start gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20"
                        >
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              Q{w.questionNumber} - {questionTypeLabels[w.questionType] || w.questionType}
                            </p>
                            {w.explanation && (
                              <p className="text-xs text-muted-foreground mt-0.5">{w.explanation}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-[#008751]/5 to-[#F59E0B]/5 border-0">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#008751]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4 text-[#008751]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{report.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2 pr-2">
                {report.questions.map((q, i) => {
                  const isExpanded = expandedQuestion === i
                  return (
                    <motion.div
                      key={q.questionId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          q.isCorrect
                            ? 'border-l-4 border-l-green-500'
                            : 'border-l-4 border-l-red-500'
                        }`}
                        onClick={() => toggleQuestion(i)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              q.isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                            }`}>
                              {q.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                Q{q.questionNumber}. {q.question}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {questionTypeLabels[q.type] || q.type}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">{q.points} pts</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 pt-3 border-t space-y-3">
                                  {/* Your Answer */}
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Answer</p>
                                    <div className={`p-2 rounded-lg text-sm ${
                                      q.isCorrect
                                        ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                      {q.userAnswer ? formatAnswer(q.userAnswer) : 'No answer submitted'}
                                    </div>
                                  </div>

                                  {/* Correct Answer */}
                                  {!q.isCorrect && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Correct Answer</p>
                                      <div className="p-2 rounded-lg text-sm bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        {formatAnswer(q.correctAnswer)}
                                      </div>
                                    </div>
                                  )}

                                  {/* Options Display for MCQ */}
                                  {q.options && q.type === 'MCQ' && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Options</p>
                                      <div className="space-y-1">
                                        {q.options.map((opt, optIdx) => {
                                          const correctStr = formatAnswer(q.correctAnswer)
                                          const userStr = q.userAnswer || ''
                                          const isThisCorrect = correctStr === opt
                                          const isThisUser = userStr === opt
                                          return (
                                            <div
                                              key={optIdx}
                                              className={`px-2 py-1.5 rounded-md text-xs flex items-center gap-2 ${
                                                isThisCorrect
                                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-medium'
                                                  : isThisUser && !isThisCorrect
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                                    : 'bg-muted/50 text-muted-foreground'
                                              }`}
                                            >
                                              {isThisCorrect && <CheckCircle2 className="w-3 h-3" />}
                                              {isThisUser && !isThisCorrect && <XCircle className="w-3 h-3" />}
                                              <span className="font-medium mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                                              {opt}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Explanation */}
                                  {q.explanation && (
                                    <div className="space-y-1">
                                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" />
                                        Explanation
                                      </p>
                                      <div className="p-2 rounded-lg text-sm bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {q.explanation}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Performance Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{report.strengths.length}</p>
                    <p className="text-xs text-muted-foreground">Correct Answers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">{report.weaknesses.length}</p>
                    <p className="text-xs text-muted-foreground">Wrong Answers</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{report.correctCount}/{report.totalQuestions}</p>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{formatTime(report.timeSpent)}</p>
                    <p className="text-xs text-muted-foreground">Time Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Type Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Question Type Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  {(() => {
                    const typeMap = new Map<string, { total: number; correct: number }>()
                    for (const q of report.questions) {
                      const existing = typeMap.get(q.type) || { total: 0, correct: 0 }
                      existing.total++
                      if (q.isCorrect) existing.correct++
                      typeMap.set(q.type, existing)
                    }
                    return Array.from(typeMap.entries()).map(([type, data]) => {
                      const pct = Math.round((data.correct / data.total) * 100)
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{questionTypeLabels[type] || type}</span>
                            <span className="text-muted-foreground">{data.correct}/{data.total} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className={`h-full rounded-full ${
                                pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {report.percentage < 60 ? (
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#008751]/10 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-[#008751]" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      {report.percentage < 60 ? 'Focus Areas' : 'Great Progress!'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{report.recommendation}</p>
                    {report.weaknesses.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Review questions: {report.weaknesses.map(w => `Q${w.questionNumber}`).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-3 pt-2"
      >
        <Button
          variant="outline"
          className="flex-1 rounded-full h-10"
          onClick={onRetry}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          className="flex-1 rounded-full h-10 bg-[#008751] hover:bg-[#008751]/90"
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  )
}
