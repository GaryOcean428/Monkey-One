import React from 'react'
import { Memory } from '../../types/memory'

interface MemoryListProps {
  memories: Memory[]
  isLoading: boolean
}

export const MemoryList: React.FC<MemoryListProps> = ({ memories, isLoading }) => {
  if (isLoading) {
    return <div className="p-4">Loading memories...</div>
  }

  if (!memories.length) {
    return <div className="p-4">No memories found</div>
  }

  return (
    <div className="space-y-4">
      {memories.map((memory) => (
        <div key={memory.id} className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">{memory.content}</p>
          <div className="mt-2 text-xs text-gray-400">
            Created: {new Date(memory.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}
