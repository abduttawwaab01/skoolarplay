'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Users,
  Swords,
  Crown,
  Shield,
  Trophy,
  LogOut,
  Share2,
  Star,
  Zap,
  Gem,
  Calendar,
  Target,
  UserPlus,
  MessageCircle,
  X,
  Loader2,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { PlanBadge, getUserTier } from '@/components/shared/plan-badge'
import { UserLink } from '@/components/shared/user-link'

interface Member {
  user: {
    id: string
    name: string
    avatar: string | null
    xp: number
    level: number
    isPremium?: boolean
  }
  role: string
  joinedAt: string
  isPremium?: boolean
  planTier?: string
}

interface Challenge {
  id: string
  title: string
  description: string | null
  targetCount: number
  xpReward: number
  gemReward: number
  startDate: string
  endDate: string
  isActive: boolean
  completions: Array<{ userId: string; progress: number; completed: boolean }>
}

interface GroupData {
  id: string
  name: string
  description: string | null
  icon: string | null
  maxMembers: number
  memberCount: number
  isMember: boolean
  userRole: string | null
  leaderboard: Array<{ userId: string; name: string; avatar: string | null; xp: number; level: number; role: string }>
  members: Array<{ user: { id: string; name: string; avatar: string | null; xp: number; level: number; isPremium?: boolean }; role: string; joinedAt: string }>
  challenges: Challenge[]
  creator: { id: string; name: string; avatar: string | null }
}

