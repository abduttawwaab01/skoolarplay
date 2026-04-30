'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, CheckCircle, XCircle, Eye, Clock, FileText, BookOpen, Award, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { useSoundEffect } from '@/hooks/use-sound'

type AppStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  PENDING: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle, label: 'Rejected' },
}

export function AdminTeacherAppsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppStatus>('ALL')
  const [selected, setSelected] = useState<any>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchApps()
  }, [])

  const fetchApps = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/teacher-applications')
      if (res.ok) {
        const data = await res.json()
        setApps(data.applications || data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredApps = useMemo(() => {
    if (activeTab === 'ALL') return apps
    return apps.filter((app: any) => app.status === activeTab)
  }, [apps, activeTab])

  const statusCounts = useMemo(() => ({
    ALL: apps.length,
    PENDING: apps.filter((a: any) => a.status === 'PENDING').length,
    APPROVED: apps.filter((a: any) => a.status === 'APPROVED').length,
    REJECTED: apps.filter((a: any) => a.status === 'REJECTED').length,
  }), [apps])

  const handleAction = async () => {
    if (!confirmAction) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/teacher-applications/${confirmAction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: confirmAction.action }),
      })
      if (res.ok) {
        fetchApps()
        if (selected?.id === confirmAction.id) {
          setSelected(null)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const parseSubjects = (subjects: string | null | undefined): string[] => {
    if (!subjects) return []
    try {
      return JSON.parse(subjects)
    } catch {
      return [subjects]
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" /> Teacher Applications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage teacher applications and approvals</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as AppStatus[]).map((status) => {
          const count = statusCounts[status]
          return (
            <Button
              key={status}
              variant={activeTab === status ? 'default' : 'outline'}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => { playClick(); setActiveTab(status) }}
            >
              <Filter className="w-3 h-3" />
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              <Badge
                variant="secondary"
                className="h-5 min-w-5 px-1.5 text-[10px] rounded-full"
              >
                {count}
              </Badge>
            </Button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-48" /></Card>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredApps.map((app: any, i: number) => {
            const config = statusConfig[app.status] || statusConfig.PENDING
            const StatusIcon = config.icon
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {app.teacher?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <CardTitle className="text-base">{app.teacher?.name || 'Unknown'}</CardTitle>
                          <p className="text-xs text-muted-foreground">{app.teacher?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={`text-[10px] rounded-full border ${config.color}`}>
                          <StatusIcon className="w-3 h-3 mr-0.5" />
                          {config.label}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(app)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {app.teacher?.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.teacher.bio}</p>
                    )}
                    {app.teacher?.subjects && (
                      <div className="flex flex-wrap gap-1">
                        {parseSubjects(app.teacher.subjects).map((subject: string) => (
                          <Badge key={subject} variant="outline" className="text-[10px]">{subject}</Badge>
                        ))}
                      </div>
                    )}
                    {app.experience && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Award className="w-3 h-3" />
                        <span>{app.experience}</span>
                      </div>
                    )}
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          className="gap-1 rounded-full"
                          onClick={() => { playClick(); setConfirmAction({ id: app.id, action: 'approve' }) }}
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 rounded-full"
                          onClick={() => { playClick(); setConfirmAction({ id: app.id, action: 'reject' }) }}
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* View Application Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review the teacher application from {selected.teacher?.name || 'Unknown'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                {/* Applicant Info */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {selected.teacher?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{selected.teacher?.name}</p>
                    <p className="text-muted-foreground">{selected.teacher?.email}</p>
                    {selected.status && (
                      <Badge className={`text-[10px] rounded-full border mt-1 ${statusConfig[selected.status]?.color || ''}`}>
                        {statusConfig[selected.status]?.icon && (() => {
                          const Icon = statusConfig[selected.status]!.icon
                          return <Icon className="w-3 h-3 mr-0.5 inline" />
                        })()}
                        {statusConfig[selected.status]?.label || selected.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Bio
                  </h4>
                  <p className="text-muted-foreground">{selected.teacher?.bio || 'No bio provided'}</p>
                </div>

                {/* Subjects */}
                {selected.teacher?.subjects && (
                  <div>
                    <h4 className="font-medium mb-1.5 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Subjects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {parseSubjects(selected.teacher.subjects).map((subject: string) => (
                        <Badge key={subject} variant="outline" className="text-xs">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selected.experience && (
                  <div>
                    <h4 className="font-medium mb-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Experience
                    </h4>
                    <p className="text-muted-foreground">{selected.experience}</p>
                  </div>
                )}

                {/* Reason */}
                {selected.reason && (
                  <div>
                    <h4 className="font-medium mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Why They Want to Teach
                    </h4>
                    <p className="text-muted-foreground">{selected.reason}</p>
                  </div>
                )}

                {/* Sample Lesson */}
                {(selected.sampleTitle || selected.sampleDescription) && (
                  <div>
                    <h4 className="font-medium mb-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Sample Lesson
                    </h4>
                    {selected.sampleTitle && (
                      <p className="font-medium text-muted-foreground">{selected.sampleTitle}</p>
                    )}
                    {selected.sampleDescription && (
                      <p className="text-muted-foreground mt-1">{selected.sampleDescription}</p>
                    )}
                  </div>
                )}

                {/* Applied Date */}
                {selected.createdAt && (
                  <p className="text-[11px] text-muted-foreground">
                    Applied: {new Date(selected.createdAt).toLocaleDateString('en-NG', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}

                {/* Actions */}
                {selected.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="gap-1.5 rounded-full"
                      onClick={() => { playClick(); setConfirmAction({ id: selected.id, action: 'approve' }) }}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve Application
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-1.5 rounded-full"
                      onClick={() => { playClick(); setConfirmAction({ id: selected.id, action: 'reject' }) }}
                    >
                      <XCircle className="w-4 h-4" /> Reject Application
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'approve' ? 'Approve Application' : 'Reject Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.action === 'approve'
                ? 'Are you sure you want to approve this teacher application? The applicant will be able to create courses and earn income.'
                : 'Are you sure you want to reject this teacher application? The applicant will be notified of the rejection.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={actionLoading}
              className={confirmAction?.action === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {actionLoading ? 'Processing...' : confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
