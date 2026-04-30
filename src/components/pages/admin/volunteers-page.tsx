'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Volunteer {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Volunteer | null>(null)
  const [formName, setFormName] = useState('')
  const [formOrder, setFormOrder] = useState(0)

  const fetchVolunteers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/volunteers')
      if (res.ok) {
        const data = await res.json()
        setVolunteers(data.volunteers || [])
      }
    } catch {
      toast.error('Failed to fetch volunteers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVolunteers() }, [fetchVolunteers])

  const openNew = () => {
    setEditingVolunteer(null)
    setFormName('')
    setFormOrder(volunteers.length)
    setDialogOpen(true)
  }

  const openEdit = (v: Volunteer) => {
    setEditingVolunteer(v)
    setFormName(v.name)
    setFormOrder(v.displayOrder)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Name is required')
      return
    }
    try {
      const url = editingVolunteer ? `/api/admin/volunteers/${editingVolunteer.id}` : '/api/admin/volunteers'
      const method = editingVolunteer ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, displayOrder: formOrder }),
      })
      if (res.ok) {
        toast.success(editingVolunteer ? 'Volunteer updated' : 'Volunteer created')
        setDialogOpen(false)
        fetchVolunteers()
      }
    } catch {
      toast.error('Failed to save volunteer')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/volunteers/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Volunteer deleted')
        setDeleteTarget(null)
        fetchVolunteers()
      }
    } catch {
      toast.error('Failed to delete volunteer')
    }
  }

  const handleToggle = async (v: Volunteer) => {
    try {
      const res = await fetch(`/api/admin/volunteers/${v.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !v.isActive }),
      })
      if (res.ok) {
        toast.success(v.isActive ? 'Volunteer hidden' : 'Volunteer shown')
        fetchVolunteers()
      }
    } catch {
      toast.error('Failed to update volunteer')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Volunteers</h2>
          <p className="text-muted-foreground">Manage volunteer names displayed in the marquee</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Volunteer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{volunteers.length}</div>
            <div className="text-sm text-muted-foreground">Total Volunteers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{volunteers.filter(v => v.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">{volunteers.filter(v => !v.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Hidden</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}><div className="h-20 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ) : volunteers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No volunteers added yet</TableCell></TableRow>
              ) : (
                volunteers.sort((a, b) => a.displayOrder - b.displayOrder).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>
                      {v.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted">Hidden</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggle(v)} title={v.isActive ? 'Hide' : 'Show'}>
                          {v.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(v)} title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(v)} title="Delete">
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVolunteer ? 'Edit Volunteer' : 'Add Volunteer'}</DialogTitle>
            <DialogDescription>Enter the volunteer name to display</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input type="number" value={formOrder} onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingVolunteer ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Volunteer</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deleteTarget?.name}"?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}