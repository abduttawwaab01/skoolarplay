'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Users, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/store/auth-store'

interface GroupPreview {
  id: string
  name: string
  description: string | null
  icon: string | null
  memberCount: number
  maxMembers: number
  creator: { id: string; name: string }
  isMember: boolean
}

function JoinGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('id')
  const { goBack } = useAppStore()
  const { isAuthenticated } = useAuthStore()

  const [group, setGroup] = useState<GroupPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (groupId) {
      fetchGroup()
    } else {
      setLoading(false)
    }
  }, [groupId])

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/preview`)
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

  const handleJoin = async () => {
    if (!group) return

    if (!isAuthenticated) {
      router.push(`/login?redirect=/join-group?id=${groupId}`)
      return
    }

    setJoining(true)
    try {
      const res = await fetch(`/api/groups/${group.id}/join`, { method: 'POST' })
      if (res.ok) {
        toast.success(`Joined "${group.name}" successfully!`)
        router.push(`/study-group?id=${group.id}`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to join group')
      }
    } catch (error) {
      console.error('Failed to join group:', error)
    } finally {
      setJoining(false)
    }
  }

  if (!groupId) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={goBack} className="rounded-full mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="font-semibold">Invalid invite link</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This invite link is invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </CardContent>
        </Card>
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
            <div className="text-5xl mb-4">😕</div>
            <h3 className="font-semibold">Group not found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              This group may have been deleted or made private.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (group.isMember) {
    return (
      <div className="p-4 md:p-6">
        <Button variant="ghost" onClick={goBack} className="rounded-full mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-semibold">You&apos;re already a member!</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              You&apos;re already a member of &quot;{group.name}&quot;
            </p>
            <Button onClick={() => router.push(`/study-group?id=${group.id}`)} className="rounded-full">
              Go to Group
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFull = group.memberCount >= group.maxMembers

  return (
    <div className="p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
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
                    {group.memberCount}/{group.maxMembers} members
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {group.creator.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleJoin}
                disabled={joining || isFull}
                className="flex-1 rounded-full"
              >
                {joining ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : isFull ? (
                  'Group is Full'
                ) : (
                  'Join Group'
                )}
              </Button>
              <Button variant="outline" onClick={goBack} className="rounded-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JoinGroupContent />
    </Suspense>
  )
}
