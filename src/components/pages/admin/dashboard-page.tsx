'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Gem, Activity, Plus, Megaphone, Shield, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'

interface AnalyticsData {
  stats: {
    totalUsers: number
    newUsersThisWeek: number
    activeCourses: number
    totalRevenue: number
    dailyActiveUsers: number
  }
  registrationData: { date: string; count: number }[]
  topCourses: { id: string; title: string; _count: { enrollments: number }; category: { name: string } }[]
  categoryDistribution: { name: string; enrolled: number }[]
  recentActivity: {
    recentUsers: { id: string; name: string; email: string; createdAt: string }[]
    recentLessons: { user: { name: string }; lesson: { title: string }; completedAt: string }[]
    recentPurchases: { user: { name: string }; shopItem: { title: string; icon: string }; createdAt: string }[]
  }
}

function StatCard({
  icon: Icon,
  title,
  value,
  trend,
  trendLabel,
  color,
}: {
  icon: React.ElementType
  title: string
  value: string | number
  trend?: 'up' | 'down'
  trendLabel?: string
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
              {trend && trendLabel && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                  {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{trendLabel}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Simple SVG-based mini charts since we want to avoid heavy recharts setup
function MiniBarChart({ data, label, color }: { data: { name: string; value: number }[]; label: string; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end gap-2 h-40">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">{d.value}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(d.value / max) * 120}px` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full rounded-t-md ${color} min-h-[4px]`}
              />
              <span className="text-[9px] text-muted-foreground truncate max-w-full">{d.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MiniLineChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const width = 400
  const height = 120
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - (d.count / max) * (height - 10)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#008751" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#008751" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#lineGrad)" />
          <polyline
            points={points}
            fill="none"
            stroke="#008751"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * width}
              cy={height - (d.count / max) * (height - 10)}
              r="3"
              fill="#008751"
              stroke="white"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </CardContent>
    </Card>
  )
}

function MiniPieChart({ data, label }: { data: { name: string; enrolled: number }[]; label: string }) {
  const total = data.reduce((sum, d) => sum + d.enrolled, 0) || 1
  const colors = ['#008751', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899']

  const slices = data.reduce<{ items: any[]; cum: number }>((acc, d, i) => {
    const start = acc.cum
    const pct = d.enrolled / total
    if (pct > 0) {
      acc.items.push({ ...d, pct, start, color: colors[i % colors.length] })
    }
    acc.cum += pct
    return acc
  }, { items: [], cum: 0 }).items

  const radius = 45
  const circumference = 2 * Math.PI * radius

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-6">
          <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
            {slices.map((slice, i) => {
              const dashArray = `${slice.pct * circumference} ${circumference}`
              const dashOffset = -(slice.start * circumference)
              return (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500"
                />
              )
            })}
            <text x="60" y="60" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-sm font-bold">
              {total}
            </text>
          </svg>
          <div className="space-y-2 min-w-0">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="truncate text-muted-foreground">{slice.name}</span>
                <span className="font-medium ml-auto shrink-0">{Math.round(slice.pct * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const { navigateTo } = useAppStore()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <Card className="p-8 text-center text-muted-foreground">Failed to load dashboard data</Card>
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-3"
      >
        <Button onClick={() => navigateTo('admin-courses')} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Course
        </Button>
        <Button variant="outline" onClick={() => navigateTo('admin-announcements')} className="gap-2">
          <Megaphone className="w-4 h-4" />
          Send Announcement
        </Button>
        <Button variant="outline" onClick={() => navigateTo('admin-users')} className="gap-2">
          <Shield className="w-4 h-4" />
          Manage Users
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={data.stats.totalUsers}
          trend={data.stats.newUsersThisWeek > 0 ? 'up' : undefined}
          trendLabel={`+${data.stats.newUsersThisWeek} this week`}
          color="bg-primary"
        />
        <StatCard
          icon={BookOpen}
          title="Active Courses"
          value={data.stats.activeCourses}
          color="bg-blue-500"
        />
        <StatCard
          icon={Gem}
          title="Total Revenue"
          value={`${data.stats.totalRevenue} 💎`}
          color="bg-amber-500"
        />
        <StatCard
          icon={Activity}
          title="Daily Active Users"
          value={data.stats.dailyActiveUsers}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniLineChart data={data.registrationData} label="User Registrations (Last 30 Days)" />
        <MiniBarChart
          data={data.topCourses.map(c => ({ name: c.title.length > 12 ? c.title.slice(0, 12) + '…' : c.title, value: c._count.enrollments }))}
          label="Top Courses by Enrollment"
          color="bg-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MiniPieChart data={data.categoryDistribution} label="Users by Category" />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="users">
                <TabsList className="w-full">
                  <TabsTrigger value="users" className="flex-1">Registrations</TabsTrigger>
                  <TabsTrigger value="lessons" className="flex-1">Lessons</TabsTrigger>
                  <TabsTrigger value="purchases" className="flex-1">Purchases</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentActivity.recentUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="lessons">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentActivity.recentLessons.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{p.user.name}</TableCell>
                          <TableCell>{p.lesson.title}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="purchases">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentActivity.recentPurchases.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{p.user.name}</TableCell>
                          <TableCell>
                            <span className="mr-1">{p.shopItem.icon}</span>
                            {p.shopItem.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
