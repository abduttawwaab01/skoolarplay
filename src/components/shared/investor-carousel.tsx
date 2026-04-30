'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Landmark } from 'lucide-react'

interface Investor {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  tier: string
  description: string | null
  isActive?: boolean
}

const tierColors: Record<string, string> = {
  PLATINUM: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-400 shadow-slate-200',
  GOLD: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border-amber-400 shadow-amber-200',
  SILVER: 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-600 border-slate-300 shadow-slate-200',
  BRONZE: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border-orange-300 shadow-orange-200',
}

const tierBadgeColors: Record<string, string> = {
  PLATINUM: 'bg-slate-600 text-white',
  GOLD: 'bg-amber-500 text-white',
  SILVER: 'bg-slate-400 text-white',
  BRONZE: 'bg-orange-500 text-white',
}

const tierGlows: Record<string, string> = {
  PLATINUM: 'shadow-[0_0_20px_rgba(100,116,139,0.4)]',
  GOLD: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
  SILVER: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
  BRONZE: 'shadow-[0_0_15px_rgba(234,88,12,0.3)]',
}

function InvestorCard({ investor, index }: { investor: Investor; index: number }) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative group"
    >
      <motion.a
        href={investor.website || '#'}
        target={investor.website ? '_blank' : undefined}
        rel={investor.website ? 'noopener noreferrer' : undefined}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border-2 shadow-md hover:shadow-xl transition-all duration-300 min-w-[180px] ${tierColors[investor.tier] || tierColors.BRONZE} ${tierGlows[investor.tier] || ''}`}
      >
        {/* Logo */}
        <div className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-white/50 ${tierColors[investor.tier] || tierColors.BRONZE}`}>
          {!imageError && investor.logoUrl ? (
            <img
              src={investor.logoUrl}
              alt={investor.name}
              className="w-14 h-14 object-contain transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <Landmark className="w-8 h-8 opacity-50" />
          )}
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Name */}
        <p className="text-sm font-bold text-center line-clamp-1 group-hover:text-primary transition-colors">
          {investor.name}
        </p>

        {/* Tier Badge */}
        <Badge className={`text-[10px] px-3 py-1 font-medium ${tierBadgeColors[investor.tier] || tierBadgeColors.BRONZE}`}>
          {investor.tier}
        </Badge>

        {/* Description */}
        {investor.description && (
          <p className="text-xs text-muted-foreground text-center line-clamp-2">
            {investor.description}
          </p>
        )}
      </motion.a>
    </motion.div>
  )
}

export function InvestorCarousel() {
  const [investors, setInvestors] = useState<Investor[]>([])

  useEffect(() => {
    async function fetchInvestors() {
      try {
        const res = await fetch('/api/admin/investors')
        if (res.ok) {
          const data = await res.json()
          setInvestors((data.investors || []).filter((i: Investor) => i.isActive !== false))
        }
      } catch {
        // Silent fail
      }
    }
    fetchInvestors()
  }, [])

  if (investors.length === 0) return null

  // Create 2 sets for seamless loop - each set fills the viewport
  const firstSet = [...investors, ...investors]
  const secondSet = [...investors, ...investors]

  return (
    <div className="relative w-full overflow-hidden py-4">
      <style jsx global>{`
        @keyframes investorScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .investor-track {
          display: flex;
          width: max-content;
          animation: investorScroll 20s linear infinite;
        }
        .investor-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="flex w-max">
        {/* First set */}
        <div className="flex gap-6 investor-track">
          {firstSet.map((investor, i) => (
            <InvestorCard key={`first-${investor.id}-${i}`} investor={investor} index={i % investors.length} />
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex gap-6 investor-track" aria-hidden="true">
          {secondSet.map((investor, i) => (
            <InvestorCard key={`second-${investor.id}-${i}`} investor={investor} index={i % investors.length} />
          ))}
        </div>
      </div>
    </div>
  )
}
