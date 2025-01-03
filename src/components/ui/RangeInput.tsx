import React from 'react'

interface RangeInputProps {
  id: string
  value: number
  min?: number
  max?: number
  step?: number
  label: string
  onChange: (value: number) => void
  className?: string
  showOutput?: boolean
  formatOutput?: (value: number) => string
}

export function RangeInput({
  id,
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  onChange,
  className = '',
  showOutput = true,
  formatOutput = val => val.toString(),
}: RangeInputProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full ${className}`}
        aria-label={label}
      />
      {showOutput && (
        <output htmlFor={id} className="text-sm text-gray-600">
          {formatOutput(value)}
        </output>
      )}
    </div>
  )
}
