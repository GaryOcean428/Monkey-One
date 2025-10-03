import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Card } from '../ui/card'
import { cn } from '@/lib/utils'
import { LoadingSpinner as Spinner } from '../ui/loading-spinner'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertCircle } from 'lucide-react'

export interface BasePanelProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  isLoading?: boolean
  error?: Error | null
  onReset?: () => void
}

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message}
        {resetErrorBoundary && (
          <button
            onClick={resetErrorBoundary}
            className="hover:text-foreground/80 ml-2 text-sm underline"
          >
            Try again
          </button>
        )}
      </AlertDescription>
    </Alert>
  )
}

function LoadingFallback() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Spinner className="h-6 w-6" />
    </div>
  )
}

export function BasePanel({
  title,
  description,
  children,
  actions,
  className,
  isLoading,
  error,
  onReset,
}: BasePanelProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="ml-4">{actions}</div>}
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={onReset}>
        <Suspense fallback={<LoadingFallback />}>
          {error ? (
            <ErrorFallback error={error} resetErrorBoundary={() => onReset?.()} />
          ) : isLoading ? (
            <LoadingFallback />
          ) : (
            children
          )}
        </Suspense>
      </ErrorBoundary>
    </Card>
  )
}
