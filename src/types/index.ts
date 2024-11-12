export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  superiorId?: string;
  subordinates: string[];
}

export interface MemoryItem {
  id: string;
  type: 'instruction' | 'response' | 'error';
  content: string;
  tags: string[];
  timestamp: number;
}

export interface Tool {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}