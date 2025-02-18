import * as React from 'react'
import { useLoadingStore } from '@/stores/loading-store'
import { cn } from '@/lib/utils'

export function LoadingOverlay() {
  const { isLoading, loadingText } = useLoadingStore()

  if (!isLoading) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        'transition-all duration-300',
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {loadingText && (
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        )}
      </div>
    </div>
  )
}
