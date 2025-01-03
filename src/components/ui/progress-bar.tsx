import { cn } from '../../lib/utils'
import './progress-bar.css'
import { useRef, useEffect } from 'react'

interface ProgressBarProps {
  value: number
  max: number
  color?: 'green' | 'blue' | 'purple'
  className?: string
  label?: string
}

const colorClasses = {
  green: 'progress-bar-green',
  blue: 'progress-bar-blue',
  purple: 'progress-bar-purple',
} as const

export function ProgressBar({
  value,
  max,
  color = 'blue',
  className,
  label = 'Progress',
}: ProgressBarProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const normalizedValue = Math.max(0, Math.min(percentage, 100))

  useEffect(() => {
    if (progressRef.current) {
      // Set ARIA attributes using DOM API
      progressRef.current.setAttribute('role', 'progressbar')
      progressRef.current.setAttribute('aria-valuenow', normalizedValue.toString())
      progressRef.current.setAttribute('aria-valuemin', '0')
      progressRef.current.setAttribute('aria-valuemax', '100')
      progressRef.current.setAttribute('aria-label', label)
    }
  }, [normalizedValue, label])

  return (
    <div
      ref={progressRef}
      className={cn('progress-bar-container', className)}
      title={`${percentage}% complete`}
    >
      <div className={cn('progress-bar-fill', colorClasses[color], `w-${percentage}`)} />
    </div>
  )
}
