import React from 'react';
import { useMemory } from '@/hooks/useMemory';

export default function MemoryPanel() {
  const { memories } = useMemory();

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Memory</h2>
        {memories.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p>No memories stored yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <div key={memory.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <p className="text-gray-800 dark:text-gray-200">{memory.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}