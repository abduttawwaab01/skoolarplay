'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Users,
  BookOpen,
  CheckCircle,
  GraduationCap,
  ChevronRight,
  Award,
  TrendingUp,
  Search,
  Filter,
  X,
} from 'lucide-react'
import { subjectColors, StarRating } from '@/components/shared/teacher-components'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'

interface Teacher {
  id: string
  userId: string
  bio: string | null
  subjects: string
  rating: number
  totalStudents: number
  totalCourses: number
  isVerified: boolean
  user: {
    id: string
    name: string
    avatar: string | null
  }
}

export function TeacherMarketplacePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const { goBack, navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers')
      if (res.ok) {
        const data = await res.json()
        setTeachers(data.teachers || [])
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Extract all unique subjects
  const allSubjects = useMemo(() => {
    const subjectSet = new Set<string>()
    teachers.forEach((teacher) => {
      try {
        const subjects = JSON.parse(teacher.subjects) as string[]
        subjects.forEach((s) => subjectSet.add(s))
      } catch {
        subjectSet.add(teacher.subjects)
      }
    })
    return Array.from(subjectSet).sort()
  }, [teachers])

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        !searchQuery.trim() ||
        teacher.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.bio?.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesSubject = true
      if (selectedSubject) {
        try {
          const subjects = JSON.parse(teacher.subjects) as string[]
          matchesSubject = subjects.includes(selectedSubject)
        } catch {
          matchesSubject = teacher.subjects === selectedSubject
        }
      }

      return matchesSearch && matchesSubject
    })
  }, [teachers, searchQuery, selectedSubject])

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">👨‍🏫 Teacher Marketplace</h1>
          <p className="text-sm text-muted-foreground">Learn from the best educators in Nigeria</p>
        </div>
        <Button
          onClick={() => { playClick(); navigateTo('teacher-application') }}
          className="rounded-full bg-primary hover:bg-primary/90 gap-1.5"
        >
          <GraduationCap className="w-4 h-4" />
          <span className="hidden sm:inline">Become a Teacher</span>
        </Button>
      </motion.div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-yellow-500/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold mb-2">Share Your Knowledge 🌟</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Join hundreds of Nigerian educators making a difference. Create courses, earn income, and inspire the next generation of leaders.
                </p>
                <Button
                  onClick={() => { playClick(); navigateTo('teacher-application') }}
                  className="rounded-full bg-primary hover:bg-primary/90"
                >
                  Apply to Teach
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-card rounded-xl shadow-sm">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold">{teachers.length}+</p>
                  <p className="text-[11px] text-muted-foreground">Active Teachers</p>
                </div>
                <div className="text-center p-3 bg-card rounded-xl shadow-sm">
                  <Users className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">
                    {teachers.reduce((acc, t) => acc + t.totalStudents, 0)}+
                  </p>
                  <p className="text-[11px] text-muted-foreground">Students Taught</p>
                </div>
                <div className="text-center p-3 bg-card rounded-xl shadow-sm">
                  <BookOpen className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">
                    {teachers.reduce((acc, t) => acc + t.totalCourses, 0)}+
                  </p>
                  <p className="text-[11px] text-muted-foreground">Courses</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <Button
            variant={selectedSubject === null ? 'default' : 'outline'}
            size="sm"
            className="rounded-full shrink-0 h-7 text-xs"
            onClick={() => { playClick(); setSelectedSubject(null) }}
          >
            <Filter className="w-3 h-3 mr-1" />
            All
          </Button>
          {allSubjects.map((subject) => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? 'default' : 'outline'}
              size="sm"
              className="rounded-full shrink-0 h-7 text-xs"
              onClick={() => { playClick(); setSelectedSubject(selectedSubject === subject ? null : subject) }}
            >
              {subject}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Featured Teachers */}
      {!loading && filteredTeachers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            {selectedSubject || searchQuery ? `Results (${filteredTeachers.length})` : 'Featured Teachers'}
          </h2>
        </motion.div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filteredTeachers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">
              {searchQuery || selectedSubject ? '🔍' : '👨‍🏫'}
            </div>
            <h3 className="font-semibold mb-1">
              {searchQuery || selectedSubject ? 'No teachers found' : 'No teachers yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || selectedSubject
                ? 'Try a different search or filter.'
                : 'Be the first to join our marketplace of educators!'}
            </p>
            {(searchQuery || selectedSubject) && (
              <Button
                variant="outline"
                onClick={() => { setSearchQuery(''); setSelectedSubject(null) }}
                className="rounded-full"
              >
                Clear Filters
              </Button>
            )}
            {!searchQuery && !selectedSubject && (
              <Button
                onClick={() => { playClick(); navigateTo('teacher-application') }}
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                Become a Teacher
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredTeachers.map((teacher, i) => {
            let subjects: string[] = []
            try {
              subjects = JSON.parse(teacher.subjects)
            } catch {
              subjects = [teacher.subjects]
            }

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="relative">
                        <Avatar className="w-14 h-14 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                            {teacher.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {teacher.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm">{teacher.user.name}</h3>
                        {teacher.isVerified && (
                          <Badge className="text-[9px] rounded-full bg-primary/10 text-primary border-0 mt-0.5">
                            <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                            Verified
                          </Badge>
                        )}
                        <StarRating rating={teacher.rating} />
                      </div>
                    </div>

                    {teacher.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{teacher.bio}</p>
                    )}

                    {/* Subjects */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {subjects.map((subject) => {
                        const colorClass = subjectColors[subject] || 'bg-muted text-muted-foreground'
                        return (
                          <Badge key={subject} variant="secondary" className={`text-[10px] rounded-full ${colorClass} border-0`}>
                            {subject}
                          </Badge>
                        )
                      })}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-medium">{teacher.totalStudents}</span>
                        <span>students</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-medium">{teacher.totalCourses}</span>
                        <span>courses</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-3 rounded-full text-xs h-8"
                      onClick={() => { playClick(); navigateTo('teacher-profile', { teacherId: teacher.id }) }}
                    >
                      View Profile
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
