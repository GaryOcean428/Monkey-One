import * as React from 'react'
import { useLoadingStore } from '@/stores/loading-store'
import { cn } from '@/lib/utils'

export function LoadingOverlay() {
  const { isLoading, loadingText } = useLoadingStore()

  if (!isLoading) return null

  return (
    <div
      className={cn(
        'bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
        'transition-all duration-300',
        isLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
        {loadingText && <p className="text-muted-foreground text-sm">{loadingText}</p>}
      </div>
    </div>
  )
}
