import React from 'react'
import { useMemory } from '../../hooks/useMemory'
import { MemoryList } from './MemoryList'
import { MemorySearch } from './MemorySearch'
import { Button } from '../ui/button'

export const MemoryManager: React.FC = () => {
  const { memories, isLoading, error, search, clear } = useMemory()

  const handleSearch = async (query: string) => {
    await search(query)
  }

  const handleClear = async () => {
    await clear()
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memories</h2>
        <Button onClick={handleClear} variant="danger">
          Clear All
        </Button>
      </div>
      <MemorySearch onSearch={handleSearch} />
      <MemoryList memories={memories} isLoading={isLoading} />
    </div>
  )
}
