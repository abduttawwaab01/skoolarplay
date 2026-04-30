'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ChevronLeft, Search, Filter, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface Course {
  id: string
  title: string
  description: string | null
  icon: string | null
  color: string | null
  difficulty: string
  category: { id: string; name: string; icon: string | null }
  totalModules: number
  totalLessons: number
  enrollmentCount: number
  isEnrolled: boolean
  progress: number
  isPremium: boolean
}

export function CoursesPage() {
  const { params, navigateTo, goBack } = useAppStore()
  const { user } = useAuthStore()
  const playClick = useSoundEffect('click')
  
  const categoryId = params?.categoryId as string | undefined
  const categoryName = params?.categoryName as string | undefined
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (categoryId) queryParams.set('categoryId', categoryId)
        
        const res = await fetch(`/api/courses?${queryParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setCourses(data.courses || [])
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [categoryId])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || 
      course.difficulty === selectedDifficulty
    return matchesSearch && matchesDifficulty
  })

  const difficultyColors: Record<string, string> = {
    BEGINNER: 'bg-green-100 text-green-700 border-green-200',
    INTERMEDIATE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ADVANCED: 'bg-red-100 text-red-700 border-red-200',
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => { playClick(); goBack() }} className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            📚 {categoryName || 'All Courses'}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          {filteredCourses.length} courses available
        </p>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search courses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(diff => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => { playClick(); setSelectedDifficulty(diff) }}
              className="rounded-full"
            >
              {diff === 'all' ? 'All Levels' : diff.charAt(0) + diff.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">No courses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full cursor-pointer"
                onClick={() => { playClick(); navigateTo('course', { courseId: course.id }) }}
              >
                <div 
                  className="p-4 text-white relative overflow-hidden"
                  style={{ background: course.color ? `linear-gradient(135deg, ${course.color}, ${course.color}dd)` : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <div className="text-3xl mb-2">{course.icon || '📚'}</div>
                    <Badge className={`text-[10px] rounded-full border-0 ${difficultyColors[course.difficulty] || ''} bg-white/20 text-white`}>
                      {course.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {course.description || 'Learn this subject with our comprehensive course'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.totalModules} modules, {course.totalLessons} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.enrollmentCount}
                    </div>
                  </div>
                  {course.isEnrolled && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-primary">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
