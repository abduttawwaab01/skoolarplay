'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Application Error</h2>
              <p className="text-muted-foreground mb-4">
                A critical error occurred. Please try refreshing the page.
              </p>
            </div>
            <Button onClick={() => reset()} variant="default">
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
