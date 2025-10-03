import React from 'react'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[]
  onChange: (value: string) => void
  error?: string
  label?: string
}

export const Select: React.FC<SelectProps> = ({
  options,
  onChange,
  className = '',
  error,
  label,
  id,
  ...props
}) => {
  const selectId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        onChange={e => onChange(e.target.value)}
        className={`w-full rounded-md border bg-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:bg-gray-800 ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${className} `}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
