'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  ArrowLeft,
  ChevronRight,
  Swords,
  Crown,
  Sparkles,
  BookOpen,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'

interface Group {
  id: string
  name: string
  description: string | null
  icon: string | null
  maxMembers: number
  memberCount: number
  activeChallenges: number
  createdAt: string
  creator: { id: string; name: string; avatar: string | null }
  userRole?: string
  members: Array<{ user: { id: string; name: string; avatar: string | null; xp: number } }>
}

const iconOptions = ['📚', '🧪', '🧮', '🌍', '💻', '🎨', '📊', '🔬', '🏛️', '⚡', '🎯', '🏆', '🎵', '🚀', '🧩', '🧬']

export function StudyGroupsPage() {
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', icon: '📚', maxMembers: 50 })
  const [joining, setJoining] = useState<string | null>(null)
  const { goBack, navigateTo } = useAppStore()
  const playClick = useSoundEffect('click')

  useEffect(() => {
    fetchMyGroups()
    fetchDiscoverGroups()
  }, [])

  const fetchMyGroups = async () => {
    try {
      const res = await fetch('/api/groups?mine=true')
      if (res.ok) {
        const data = await res.json()
        setMyGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch my groups:', error)
    }
  }

  const fetchDiscoverGroups = async (search?: string) => {
    try {
      const params = new URLSearchParams({ discover: 'true' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/groups?${params}`)
      if (res.ok) {
        const data = await res.json()
        setDiscoverGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch discover groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    if (activeTab === 'discover') {
      fetchDiscoverGroups(value)
    }
  }

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      if (res.ok) {
        setCreateOpen(false)
        setCreateForm({ name: '', description: '', icon: '📚', maxMembers: 50 })
        fetchMyGroups()
        setActiveTab('my')
        toast.success('Group created successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create group')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      toast.error('Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (groupId: string) => {
    setJoining(groupId)
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' })
      if (res.ok) {
        fetchMyGroups()
        fetchDiscoverGroups(searchQuery)
        toast.success('Joined group successfully!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to join group')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
      toast.error('Failed to join group')
    } finally {
      setJoining(null)
    }
  }

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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Study Groups
          </h1>
          <p className="text-sm text-muted-foreground">Learn together, grow together</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary hover:bg-primary/90 gap-1.5">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Group</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Group Name *</Label>
                <Input
                  placeholder="e.g., WAEC Maths Warriors"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="What's this group about?"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="mt-1.5 rounded-xl"
                  rows={3}
                />
              </div>
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setCreateForm({ ...createForm, icon })}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        createForm.icon === icon ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Max Members</Label>
                <Input
                  type="number"
                  min={2}
                  max={100}
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) || 50 })}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <Button
                onClick={handleCreateGroup}
                disabled={creating || !createForm.name.trim()}
                className="w-full rounded-xl"
              >
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'my' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          My Groups ({myGroups.length})
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'discover' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Discover
        </button>
      </motion.div>

      {/* Search (for discover tab) */}
      {activeTab === 'discover' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 rounded-xl bg-muted/50 border-0"
          />
        </motion.div>
      )}

      {/* Groups List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : activeTab === 'my' ? (
          myGroups.length === 0 ? (
            <motion.div
              key="my-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="font-semibold mb-1">No groups yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join a group or create your own to start learning together!
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('discover')}
                      className="rounded-full"
                    >
                      <Search className="w-4 h-4 mr-1.5" />
                      Discover Groups
                    </Button>
                    <Button
                      onClick={() => setCreateOpen(true)}
                      className="rounded-full bg-primary hover:bg-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Create Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="my-groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 md:grid-cols-2">
              {myGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full"
                    onClick={() => navigateTo('study-group', { groupId: group.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                          {group.icon || '📚'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                            {group.userRole === 'ADMIN' && (
                              <Badge className="text-[9px] rounded-full bg-yellow-500/10 text-yellow-600 border-0 h-4 px-1.5">
                                <Crown className="w-2.5 h-2.5 mr-0.5" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {group.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.memberCount}/{group.maxMembers}
                            </span>
                            {group.activeChallenges > 0 && (
                              <span className="text-[11px] text-purple-600 flex items-center gap-1">
                                <Swords className="w-3 h-3" />
                                {group.activeChallenges} challenge{group.activeChallenges > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : discoverGroups.length === 0 ? (
          <motion.div
            key="discover-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-semibold mb-1">No groups found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? `No groups matching "${searchQuery}"` : 'Be the first to create a group!'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="discover-groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 md:grid-cols-2">
            {discoverGroups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                        {group.icon || '📚'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {group.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {group.memberCount}/{group.maxMembers}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            by {group.creator.name}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={joining === group.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoin(group.id)
                        }}
                        className="rounded-full text-xs h-8 shrink-0"
                      >
                        {joining === group.id ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
