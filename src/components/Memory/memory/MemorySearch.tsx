import React from 'react'
import { Input } from '../ui/Input'

interface MemorySearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const MemorySearch: React.FC<MemorySearchProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={className}>
      <Input
        type="search"
        placeholder="Search memories..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full"
        aria-label="Search memories"
      />
    </div>
  )
}
