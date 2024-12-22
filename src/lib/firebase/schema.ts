export interface FirebaseCollections {
  users: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: number;
    settings?: {
      theme: 'light' | 'dark';
      notifications: boolean;
    };
  };
  
  agents: {
    id: string;
    name: string;
    type: string;
    status: 'idle' | 'active' | 'error';
    capabilities: string[];
    metadata?: Record<string, unknown>;
    createdAt: number;
    lastActive: number;
  };

  workflows: {
    id: string;
    name: string;
    description?: string;
    status: 'initializing' | 'in_progress' | 'completed' | 'failed' | 'saved';
    steps: Array<{
      id: string;
      agentId: string;
      action: string;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      startedAt?: number;
      completedAt?: number;
      error?: string;
    }>;
    createdAt: number;
    updatedAt: number;
    userId: string;
  };

  memories: {
    id: string;
    type: string;
    content: string;
    tags: string[];
    timestamp: number;
    metadata?: Record<string, unknown>;
    userId: string;
  };

  tools: {
    id: string;
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      description: string;
      required: boolean;
    }>;
    implementation: string;
    createdAt: number;
    updatedAt: number;
    userId: string;
  };

  vectorStore: {
    id: string;
    content: string;
    embedding: number[];
    metadata: Record<string, unknown>;
    timestamp: number;
    userId: string;
  };

  brainState: {
    id: string;
    neuralState: {
      architecture: Record<string, unknown>;
      weights: Record<string, unknown>;
      learningRate: number;
      lastUpdated: number;
    };
    emotionalState: {
      valence: number;
      arousal: number;
      dominance: number;
    };
    memories: {
      shortTerm: Array<{
        id: string;
        content: string;
        importance: number;
        timestamp: number;
      }>;
      longTerm: string[];
    };
    timestamp: number;
  };

  metrics: {
    id: string;
    type: 'performance' | 'learning' | 'usage';
    value: number;
    metadata: Record<string, unknown>;
    timestamp: number;
  };
}