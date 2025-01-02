import React from 'react'
import { Card } from '../ui/Card'
import { useMemory } from '../../hooks/useMemory'
import { MemoryList } from './MemoryList'
import { MemorySearch } from './MemorySearch'
import { Button } from '../ui/Button'

export interface MemoryManagerProps {
  className?: string
}

const MemoryManager: React.FC<MemoryManagerProps> = ({ className = '' }) => {
  const { memories, search, clear, isLoading } = useMemory()
  const [searchQuery, setSearchQuery] = React.useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    search(query)
  }

  const handleClear = () => {
    setSearchQuery('')
    clear()
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Memory Manager</h1>
        <Button onClick={handleClear} variant="secondary">
          Clear
        </Button>
      </div>

      <Card className="p-4">
        <MemorySearch
          value={searchQuery}
          onChange={handleSearch}
          className="mb-4"
        />

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <MemoryList memories={memories} />
        )}
      </Card>
    </div>
  )
}

export default MemoryManager
