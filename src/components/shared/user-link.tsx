'use client'

import { useAppStore } from '@/store/app-store'
import { PageName } from '@/store/app-store'

interface UserLinkProps {
  userId: string
  name: string
  avatar?: string | null
  showAvatar?: boolean
  className?: string
  children?: React.ReactNode
}

export function UserLink({ userId, name, avatar, showAvatar = false, className = '', children }: UserLinkProps) {
  const { navigateTo } = useAppStore()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigateTo(`profile/${userId}` as PageName)
  }

  return (
    <button
      onClick={handleClick}
      className={`hover:text-primary transition-colors text-left ${className}`}
      title={`View ${name}'s profile`}
    >
      {children || (
        <span className="flex items-center gap-2">
          {showAvatar && avatar && (
            <img src={avatar} alt={name} className="w-5 h-5 rounded-full" />
          )}
          {name}
        </span>
      )}
    </button>
  )
}
