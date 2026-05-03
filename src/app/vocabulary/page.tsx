'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Zap, Gem, Globe, ChevronRight, ChevronLeft, Lock, CheckCircle, Clock, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import Link from 'next/link'

interface VocabularySet {
  id: string
  title: string
  description: string | null
  language: string
  difficulty: string
  level: string | null
  xpReward: number
  gemReward: number
  isPremium: boolean
  totalWords: number
  progress: {
    wordsCompleted: number
    correctCount: number
    totalAttempts: number
    bestStreak: number
    completed: boolean
    lastPracticedAt: string
  } | null
}

const languageNames: Record<string, string> = {
  en: 'English',
  yo: 'Yoruba',
  ig: 'Igbo',
  ha: 'Hausa',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  pt: 'Portuguese',
  ar: 'Arabic',
}

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  ADVANCED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function VocabularyPage() {
  const { navigateTo, goBack } = useAppStore()
  const { user } = useAuthStore()
  const [sets, setSets] = useState<VocabularySet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const languages = [...new Set(sets.map(s => s.language))]

  useEffect(() => {
    fetchSets()
  }, [])

  const fetchSets = async () => {
    try {
      const res = await fetch('/api/vocabulary')
      if (res.ok) {
        const data = await res.json()
        setSets(data.sets || [])
      }
    } catch (error) {
      console.error('Failed to fetch vocabulary sets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSets = sets.filter(set => {
    if (selectedLanguage !== 'all' && set.language !== selectedLanguage) return false
    if (selectedDifficulty !== 'all' && set.difficulty !== selectedDifficulty) return false
    if (selectedLevel !== 'all' && set.level !== selectedLevel) return false
    return true
  })

  const completedSets = filteredSets.filter(s => s.progress?.completed).length
  const inProgressSets = filteredSets.filter(s => s.progress && !s.progress.completed).length

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Vocabulary</h1>
              <p className="text-muted-foreground">Expand your word power</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold">{completedSets}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{inProgressSets}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{sets.length}</p>
                <p className="text-xs text-muted-foreground">Total Sets</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-background text-sm"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {languageNames[lang] || lang}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-background text-sm"
          >
            <option value="all">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="border rounded-lg px-3 py-2 bg-background text-sm"
          >
            <option value="all">All CEFR Levels</option>
            <option value="A1">A1 - Beginner</option>
            <option value="A2">A2 - Elementary</option>
            <option value="B1">B1 - Intermediate</option>
            <option value="B2">B2 - Upper Intermediate</option>
            <option value="C1">C1 - Advanced</option>
            <option value="C2">C2 - Mastery</option>
          </select>
        </div>

        {/* Sets List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Vocabulary Sets Found</h3>
              <p className="text-muted-foreground">
                {sets.length === 0
                  ? 'Vocabulary sets are coming soon!'
                  : 'Try adjusting your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSets.map((set, index) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <Link href={`/vocabulary/${set.id}`} className="block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {set.title}
                            </h3>
                            {set.isPremium && (
                              <Badge variant="outline" className="text-amber-500 border-amber-500">
                                <Gem className="w-3 h-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            <Badge variant="outline" className={difficultyColors[set.difficulty]}>
                              {set.difficulty}
                            </Badge>
                          </div>
                          
                          {set.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {set.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {languageNames[set.language] || set.language}
                            </span>
                            <span>{set.totalWords} words</span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-primary" />
                              +{set.xpReward} XP
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {set.progress?.completed ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                          ) : set.progress ? (
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {set.progress.wordsCompleted}/{set.totalWords}
                              </p>
                              <p className="text-xs text-muted-foreground">words mastered</p>
                            </div>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>

                      {set.progress && !set.progress.completed && (
                        <div className="mt-3">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{
                                width: `${(set.progress.wordsCompleted / set.totalWords) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}