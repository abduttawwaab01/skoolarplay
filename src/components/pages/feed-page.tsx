'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Heart,
  Send,
  ArrowLeft,
  Image as ImageIcon,
  MoreHorizontal,
  Share2,
  Flag,
  Bookmark,
  ThumbsUp,
  Edit3,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  Filter,
  PenTool,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  Globe,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { PlanBadge, type PlanTier, getUserTier } from '@/components/shared/plan-badge'

interface FeedPost {
  id: string
  content: string
  visibility: string
  isApproved: boolean
  isHidden: boolean
  likeCount: number
  commentCount: number
  mediaUrls: string[] | null
  mentionedUserIds: string[] | null
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatar: string | null
    isPremium: boolean
    planTier: PlanTier
    level: number
    league: string
  }
  likes: Array<{
    id: string
    userId: string
    type: string
    user: {
      id: string
      name: string
      isPremium: boolean
    }
  }>
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: {
      id: string
      name: string
      avatar: string | null
    }
    parentId: string | null
  }>
  userLiked: boolean
  userReported: boolean
}

const EMOJI_REACTIONS = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'] as const
const EMOJI_MAP: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
}

const POSTS_PER_PAGE = 20

export default function FeedPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { navigateTo, goBack } = useAppStore()
  const playOpen = useSoundEffect('open')
  const playClick = useSoundEffect('click')

  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Post creation
  const [newPostContent, setNewPostContent] = useState('')
  const [postVisibility, setPostVisibility] = useState<'PUBLIC' | 'FOLLOWERS_ONLY'>('PUBLIC')
  const [submitting, setSubmitting] = useState(false)
  const [charCount, setCharCount] = useState(0)

   // Comments
   const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
   const [newComments, setNewComments] = useState<Record<string, string>>({})
   const [submittingComment, setSubmittingComment] = useState<string | null>(null)

   // Post editing
   const [editingPostId, setEditingPostId] = useState<string | null>(null)
   const [editContent, setEditContent] = useState('')
   const [updatingPost, setUpdatingPost] = useState(false)

   const MAX_CHARS = 5000

  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false, silent: boolean = false) => {
    try {
      if (!silent) {
        if (pageNum === 1) setLoading(true)
        else setLoadingMore(true)
        setError(null)
      }

      const res = await fetch(`/api/feed?page=${pageNum}&limit=${POSTS_PER_PAGE}`)
      if (!res.ok) {
        if (res.status === 401) {
          if (!silent) navigateTo('login')
          return
        }
        if (!silent) throw new Error('Failed to fetch feed posts')
        return
      }

      const data = await res.json()
      if (append) {
        setPosts(prev => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setHasMore(data.pagination.page < data.pagination.pages)
    } catch (err: any) {
      if (!silent) setError(err.message)
    } finally {
      if (!silent) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [navigateTo])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(1)
    }
  }, [isAuthenticated, fetchPosts])

  // Poll for new posts every 30 seconds (like messages)
  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(() => {
      fetchPosts(1, false) // silent refresh, don't show loading state
    }, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, fetchPosts])

  const handleSubmitPost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter some content')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent.trim(),
          visibility: postVisibility,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create post')
      }

      const createdPost = await res.json()
      // If post requires approval, don't add it to the feed immediately
      if (createdPost.post && !createdPost.post.isApproved) {
        setNewPostContent('')
        setCharCount(0)
        playOpen()
        toast.success('Post submitted! It will be visible after admin approval.')
      } else {
        setPosts(prev => [createdPost.post, ...prev])
        setNewPostContent('')
        setCharCount(0)
        playOpen()
        toast.success('Post published successfully!')
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId: string, reactionType: string = 'LIKE') => {
    if (!isAuthenticated) {
      navigateTo('login')
      return
    }

    try {
      const post = posts.find(p => p.id === postId)
      if (!post) return

      const isCurrentlyLiked = post.userLiked
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const existingLikeIndex = p.likes.findIndex(l => l.userId === user?.id)
          let newLikes = [...p.likes]
          if (isCurrentlyLiked) {
            newLikes = newLikes.filter(l => l.userId !== user?.id)
          } else {
            newLikes.push({
              id: 'temp',
              userId: user!.id,
              type: reactionType,
              user: { id: user!.id, name: user!.name || '', isPremium: user!.isPremium }
            })
          }
          return {
            ...p,
            userLiked: !isCurrentlyLiked,
            likes: newLikes,
            likeCount: isCurrentlyLiked ? p.likeCount - 1 : p.likeCount + 1,
          }
        }
        return p
      }))

      // If unliking, call unlike endpoint; if liking, call like endpoint
      const method = isCurrentlyLiked ? 'DELETE' : 'POST'
      const endpoint = `/api/feed/${postId}/like`

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: isCurrentlyLiked ? undefined : JSON.stringify({ type: reactionType }),
      })

      if (!res.ok) {
        // Revert on error
        setPosts(prev => prev.map(p => {
          if (p.id === postId) return post
          return p
        }))
        throw new Error('Failed to update like')
      }
      playClick()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleComment = async (postId: string) => {
    const content = newComments[postId]?.trim()
    if (!content) return

    setSubmittingComment(postId)
    try {
      const res = await fetch(`/api/feed/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add comment')
      }

      const data = await res.json()
      if (data.comment) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentCount: p.commentCount + 1,
              comments: [...p.comments, data.comment],
            }
          }
          return p
        }))
        setNewComments(prev => ({ ...prev, [postId]: '' }))
        setExpandedComments(prev => new Set([...prev, postId]))
        playOpen()
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmittingComment(null)
    }
  }

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
        // Fetch comments if not already loaded
        // For now, comments are already included in the post data
      }
      return next
    })
  }

  const handleReport = async (postId: string) => {
    if (!isAuthenticated) {
      navigateTo('login')
      return
    }

    const reason = 'INAPPROPRIATE'
    const description = ''

    try {
      const res = await fetch('/api/feed/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason, description }),
      })

      if (res.ok) {
        toast.success('Report submitted. Thank you!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to submit report')
      }
    } catch {
      toast.error('Failed to submit report')
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage, true)
    }
  }

  const renderContent = (content: string) => {
    // Simple content rendering - could be enhanced with link parsing, mentions, etc.
    return content.split('\n').map((line, i) => (
      <p key={i} className="mb-1">{line || <br />}</p>
    ))
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Please log in to view the community feed.</p>
          <Button onClick={() => navigateTo('login')}>Log In</Button>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchPosts(1)}>Retry</Button>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 p-4 md:p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Community Feed</h1>
            <p className="text-sm text-muted-foreground">See what your friends are up to</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchPosts(1)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Create Post */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar || ''} />
              <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => {
                  const val = e.target.value
                  if (val.length <= MAX_CHARS) {
                    setNewPostContent(val)
                    setCharCount(val.length)
                  }
                }}
                className="min-h-[100px] resize-none"
                maxLength={MAX_CHARS}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {charCount}/{MAX_CHARS}
                  </Badge>
                  <select
                    value={postVisibility}
                    onChange={(e) => setPostVisibility(e.target.value as 'PUBLIC' | 'FOLLOWERS_ONLY')}
                    className="text-xs border rounded px-2 py-1 bg-transparent"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="FOLLOWERS_ONLY">Followers Only</option>
                  </select>
                </div>
                <Button onClick={handleSubmitPost} disabled={submitting || !newPostContent.trim()}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 && !loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </Card>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="p-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || ''} />
                          <AvatarFallback>{post.author.name?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <UserLink userId={post.authorId} name={post.author.name} showAvatar={false}>
                            <span className="font-semibold text-sm">{post.author.name}</span>
                          </UserLink>
                          {post.author.planTier && post.author.planTier !== 'FREE' && (
                            <PlanBadge tier={post.author.planTier} size="small" />
                          )}
                          <Badge variant="outline" className="text-xs">
                            Lvl {post.author.level} • {post.author.league}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          {post.visibility === 'FOLLOWERS_ONLY' && (
                            <>
                              <Users className="w-3 h-3 ml-1" />
                              <span>Followers only</span>
                            </>
                          )}
                          {post.visibility === 'PUBLIC' && (
                            <>
                              <Globe className="w-3 h-3 ml-1" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         {post.author.id === user?.id && (
                           <DropdownMenuItem
                             onClick={(e) => {
                               e.preventDefault()
                               setEditingPostId(post.id)
                               setEditContent(post.content)
                               playClick()
                             }}
                           >
                             <Edit className="w-4 h-4 mr-2" />
                             Edit
                           </DropdownMenuItem>
                         )}
                         {post.author.id === user?.id && (
                           <DropdownMenuItem onClick={async () => {
                             // Delete post
                             if (confirm('Delete this post?')) {
                               try {
                                 await fetch(`/api/feed/${post.id}`, { method: 'DELETE' })
                                 setPosts(prev => prev.filter(p => p.id !== post.id))
                                 toast.success('Post deleted')
                                 playClick()
                               } catch {
                                 toast.error('Failed to delete post')
                               }
                             }
                           }}>
                             <Trash2 className="w-4 h-4 mr-2" />
                             Delete
                           </DropdownMenuItem>
                         )}
                        {post.author.id !== user?.id && (
                          <DropdownMenuItem onClick={() => handleReport(post.id)}>
                            <Flag className="w-4 h-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                   </div>

                   {/* Edit Mode */}
                   {editingPostId === post.id && (
                     <div className="mb-3 space-y-2">
                       <Textarea
                         value={editContent}
                         onChange={(e) => setEditContent(e.target.value)}
                         maxLength={MAX_CHARS}
                         rows={3}
                         className="resize-none"
                       />
                       <div className="flex items-center justify-between text-sm text-muted-foreground">
                         <span>{editContent.length}/{MAX_CHARS} characters</span>
                         <div className="flex gap-2">
                           <Button
                             size="sm"
                             variant="outline"
                             onClick={() => {
                               setEditingPostId(null)
                               setEditContent('')
                             }}
                             disabled={updatingPost}
                           >
                             Cancel
                           </Button>
                           <Button
                             size="sm"
                             onClick={async () => {
                               if (!editContent.trim()) {
                                 toast.error('Content cannot be empty')
                                 return
                               }
                               try {
                                 setUpdatingPost(true)
                                 await fetch(`/api/feed/${post.id}`, {
                                   method: 'PUT',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ content: editContent.trim() }),
                                 })
                                 // Update post locally
                                 setPosts(prev =>
                                   prev.map(p =>
                                     p.id === post.id
                                       ? { ...p, content: editContent.trim(), updatedAt: new Date().toISOString() }
                                       : p
                                   )
                                 )
                                 toast.success('Post updated')
                                 setEditingPostId(null)
                                 setEditContent('')
                                 playClick()
                               } catch {
                                 toast.error('Failed to update post')
                               } finally {
                                 setUpdatingPost(false)
                               }
                             }}
                             disabled={updatingPost || !editContent.trim()}
                           >
                             {updatingPost ? (
                               <Loader2 className="w-4 h-4 animate-spin mr-2" />
                             ) : null}
                             Save
                           </Button>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Post Content */}
                   {editingPostId !== post.id && (
                     <div className="mb-3 whitespace-pre-wrap break-words">
                       {renderContent(post.content)}
                     </div>
                   )}

                   {/* Media */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {post.mediaUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="rounded-lg max-h-64 object-cover w-full"
                        />
                      ))}
                    </div>
                  )}

                  {/* Engagement */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        post.userLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.userLiked ? 'fill-current' : ''}`} />
                      <span>{post.likeCount > 0 ? post.likeCount : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentCount > 0 ? post.commentCount : 'Comment'}</span>
                    </button>
                  </div>

                  {/* Reaction Picker (quick reactions) */}
                  <div className="flex items-center gap-1 mt-2">
                    {EMOJI_REACTIONS.slice(0, 4).map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleLike(post.id, emoji)}
                        className="text-lg hover:scale-125 transition-transform p-1"
                        title={emoji}
                      >
                        {EMOJI_MAP[emoji]}
                      </button>
                    ))}
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {expandedComments.has(post.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t"
                      >
                        <div className="space-y-3 mb-3 max-h-60 overflow-y-auto">
                          {post.comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-2">No comments yet.</p>
                          ) : (
                            post.comments.map(comment => (
                              <div key={comment.id} className="flex gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={comment.user.avatar || ''} />
                                   <AvatarFallback>{comment.user.name?.[0]?.toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/50 rounded-lg p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                     <UserLink userId={comment.userId} name={comment.user.name}>
                                       <span className="text-sm font-semibold">{comment.user.name}</span>
                                     </UserLink>
                                    <PlanBadge tier={getUserTier((comment.user as any).isPremium)} size="tiny" />
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={newComments[post.id] || ''}
                            onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="text-sm min-h-[60px] resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleComment(post.id)
                              }
                            }}
                          />
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleComment(post.id)}
                            disabled={submittingComment === post.id || !newComments[post.id]?.trim()}
                          >
                            {submittingComment === post.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Reply'
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-2" />
              )}
              Load More
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
