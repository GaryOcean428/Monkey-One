import React from 'react'
import { Card } from '../ui/Card'
import { Memory } from '../../types/memory'

interface MemoryListProps {
  memories: Memory[]
}

export const MemoryList: React.FC<MemoryListProps> = ({ memories }) => {
  return (
    <div className="space-y-4">
      {memories.map(memory => (
        <Card key={memory.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {memory.content}
              </p>
              {Object.keys(memory.metadata).length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-500">Metadata</h4>
                  <div className="mt-1 text-xs text-gray-500">
                    {Object.entries(memory.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 text-xs text-gray-500">
              {new Date(memory.createdAt).toLocaleString()}
            </div>
          </div>
        </Card>
      ))}
      {memories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No memories found
        </div>
      )}
    </div>
  )
}
