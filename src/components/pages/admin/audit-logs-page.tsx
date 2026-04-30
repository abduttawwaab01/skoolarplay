'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  RotateCcw, Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface AuditLog {
  id: string
  actorId: string
  actorName: string
  action: string
  entity: string
  entityId: string
  details: string | null
  ipAddress: string | null
  createdAt: string
}

const actionConfig: Record<string, { color: string; label: string }> = {
  CREATE: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Create' },
  UPDATE: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Update' },
  DELETE: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Delete' },
  BAN: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Ban' },
  APPROVE: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Approve' },
  REJECT: { color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200', label: 'Reject' },
}

const entityOptions = [
  'User', 'Course', 'Question', 'Video', 'Exam', 'Achievement',
  'ShopItem', 'Announcement', 'FeatureFlag', 'Quest', 'BossBattle',
  'Challenge', 'Quote', 'TeacherApplication', 'TeacherPayout', 'Settings',
]

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(entityFilter && { entity: entityFilter }),
        ...(actionFilter && { action: actionFilter }),
      })
      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setTotalPages(data.totalPages)
        setTotal(data.total)
      } else {
        toast.error('Failed to fetch audit logs')
      }
    } catch {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }, [page, entityFilter, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleResetFilters = () => {
    setEntityFilter('')
    setActionFilter('')
    setPage(1)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const parseDetails = (details: string | null): Record<string, unknown> | null => {
    if (!details) return null
    try {
      return JSON.parse(details)
    } catch {
      return null
    }
  }

  const exportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Action', 'Entity', 'Entity ID', 'Details', 'IP Address']
    const rows = logs.map(log => [
      formatTimestamp(log.createdAt),
      log.actorName,
      log.action,
      log.entity,
      log.entityId,
      log.details || '',
      log.ipAddress || '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityOptions.map((entity) => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v === 'all' ? '' : v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(actionConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleResetFilters} className="gap-2 shrink-0">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={exportCSV} className="gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Audit Logs</CardTitle>
            <span className="text-sm text-muted-foreground">{total} total entries</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden md:table-cell">Entity ID</TableHead>
                  <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 opacity-40" />
                        <p>No audit logs found</p>
                        <p className="text-xs">Logs will appear here as admin actions are performed</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, i) => {
                    const config = actionConfig[log.action]
                    const details = parseDetails(log.details)
                    const isExpanded = expandedId === log.id

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpand(log.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{log.actorName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
                            {config?.label || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{log.entity}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono max-w-[120px] truncate">
                          {log.entityId.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {log.ipAddress || '-'}
                        </TableCell>
                      </motion.tr>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Details */}
      <AnimatePresence>
        {expandedId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {(() => {
              const log = logs.find(l => l.id === expandedId)
              if (!log) return null
              const details = parseDetails(log.details)
              return (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Log Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Log ID</p>
                        <p className="text-sm font-mono">{log.id}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Actor</p>
                        <p className="text-sm font-medium">{log.actorName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{log.actorId}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Action</p>
                        <Badge variant="outline" className={actionConfig[log.action]?.color || ''}>
                          {actionConfig[log.action]?.label || log.action}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Entity</p>
                        <p className="text-sm font-medium">{log.entity}</p>
                        <p className="text-xs text-muted-foreground font-mono">{log.entityId}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">IP Address</p>
                        <p className="text-sm">{log.ipAddress || 'Not recorded'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">Timestamp</p>
                        <p className="text-sm">{formatTimestamp(log.createdAt)}</p>
                      </div>
                    </div>
                    {details && Object.keys(details).length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Details</p>
                        <pre className="text-sm bg-background rounded-lg p-3 overflow-x-auto font-mono">
                          {JSON.stringify(details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
