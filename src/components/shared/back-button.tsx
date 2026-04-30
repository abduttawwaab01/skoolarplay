'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAppStore, type PageName } from '@/store/app-store'

interface BackButtonProps {
  label?: string
  targetPage?: PageName
}

export function BackButton({ label = 'Go Back', targetPage }: BackButtonProps) {
  const { goBack, navigateTo } = useAppStore()

  const handleClick = () => {
    if (targetPage) {
      navigateTo(targetPage)
    } else {
      goBack()
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}
