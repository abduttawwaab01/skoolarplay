'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, Users, MessageSquare, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface StudyGroup {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  isPrivate: boolean
  isActive: boolean
  memberCount: number
  messageCount: number
  challengeCount: number
  createdAt: string
  creator: {
    id: string
    name: string
    avatar: string | null
  }
}

export function AdminGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '20')
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/groups?${params}`)
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups || [])
        setTotal(data.pagination?.total || 0)
      }
    } catch {
      toast.error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const handleDelete = async () => {
    if (!selectedGroup) return
    try {
      const res = await fetch(`/api/admin/groups/${selectedGroup.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Group deleted')
        setDeleteDialog(false)
        setSelectedGroup(null)
        fetchGroups()
      }
    } catch {
      toast.error('Failed to delete group')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm text-muted-foreground">Total Groups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{groups.filter(g => g.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active Groups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{groups.reduce((acc, g) => acc + g.memberCount, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Groups Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}><div className="h-20 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ) : groups.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No groups found</TableCell></TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-10 h-10 rounded-lg">
                          <AvatarImage src={group.coverImage || undefined} />
                          <AvatarFallback className="rounded-lg">{group.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{group.description || 'No description'}</div>
                        </div>
                        {group.isPrivate && <Badge variant="outline" className="text-[10px]">Private</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={group.creator.avatar || undefined} />
                          <AvatarFallback className="text-xs">{group.creator.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{group.creator.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.memberCount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {group.messageCount}</div>
                    </TableCell>
                    <TableCell>
                      {group.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(group.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedGroup(group)} title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setSelectedGroup(group); setDeleteDialog(true) }} title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Group</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{selectedGroup?.name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}