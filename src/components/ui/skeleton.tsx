import * as React from 'react'
import { cn } from '../../lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button' | 'circle' | 'rounded'
  lines?: number
  animation?: 'shimmer' | 'pulse' | 'wave' | 'none'
  speed?: 'slow' | 'normal' | 'fast'
}

const skeletonVariants = {
  default: 'h-4 w-full',
  card: 'h-48 w-full',
  text: 'h-4',
  avatar: 'h-10 w-10 rounded-full',
  button: 'h-10 w-24 rounded-md',
  circle: 'rounded-full',
  rounded: 'rounded-lg',
}

const animationClasses = {
  shimmer:
    'animate-shimmer bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
  pulse: 'animate-pulse bg-muted',
  wave: 'animate-shimmer bg-gradient-to-r from-muted/80 via-primary/10 to-muted/80 bg-[length:200%_100%]',
  none: 'bg-muted',
}

const speedClasses = {
  slow: '[animation-duration:3s]',
  normal: '[animation-duration:2s]',
  fast: '[animation-duration:1s]',
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'default',
      lines = 1,
      animation = 'shimmer',
      speed = 'normal',
      ...props
    },
    ref
  ) => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finalAnimation = prefersReducedMotion ? 'none' : animation

    if (variant === 'text' && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'rounded-md',
                skeletonVariants[variant],
                animationClasses[finalAnimation],
                speedClasses[speed],
                index === lines - 1 && 'w-3/4', // Last line shorter
                className
              )}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md',
          skeletonVariants[variant],
          animationClasses[finalAnimation],
          speedClasses[speed],
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
    <div className={cn('space-y-3 p-6', className)} {...props}>
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
        <Skeleton variant="text" className="h-8 w-1/3" animation="wave" />
        <Skeleton variant="text" className="h-4 w-1/2" animation="shimmer" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-border space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="h-4 w-1/2" animation="pulse" />
              <Skeleton variant="circle" className="h-6 w-6" animation="shimmer" />
            </div>
            <Skeleton variant="text" className="h-8 w-1/3" animation="wave" />
            <Skeleton variant="text" className="h-3 w-2/3" animation="shimmer" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

// Enhanced chat message skeleton
export function SkeletonChatMessage({
  isUser = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3 p-4', isUser && 'flex-row-reverse', className)} {...props}>
      <Skeleton variant="avatar" className="flex-shrink-0" animation="pulse" />
      <div className={cn('flex-1 space-y-2', isUser && 'items-end')}>
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="h-3 w-16" animation="shimmer" />
          <Skeleton variant="text" className="h-3 w-12" animation="pulse" />
        </div>
        <div className={cn('space-y-1', isUser && 'flex flex-col items-end')}>
          <Skeleton variant="text" lines={2} animation="wave" speed="slow" />
        </div>
      </div>
    </div>
  )
}

// Skeleton code block
export function SkeletonCodeBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-muted/50 space-y-2 rounded-lg p-4', className)} {...props}>
      <div className="mb-3 flex items-center gap-2">
        <Skeleton variant="circle" className="h-3 w-3" animation="pulse" />
        <Skeleton variant="circle" className="h-3 w-3" animation="pulse" />
        <Skeleton variant="circle" className="h-3 w-3" animation="pulse" />
        <div className="flex-1" />
        <Skeleton variant="text" className="h-3 w-16" animation="shimmer" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={cn(
            'h-4',
            index === 0 && 'w-1/4',
            index === 1 && 'w-3/4',
            index === 2 && 'w-1/2',
            index === 3 && 'w-5/6',
            index === 4 && 'w-2/3',
            index === 5 && 'w-1/3'
          )}
          animation="shimmer"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  )
}

// Skeleton data visualization
export function SkeletonChart({
  type = 'bar',
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { type?: 'bar' | 'line' | 'pie' }) {
  return (
    <div className={cn('space-y-4 p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="h-6 w-1/3" animation="wave" />
        <Skeleton variant="button" className="h-8 w-20" animation="pulse" />
      </div>

      {type === 'bar' && (
        <div className="flex h-32 items-end justify-between gap-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              className="flex-1"
              style={{
                height: `${Math.random() * 80 + 20}%`,
                animationDelay: `${index * 0.1}s`,
              }}
              animation="wave"
            />
          ))}
        </div>
      )}

      {type === 'line' && (
        <div className="relative h-32">
          <Skeleton variant="rounded" className="h-full w-full" animation="wave" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton variant="text" className="h-1 w-3/4" animation="shimmer" />
          </div>
        </div>
      )}

      {type === 'pie' && (
        <div className="flex h-32 items-center justify-center">
          <Skeleton variant="circle" className="h-24 w-24" animation="pulse" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton variant="circle" className="h-3 w-3" animation="pulse" />
            <Skeleton variant="text" className="h-3 w-12" animation="shimmer" />
          </div>
        ))}
      </div>
    </div>
  )
}

export { Skeleton }
