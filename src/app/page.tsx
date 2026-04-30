'use client'

import dynamic from 'next/dynamic'
import { useHydrated } from '@/hooks/use-hydrated'

const ClientApp = dynamic(() => import('@/components/client-app'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
})

export default function Home() {
  const hydrated = useHydrated()

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <ClientApp />
}
