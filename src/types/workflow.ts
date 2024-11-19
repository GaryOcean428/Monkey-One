export interface WorkflowDefinition {
  id: string;
  taskId: string;
  name?: string;
  description?: string;
  status: 'initializing' | 'in_progress' | 'completed' | 'failed' | 'saved';
  team: Array<{
    id: string;
    role: string;
    status: 'standby' | 'active' | 'completed' | 'failed';
  }>;
  steps: Array<{
    id: string;
    agentId: string;
    action: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    startedAt?: number;
    completedAt?: number;
    error?: string;
  }>;
  created: number;
  updated: number;
  metadata: {
    originalTask: AgentTask;
    iterationCount: number;
    successMetrics: {
      accuracy: number;
      efficiency: number;
      reliability: number;
    };
  };
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  requirements: string[];
  suggestedTeam: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  created: number;
  completed?: number;
  metadata: Record<string, unknown>;
}