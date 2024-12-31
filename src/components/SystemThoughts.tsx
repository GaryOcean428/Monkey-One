import React from 'react';
import { useThoughtStore } from '../store/thoughtStore';

export const SystemThoughts: React.FC = () => {
  const thoughts = useThoughtStore(state => state.thoughts);

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">System Thoughts</h2>
      </div>
      <div className="space-y-4 overflow-y-auto">
        {thoughts.map((thought, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-accent/10"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{thought.type}</span>
              <span className="text-xs text-muted-foreground">
                {thought.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm">{thought.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
