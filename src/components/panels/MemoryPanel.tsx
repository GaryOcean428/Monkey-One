import React, { Suspense } from 'react';
import useMemory from '../../hooks/useMemory';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Card } from '../ui/card';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

function MemoryContent() {
  const { memories, isLoading, error } = useMemory();

  if (error) {
    throw error; // Will be caught by error boundary
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memories.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <p>No memories stored yet.</p>
        </div>
      ) : (
        memories.map((memory) => (
          <Card 
            key={memory.id} 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            role="article"
            aria-labelledby={`memory-${memory.id}`}
          >
            <p 
              id={`memory-${memory.id}`}
              className="text-gray-800 dark:text-gray-200"
            >
              {memory.content}
            </p>
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
          </Card>
        ))
      )}
    </div>
  );
}

export default function MemoryPanel() {
  return (
    <div 
      className="h-full p-4 bg-gray-50 dark:bg-gray-900"
      role="region"
      aria-label="Memory Management"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Memory</h2>
        <ToolhouseErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <MemoryContent />
          </Suspense>
        </ToolhouseErrorBoundary>
      </div>
    </div>
  );
}