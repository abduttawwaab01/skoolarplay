'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, MessageSquare, Heart, Gift, MoreHorizontal, Search, Filter } from 'lucide-react'
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

interface FeedPost {
  id: string
  content: string
  visibility: string
  isApproved: boolean
  isHidden: boolean
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    avatar: string | null
    isPremium: boolean
  }
  _count: {
    likes: number
    comments: number
    reports: number
  }
}

interface FeedPost {
  id: string
  content: string
  visibility: string
  isApproved: boolean
  isHidden: boolean
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string
    email: string
    avatar: string | null
    isPremium: boolean
  }
  _count: {
    likes: number
    comments: number
    reports: number
  }
}

export function AdminFeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, hidden: 0, reported: 0 })
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'HIDDEN'>('ALL')

  const [createDialog, setCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({ content: '', visibility: 'PUBLIC' })

  const [rewardDialog, setRewardDialog] = useState(false)
  const [rewardUser, setRewardUser] = useState<{id: string; name: string; email: string; avatar: string | null; gems?: number} | null>(null)
  const [rewardAmount, setRewardAmount] = useState(10)
  const [rewardReason, setRewardReason] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/feed?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
        if (data.stats) setStats(data.stats)
      }
    } catch {
      toast.error('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleApprove = async (postId: string) => {
    try {
      const res = await fetch(`/api/admin/feed/${postId}/approve`, { method: 'POST' })
      if (res.ok) {
        toast.success('Post approved')
        fetchPosts()
      }
    } catch {
      toast.error('Failed to approve post')
    }
  }

  const handleHide = async (postId: string, hide: boolean) => {
    try {
      const res = await fetch(`/api/admin/feed/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: hide }),
      })
      if (res.ok) {
        toast.success(hide ? 'Post hidden' : 'Post restored')
        fetchPosts()
      }
    } catch {
      toast.error('Failed to update post')
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/admin/feed/${postId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Post deleted')
        fetchPosts()
      }
    } catch {
      toast.error('Failed to delete post')
    }
  }

  const handleReward = async () => {
    if (!rewardUser) return
    try {
      const res = await fetch('/api/admin/users/adjust-gems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rewardUser.id,
          amount: rewardAmount,
          reason: rewardReason || 'Reward from admin',
          action: 'add',
        }),
      })
      if (res.ok) {
        toast.success(`Gifted ${rewardAmount} gems to ${rewardUser.name}`)
        setRewardDialog(false)
        setRewardUser(null)
        setRewardAmount(10)
        setRewardReason('')
      }
    } catch {
      toast.error('Failed to reward user')
    }
  }

  const openReward = (post: FeedPost) => {
    setRewardUser(post.author)
    setRewardDialog(true)
  }

  const handleCreatePost = async () => {
    if (!createForm.content.trim()) {
      toast.error('Post content is required')
      return
    }
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: createForm.content,
          visibility: createForm.visibility,
          isApproved: true, // Admin posts auto-approved
        }),
      })
      if (res.ok) {
        toast.success('Post created successfully')
        setCreateDialog(false)
        setCreateForm({ content: '', visibility: 'PUBLIC' })
        fetchPosts()
      }
    } catch {
      toast.error('Failed to create post')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.hidden}</div>
            <div className="text-sm text-muted-foreground">Hidden</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.reported}</div>
            <div className="text-sm text-muted-foreground">Reported</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ALL')}>All</Button>
        <Button variant={filter === 'PENDING' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('PENDING')} className="text-amber-600">Pending</Button>
        <Button variant={filter === 'APPROVED' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('APPROVED')} className="text-green-600">Approved</Button>
        <Button variant={filter === 'HIDDEN' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('HIDDEN')} className="text-red-600">Hidden</Button>
        <Button className="ml-auto gap-1" onClick={() => setCreateDialog(true)}>
          <Plus className="w-4 h-4" /> Create Post
        </Button>
      </div>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}><div className="h-20 bg-muted animate-pulse rounded" /></TableCell></TableRow>
              ) : posts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No posts found</TableCell></TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback>{post.author.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{post.author.name}</div>
                          <div className="text-xs text-muted-foreground">{post.author.email}</div>
                        </div>
                        {post.author.isPremium && <Badge variant="outline" className="text-[10px] bg-amber-100">Premium</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm">{post.content}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post._count.likes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post._count.comments}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {!post.isApproved && <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-800">Pending</Badge>}
                        {post.isHidden && <Badge variant="outline" className="text-[10px] bg-red-100 text-red-800">Hidden</Badge>}
                        {post.isApproved && !post.isHidden && <Badge variant="outline" className="text-[10px] bg-green-100 text-green-800">Approved</Badge>}
                        {post._count.reports > 0 && <Badge variant="outline" className="text-[10px] bg-orange-100 text-orange-800">{post._count.reports} Reports</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {!post.isApproved && <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => handleApprove(post.id)} title="Approve"><Check className="w-3.5 h-3.5" /></Button>}
                        {post.isApproved && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleHide(post.id, !post.isHidden)} title={post.isHidden ? 'Restore' : 'Hide'}>{post.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</Button>}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600" onClick={() => openReward(post)} title="Gift Gems"><Gift className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(post.id)} title="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Create a new announcement post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} placeholder="What's on your mind?" rows={5} />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={createForm.visibility} onValueChange={(v) => setCreateForm({ ...createForm, visibility: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public - Everyone can see</SelectItem>
                  <SelectItem value="FOLLOWERS_ONLY">Followers Only</SelectItem>
                  <SelectItem value="PRIVATE">Private - Only you</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePost}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Gems Dialog */}
      <Dialog open={rewardDialog} onOpenChange={setRewardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gift Gems</DialogTitle>
            <DialogDescription>Reward {rewardUser?.name} for their post</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={rewardUser?.avatar || undefined} />
                  <AvatarFallback>{rewardUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{rewardUser?.name}</div>
                  <div className="text-xs text-muted-foreground">Current gems: {rewardUser?.gems}</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" value={rewardAmount} onChange={(e) => setRewardAmount(parseInt(e.target.value) || 0)} min={1} max={10000} />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input value={rewardReason} onChange={(e) => setRewardReason(e.target.value)} placeholder="e.g., Great post!" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialog(false)}>Cancel</Button>
            <Button onClick={handleReward}>Gift {rewardAmount} Gems</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}