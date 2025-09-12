import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  lines?: number
}

const skeletonVariants = {
  default: 'h-4 w-full',
  card: 'h-48 w-full',
  text: 'h-4',
  avatar: 'h-10 w-10 rounded-full',
  button: 'h-10 w-24 rounded-md'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', lines = 1, ...props }, ref) => {
    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'skeleton rounded-md',
                skeletonVariants[variant],
                index === lines - 1 && 'w-3/4', // Last line shorter
                className
              )}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'skeleton rounded-md',
          skeletonVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

// Skeleton card component
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 space-y-3', className)} {...props}>
      <Skeleton variant="text" className="h-6 w-1/2" />
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="button" className="w-16" />
        <Skeleton variant="button" className="w-20" />
      </div>
    </div>
  )
}

// Skeleton list item
export function SkeletonListItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center space-x-3 p-3', className)} {...props}>
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-1/3" />
        <Skeleton variant="text" className="h-3 w-2/3" />
      </div>
    </div>
  )
}

// Skeleton table row
export function SkeletonTableRow({ 
  columns = 4, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { columns?: number }) {
  return (
    <div className={cn('flex items-center space-x-4 p-4', className)} {...props}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="text" 
          className={cn(
            'h-4',
            index === 0 && 'w-1/4',
            index === 1 && 'w-1/3',
            index === 2 && 'w-1/5',
            index === 3 && 'w-1/6'
          )}
        />
      ))}
    </div>
  )
}

// Skeleton dashboard
export function SkeletonDashboard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-8 w-1/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-4 border border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-4 w-1/2" />
              <Skeleton variant="avatar" className="h-6 w-6" />
            </div>
            <Skeleton variant="text" className="h-8 w-1/3" />
            <Skeleton variant="text" className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export { Skeleton }