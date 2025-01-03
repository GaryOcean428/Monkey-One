import React from 'react'
import { Input } from './input'
import { cn } from '../../lib/utils'

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-1', className)}>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <Input
          ref={ref}
          {...props}
          className={error ? 'border-red-500 focus:border-red-500' : ''}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

LabeledInput.displayName = 'LabeledInput'
