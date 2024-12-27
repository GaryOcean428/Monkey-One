import { useState, useEffect } from 'react';
import { memoryManager } from '../lib/memory';

interface Memory {
  id: string;
  content: string;
  tags: string[];
  timestamp?: number;
}

export function useMemory() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadMemories() {
      try {
        const recentMemories = await memoryManager.getRecent(10);
        setMemories(recentMemories);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load memories'));
      } finally {
        setIsLoading(false);
      }
    }

    loadMemories();
  }, []);

  return { memories, isLoading, error };
}

export default useMemory;