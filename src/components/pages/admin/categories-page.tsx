'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  order: number
  isActive: boolean
  createdAt: string
  _count: { courses: number }
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Category Dialog
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#008751',
  })

  // Delete Dialog
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const openCategoryDialog = (category?: Category) => {
    setEditingCategory(category || null)
    setCategoryForm({
      name: category?.name || '',
      description: category?.description || '',
      icon: category?.icon || '📁',
      color: category?.color || '#008751',
    })
    setCategoryDialog(true)
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error('Name is required')
      return
    }
    if (categoryForm.name.length > 100) {
      toast.error('Name must be 100 characters or less')
      return
    }
    if (categoryForm.description.length > 500) {
      toast.error('Description must be 500 characters or less')
      return
    }

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      })
      if (res.ok) {
        toast.success(editingCategory ? 'Category updated' : 'Category created')
        setCategoryDialog(false)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to save category')
      }
    } catch {
      toast.error('Failed to save category')
    }
  }

  const handleToggleCategory = async (category: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      })
      if (res.ok) {
        toast.success(category.isActive ? 'Category deactivated' : 'Category activated')
        fetchData()
      } else {
        toast.error('Failed to toggle category')
      }
    } catch {
      toast.error('Failed to toggle category')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Category deleted')
        setDeleteTarget(null)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Failed to delete category')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Categories</h2>
          <p className="text-sm text-muted-foreground">{categories.length} total categories</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button onClick={() => openCategoryDialog()} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse"><CardContent className="p-6 h-16" /></Card>
        ))}</div>
      ) : filteredCategories.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          {searchQuery ? 'No categories match your search.' : 'No categories yet. Add your first category!'}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Description</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Courses</th>
                  <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.map((category, i) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`hover:bg-muted/30 transition-colors ${!category.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: (category.color || '#008751') + '20' }}
                        >
                          {category.icon || '📁'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{category.name}</span>
                            {category.color && (
                              <span
                                className="w-3 h-3 rounded-full border shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground md:hidden truncate block max-w-[200px]">
                            {category.description || 'No description'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground truncate block max-w-[300px]">
                        {category.description || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{category._count.courses}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleCategory(category)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openCategoryDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget({ id: category.id, name: category.name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details.' : 'Create a new category to organize courses.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Category name"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground text-right">{categoryForm.name.length}/100</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Category description (optional)"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{categoryForm.description.length}/500</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (emoji)</Label>
                <Input
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="📁"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                    className="flex-1"
                    placeholder="#008751"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>{editingCategory ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
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
