import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface MemorySearchProps {
  onSearch: (query: string) => Promise<void>
}

export const MemorySearch: React.FC<MemorySearchProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSearch(query)
  }

  return (
    <form onSubmit={handleSearch} className="flex space-x-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search memories..."
        className="flex-1"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