export function StudyGroupPage() {
  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const [joining, setJoining] = useState(false)
  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [messageLoading, setMessageLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const { goBack, params } = useAppStore()
  const { user } = useAuthStore()
  const playClick = useSoundEffect('click')
  const playNotification = useSoundEffect('notification')

  useEffect(() => {
    if (params?.groupId) {
      fetchGroup(params.groupId as string)
    }
  }, [params?.groupId])

  const fetchGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (res.ok) {
        const data = await res.json()
        setGroup(data)
      }
    } catch (error) {
      console.error('Failed to fetch group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLeave = async () => {
    if (!group) return
    setLeaving(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/leave`, { method: 'POST' })
      if (res.ok) {
        goBack()
      }
    } catch (error) {
      console.error('Failed to leave group:', error)
    } finally {
      setLeaving(false)
    }
  }

  const handleJoin = async () => {
    if (!group) return
    setJoining(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/join`, { method: 'POST' })
      if (res.ok) {
        fetchGroup(group.id)
      }
    } catch (error) {
      console.error('Failed to join group:', error)
    } finally {
      setJoining(false)
    }
  }

  const handleShare = () => {
    if (!group) return
    const joinLink = `https://www.skoolarplay.com/join-group?id=${group.id}`
    const text = `Join my study group "${group.name}" on SkoolarPlay! Let's learn together. 🎓\n\nJoin here: ${joinLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  const handleCopyLink = async () => {
    if (!group) return
    const joinLink = `https://www.skoolarplay.com/join-group?id=${group.id}`
    try {
      await navigator.clipboard.writeText(joinLink)
      toast.success('Invite link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleRemoveMember = async (memberUserId: string) => {
    if (!group) return
    try {
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberUserId }),
      })
      if (res.ok) {
        toast.success('Member removed')
        fetchGroup(group.id)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const handleDeleteGroup = async () => {
    if (!group) return
    try {
      const res = await fetch(`/api/groups/${group.id}/delete`, { method: 'POST' })
      if (res.ok) {
        toast.success('Group deleted')
        goBack()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  // Chat functions
  const fetchMessages = async () => {
    if (!group) return
    setMessageLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setMessageLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!group || !newMessage.trim()) return
    setSendingMessage(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
          setNewMessage('')
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  // Open chat when user clicks on chat button
  const handleOpenChat = () => {
    if (group?.isMember) {
      setChatOpen(true)
      fetchMessages()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={goBack} className="rounded-full mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">😢</div>
            <h3 className="font-semibold">Group not found</h3>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = group.userRole === 'ADMIN'

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
      </motion.div>

      {/* Group Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                {group.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {group.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    {group.memberCount} members
                  </span>
                  <span className="text-sm flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-purple-500" />
                    {group.challenges.length} active challenge{group.challenges.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {group.creator.name}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {group.isMember ? (
                    <>
                      <Button size="sm" onClick={handleShare} variant="outline" className="rounded-full text-xs">
                        <Share2 className="w-3.5 h-3.5 mr-1" />
                        Share
                      </Button>
                      <Button size="sm" onClick={handleCopyLink} variant="outline" className="rounded-full text-xs">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </Button>
                      {isAdmin ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive hover:text-destructive">
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              Delete Group
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Group</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{group.name}&quot;? This action cannot be undone and all messages will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete Group
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-full text-xs text-destructive hover:text-destructive">
                              <LogOut className="w-3.5 h-3.5 mr-1" />
                              Leave
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Leave Group</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to leave &quot;{group.name}&quot;? You can rejoin later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleLeave} disabled={leaving}>
                                {leaving ? 'Leaving...' : 'Leave Group'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </>
                  ) : (
                    <Button size="sm" onClick={handleJoin} disabled={joining} className="rounded-full text-xs">
                      {joining ? 'Joining...' : 'Join Group'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Group Leaderboard
              </h2>
              <div className="space-y-2">
                {group.leaderboard.slice(0, 10).map((member, i) => {
                  const isCurrentUser = member.userId === user?.id
                  return (
                    <div
                      key={member.userId}
                      className={`flex items-center gap-3 p-2 rounded-xl ${isCurrentUser ? 'bg-primary/5 border border-primary/20' : ''}`}
                    >
                      <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {i + 1}
                      </span>
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-[10px] bg-primary/10">
                          {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate flex items-center gap-1">
                          {member.name}
                          {member.role === 'ADMIN' && <Crown className="w-3 h-3 text-yellow-500" />}
                          {isCurrentUser && (
                            <Badge className="text-[8px] rounded-full h-3 px-1 bg-primary/10 text-primary border-0">You</Badge>
                          )}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary">{member.xp.toLocaleString()} XP</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                Members ({group.memberCount})
              </h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {group.members.map((m) => {
                  const isCurrentUser = m.user.id === user?.id
                  return (
                    <div
                      key={m.user.id}
                      className={`flex items-center gap-3 p-2 rounded-xl ${isCurrentUser ? 'bg-primary/5' : ''}`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-[10px] bg-primary/10">
                          {m.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate flex items-center gap-1">
                            <UserLink userId={m.user.id} name={m.user.name}>
                              {m.user.name}
                            </UserLink>
                          <PlanBadge tier={getUserTier((m.user as any).isPremium)} size="tiny" />
                          {isCurrentUser && (
                            <Badge className="text-[8px] rounded-full h-3 px-1 bg-primary/10 text-primary border-0">You</Badge>
                          )}
                          {m.role === 'ADMIN' && (
                            <Badge className="text-[8px] rounded-full h-3 px-1 bg-yellow-500/10 text-yellow-600 border-0">
                              <Crown className="w-2.5 h-2.5 mr-0.5" />
                              Admin
                            </Badge>
                          )}
                          {m.role === 'MODERATOR' && (
                            <Badge className="text-[8px] rounded-full h-3 px-1 bg-blue-500/10 text-blue-600 border-0">
                              <Shield className="w-2.5 h-2.5 mr-0.5" />
                              Mod
                            </Badge>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Level {m.user.level} · {m.user.xp.toLocaleString()} XP</p>
                      </div>
                      {isAdmin && !isCurrentUser && m.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(m.user.id)}
                        >
                          <LogOut className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Active Challenges */}
      {group.challenges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-bold text-sm flex items-center gap-2 mb-3">
            <Swords className="w-4 h-4 text-purple-500" />
            Active Challenges
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {group.challenges.map((challenge) => {
              const userCompletion = challenge.completions[0]
              const progress = userCompletion?.progress || 0
              const isCompleted = userCompletion?.completed || false
              const pct = Math.min(100, (progress / challenge.targetCount) * 100)

              return (
                <Card key={challenge.id} className={isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{challenge.title}</h3>
                      {isCompleted && (
                        <Badge className="rounded-full bg-green-500/10 text-green-600 border-0 text-[10px]">
                          <Star className="w-3 h-3 mr-0.5" />
                          Done
                        </Badge>
                      )}
                    </div>
                    {challenge.description && (
                      <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>
                    )}
                    <div className="flex items-center gap-3 mb-2 text-xs">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Target className="w-3 h-3" />
                        {progress}/{challenge.targetCount}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Zap className="w-3 h-3" />
                        +{challenge.xpReward} XP
                      </span>
                      <span className="flex items-center gap-1 text-blue-500">
                        <Gem className="w-3 h-3" />
                        +{challenge.gemReward}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span>{Math.round(pct)}% complete</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ends {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Floating Chat Button */}
      {group.isMember && !chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
          onClick={handleOpenChat}
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-0 right-0 w-full sm:w-96 h-[60vh] sm:h-[500px] bg-card border-t sm:border-l sm:rounded-l-2xl shadow-xl z-50 flex flex-col"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Group Chat
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messageLoading ? (
              <div className="text-center text-muted-foreground py-4">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg: any) => {
                const isOwn = msg.sender.id === user?.id
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-2xl px-4 py-2`}>
                      {!isOwn && <p className="text-[10px] font-medium mb-1 opacity-70">{msg.sender.name}</p>}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()} size="icon">
              {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
