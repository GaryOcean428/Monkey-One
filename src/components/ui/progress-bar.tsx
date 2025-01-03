import React from 'react'
import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  color?: 'green' | 'blue' | 'purple'
  className?: string
}

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
} as const

export function ProgressBar({ value, max, color = 'blue', className }: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const ariaValueNow = Math.max(0, Math.min(percentage, 100))

  return (
    <div
      className={cn('h-2 rounded-full bg-gray-100 dark:bg-gray-800', className)}
      role="progressbar"
      aria-valuenow={ariaValueNow}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-2 rounded-full transition-all', colorClasses[color])}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
