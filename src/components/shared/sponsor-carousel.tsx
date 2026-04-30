'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

interface Sponsor {
  id: string
  name: string
  logoUrl: string | null
  website: string | null
  tier: string
  description: string | null
  donatedAmount: number
  isActive?: boolean
}

const tierColors: Record<string, string> = {
  DIAMOND: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-400 shadow-blue-200',
  PLATINUM: 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border-slate-400 shadow-slate-200',
  GOLD: 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border-amber-400 shadow-amber-200',
  SILVER: 'bg-gradient-to-br from-slate-50 to-gray-100 text-slate-600 border-slate-300 shadow-slate-200',
  BRONZE: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-700 border-orange-300 shadow-orange-200',
}

const tierBadgeColors: Record<string, string> = {
  DIAMOND: 'bg-blue-500 text-white',
  PLATINUM: 'bg-slate-600 text-white',
  GOLD: 'bg-amber-500 text-white',
  SILVER: 'bg-slate-400 text-white',
  BRONZE: 'bg-orange-500 text-white',
}

const tierGlows: Record<string, string> = {
  DIAMOND: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
  PLATINUM: 'shadow-[0_0_20px_rgba(100,116,139,0.4)]',
  GOLD: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
  SILVER: 'shadow-[0_0_15px_rgba(148,163,184,0.3)]',
  BRONZE: 'shadow-[0_0_15px_rgba(234,88,12,0.3)]',
}

function SponsorCard({ sponsor, index }: { sponsor: Sponsor; index: number }) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative group"
    >
      <motion.a
        href={sponsor.website || '#'}
        target={sponsor.website ? '_blank' : undefined}
        rel={sponsor.website ? 'noopener noreferrer' : undefined}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border-2 shadow-md hover:shadow-xl transition-all duration-300 min-w-[180px] ${tierColors[sponsor.tier] || tierColors.BRONZE} ${tierGlows[sponsor.tier] || ''}`}
      >
        {/* Diamond sparkle effect */}
        {sponsor.tier === 'DIAMOND' && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </div>
        )}

        {/* Logo */}
        <div className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-white/50 ${tierColors[sponsor.tier] || tierColors.BRONZE}`}>
          {!imageError && sponsor.logoUrl ? (
            <img
              src={sponsor.logoUrl}
              alt={sponsor.name}
              className="w-14 h-14 object-contain transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-2xl font-bold text-current">{sponsor.name.charAt(0)}</span>
          )}
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Name */}
        <p className="text-sm font-bold text-center line-clamp-1 group-hover:text-primary transition-colors">
          {sponsor.name}
        </p>

        {/* Tier Badge */}
        <Badge className={`text-[10px] px-3 py-1 font-medium ${tierBadgeColors[sponsor.tier] || tierBadgeColors.BRONZE}`}>
          {sponsor.tier}
        </Badge>

        {/* Amount indicator */}
        {sponsor.donatedAmount > 0 && (
          <p className="text-xs text-muted-foreground font-medium">
            ₦{sponsor.donatedAmount.toLocaleString()}
          </p>
        )}
      </motion.a>
    </motion.div>
  )
}

export function SponsorCarousel() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    async function fetchSponsors() {
      try {
        const res = await fetch('/api/admin/sponsors')
        if (res.ok) {
          const data = await res.json()
          setSponsors((data.sponsors || []).filter((s: Sponsor) => s.isActive !== false))
        }
      } catch {
        // Silent fail
      }
    }
    fetchSponsors()
  }, [])

  if (sponsors.length === 0) return null

  // Create 2 sets for seamless loop
  const firstSet = [...sponsors, ...sponsors]
  const secondSet = [...sponsors, ...sponsors]

  return (
    <div className="relative w-full overflow-hidden py-4">
      <style jsx global>{`
        @keyframes sponsorScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .sponsor-track {
          display: flex;
          width: max-content;
          animation: sponsorScroll 30s linear infinite;
        }
        .sponsor-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="flex w-max">
        {/* First set */}
        <div className="flex gap-6 sponsor-track">
          {firstSet.map((sponsor, i) => (
            <SponsorCard key={`first-${sponsor.id}-${i}`} sponsor={sponsor} index={i % sponsors.length} />
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex gap-6 sponsor-track" aria-hidden="true">
          {secondSet.map((sponsor, i) => (
            <SponsorCard key={`second-${sponsor.id}-${i}`} sponsor={sponsor} index={i % sponsors.length} />
          ))}
        </div>
      </div>
    </div>
  )
}
