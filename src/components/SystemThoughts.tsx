import React from 'react'
import { useThoughtStore } from '../store/thoughtStore'

export const SystemThoughts: React.FC = () => {
  const thoughts = useThoughtStore(state => state.thoughts)

  return (
    <div className="h-full p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Thoughts</h2>
      </div>
      <div className="space-y-4 overflow-y-auto">
        {thoughts.map((thought, index) => (
          <div key={index} className="bg-accent/10 rounded-lg p-3">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium">{thought.type}</span>
              <span className="text-muted-foreground text-xs">
                {thought.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{thought.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
