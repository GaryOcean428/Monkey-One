import { useState } from 'react';

interface Memory {
  id: string;
  content: string;
  tags: string[];
}

export function useMemory() {
  const [memories] = useState<Memory[]>([]);
  return { memories };
}