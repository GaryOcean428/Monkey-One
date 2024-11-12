export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    agentId?: string;
    agentName?: string;
    status?: 'completed' | 'failed';
    taskProgress?: ProgressLedger;
    [key: string]: string | ProgressLedger | undefined;
  };
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  superiorId?: string;
  subordinates: string[];
  capabilities?: string[];
}

export interface AgentConstructor {
  id: string;
  name: string;
  role: string;
  superiorId?: string;
}

export interface MemoryItem {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  tags: string[];
}

export interface TaskLedger {
  facts: string[];
  assumptions: string[];
  currentPlan: string[];
}

export interface ProgressLedger {
  completedSteps: string[];
  currentStep: string | null;
  remainingSteps: string[];
  status: 'idle' | 'planned' | 'in_progress' | 'completed' | 'replanned';
}

export interface Tool {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}
