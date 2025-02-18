import * as React from 'react'
import { Card } from './card'

interface SuspenseBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SuspenseBoundary({ children, fallback }: SuspenseBoundaryProps) {
  const defaultFallback = (
    <Card className="m-4 p-6">
      <div className="flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </Card>
  )

  return (
    <React.Suspense fallback={fallback ?? defaultFallback}>
      {children}
    </React.Suspense>
  )
}
