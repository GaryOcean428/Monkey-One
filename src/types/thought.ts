export type ThoughtType = 
  | 'observation'  // For recording facts and events
  | 'reasoning'    // For logical deductions
  | 'plan'         // For outlining steps
  | 'decision'     // For choices made
  | 'critique'     // For self-criticism
  | 'reflection'   // For meta-cognition
  | 'execution'    // For actions taken
  | 'success'      // For successful outcomes
  | 'error'        // For failures and issues
  | 'agent-state'  // For agent status changes
  | 'agent-comm'   // For inter-agent communication
  | 'memory-op'    // For memory operations
  | 'task-plan';   // For task planning events

export interface Thought {
  id: string;
  type: ThoughtType;
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  agentId?: string;
  collaborationId?: string;
  parentThoughtId?: string;
  taskId?: string;
  source?: string;
  importance?: number;
  confidence?: number;
  tags?: string[];
  vectorEmbedding?: number[];
}

export interface ThoughtFilter {
  agentId?: string;
  collaborationId?: string;
  type?: ThoughtType;
  since?: number;
  taskId?: string;
  source?: string;
  tags?: string[];
  minImportance?: number;
  minConfidence?: number;
  searchQuery?: string;
}

export interface ThoughtStats {
  totalThoughts: number;
  thoughtsByType: Record<ThoughtType, number>;
  thoughtsByAgent: Record<string, number>;
  thoughtsByTask: Record<string, number>;
  averageImportance: number;
  averageConfidence: number;
  activeCollaborations: number;
  activeTasks: number;
}
