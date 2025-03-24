import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'
import { PageHeader } from './page-header'

export interface BasePanelProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  actions?: React.ReactNode
  loading?: boolean
  error?: string | null
}

export function BasePanel({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
  actions,
  loading = false,
  error = null,
}: BasePanelProps) {
  return (
    <div className={cn('flex h-full flex-col space-y-4', className)}>
      <div className={cn('flex items-center justify-between', headerClassName)}>
        <PageHeader title={title} description={description} />
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>

      <Card className={cn('flex-1 overflow-hidden', contentClassName)}>
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          children
        )}
      </Card>
    </div>
  )
}
