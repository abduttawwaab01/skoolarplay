'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Shield,
  Settings,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  HeadphonesIcon
} from 'lucide-react'

interface SupportStats {
  totalUsers: number
  pendingReports: number
  activeToday: number
  newThisWeek: number
}

interface RecentActivity {
  id: string
  type: 'user_report' | 'support_request' | 'system_alert'
  message: string
  createdAt: string
}

const permissionCards = [
  {
    permission: 'users.view',
    icon: Users,
    label: 'View Users',
    description: 'Browse and search user accounts',
    color: 'bg-blue-500',
    page: 'admin-users'
  },
  {
    permission: 'users.edit',
    icon: UserCheck,
    label: 'Edit Users',
    description: 'Update user profile information',
    color: 'bg-blue-600',
    page: 'admin-users'
  },
  {
    permission: 'users.ban',
    icon: Shield,
    label: 'Ban Users',
    description: 'Suspend or ban user accounts',
    color: 'bg-red-500',
    page: 'admin-users'
  },
  {
    permission: 'announcements.send',
    icon: MessageSquare,
    label: 'Announcements',
    description: 'Send platform announcements',
    color: 'bg-purple-500',
    page: 'admin-announcements'
  },
  {
    permission: 'reports.view',
    icon: FileText,
    label: 'View Reports',
    description: 'Access user reports and issues',
    color: 'bg-amber-500',
    page: 'admin-users'
  },
  {
    permission: 'analytics.view',
    icon: BarChart3,
    label: 'View Analytics',
    description: 'Access platform analytics',
    color: 'bg-green-500',
    page: 'admin'
  },
]

export default function SupportDashboardPage() {
  const { user } = useAuthStore()
  const { navigateTo } = useAppStore()
  const [stats, setStats] = useState<SupportStats>({
    totalUsers: 0,
    pendingReports: 0,
    activeToday: 0,
    newThisWeek: 0
  })
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch permissions
        const permRes = await fetch('/api/admin/support-agent/permissions')
        if (permRes.ok) {
          const permData = await permRes.json()
          setPermissions(permData.permissions || [])
        }

        // Fetch stats
        const statsRes = await fetch('/api/admin/support-agent/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch support data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const hasPermission = (perm: string) => permissions.includes(perm)

  const navigateToPage = (page: string) => {
    navigateTo(page as any)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Support Agent'}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <HeadphonesIcon className="w-4 h-4 mr-2" />
          Support Agent
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-10 h-10 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-3xl font-bold">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Today</p>
                  <p className="text-3xl font-bold">{stats.activeToday.toLocaleString()}</p>
                </div>
                <UserCheck className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                  <p className="text-3xl font-bold">{stats.newThisWeek}</p>
                </div>
                <Shield className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {permissions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No permissions assigned yet.</p>
              ) : (
                permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">{perm}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hasPermission('users.view') && (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigateToPage('admin-users')}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Browse Users
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {hasPermission('announcements.send') && (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigateToPage('admin-announcements')}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Announcement
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {hasPermission('analytics.view') && (
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigateToPage('admin')}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
            {!hasPermission('users.view') && !hasPermission('announcements.send') && !hasPermission('analytics.view') && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No quick actions available. Contact admin for permissions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Features */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissionCards
            .filter((card) => hasPermission(card.permission))
            .map((card, index) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.permission}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigateToPage(card.page)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`${card.color} p-3 rounded-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{card.label}</h3>
                          <p className="text-sm text-muted-foreground">{card.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
