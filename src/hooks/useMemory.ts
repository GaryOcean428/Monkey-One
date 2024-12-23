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

  useEffect(() => {
    // Get recent memories on mount
    const recentMemories = memoryManager.getRecent(10);
    setMemories(recentMemories);
  }, []);

  return { memories };
}

export default useMemory;