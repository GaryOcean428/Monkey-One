import React from 'react'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  className = '',
  label,
}) => {
  return (
    <label
      className={`inline-flex cursor-pointer items-center ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onCheckedChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block h-8 w-14 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} `}
        />
        <div
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-6 transform' : ''} `}
        />
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
      )}
    </label>
  )
}
