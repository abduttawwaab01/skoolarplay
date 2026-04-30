'use client'

import { useEffect, useState } from 'react'

interface Volunteer {
  id: string
  name: string
  displayOrder: number
  isActive: boolean
}

export function VolunteerCarousel() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])

  useEffect(() => {
    async function fetchVolunteers() {
      try {
        const res = await fetch('/api/admin/volunteers')
        if (res.ok) {
          const data = await res.json()
          setVolunteers((data.volunteers || []).filter((v: Volunteer) => v.isActive))
        }
      } catch {
        // Silent fail
      }
    }
    fetchVolunteers()
  }, [])

  if (volunteers.length === 0) return null

  const displayVolunteers = [...volunteers, ...volunteers]
  const midIndex = volunteers.length

  return (
    <div className="w-full py-3 bg-muted/30 border-y">
      <div className="container mx-auto px-4">
        <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider mb-3">
          Our Volunteers
        </p>
        
        {/* Top row - faster */}
        <div className="relative overflow-hidden mb-2">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div
            className="flex gap-6 overflow-hidden"
            style={{
              animation: 'volunteerMarqueeTop 25s linear infinite',
            }}
          >
            {displayVolunteers.slice(0, midIndex).map((vol, i) => (
              <span
                key={`top-${vol.id}-${i}`}
                className="text-sm font-medium text-foreground whitespace-nowrap"
              >
                {vol.name}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row - slower */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div
            className="flex gap-6 overflow-hidden"
            style={{
              animation: 'volunteerMarqueeBottom 35s linear infinite',
            }}
          >
            {displayVolunteers.slice(midIndex).map((vol, i) => (
              <span
                key={`bottom-${vol.id}-${i}`}
                className="text-sm font-medium text-muted-foreground whitespace-nowrap"
              >
                {vol.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes volunteerMarqueeTop {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes volunteerMarqueeBottom {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}