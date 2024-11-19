// Core types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  metadata?: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  type: 'orchestrator' | 'coder' | 'websurfer' | 'filesurfer';
  status: 'idle' | 'active' | 'error';
  role?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface Settings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  apiEndpoint: string;
  llm: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    streamResponses: boolean;
    contextLength: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  agents: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    autoDelegation: boolean;
    defaultRole: string;
  };
  memory: {
    maxItems: number;
    retentionDays: number;
    vectorSearch: boolean;
    contextWindowSize: number;
  };
  performance: {
    batchSize: number;
    cacheDuration: number;
    cacheEnabled: boolean;
    debugMode: boolean;
  };
  security: {
    apiKeyRotation: number;
    rateLimit: number;
    sandboxMode: boolean;
    contentFiltering: boolean;
  };
}

export interface Tool {
  name: string;
  description: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
  metadata?: Record<string, unknown>;
}

export interface ToolResult {
  status: 'success' | 'error';
  result?: unknown;
  error?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rejected';
  startTime: number;
  completedTime?: number;
  warnings?: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowDefinition {
  id: string;
  name?: string;
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
  team: Array<{
    id: string;
    role: string;
    status: 'standby' | 'active' | 'completed' | 'failed';
  }>;
  created: number;
  updated: number;
  metadata: {
    successMetrics: {
      accuracy: number;
      efficiency: number;
      reliability: number;
    };
    iterationCount: number;
    originalTask?: unknown;
  };
}

export interface CodeInsight {
  id: string;
  type: 'pattern' | 'performance' | 'solution';
  path: string;
  description: string;
  suggestion?: string;
  confidence: number;
}

export interface LearningMetric {
  timestamp: number;
  accuracy: number;
  loss: number;
  patternScore: number;
  performanceScore: number;
  epoch: number;
}

export interface NeuralArchitecture {
  inputDim: number;
  hiddenLayers: number[];
  outputDim: number;
  activations: string[];
}

export interface State {
  name: string;
  data: Record<string, unknown>;
}

export interface StateContext {
  previousState: State;
  nextState: State;
  data: Record<string, unknown>;
}

export interface StateTransition {
  from: State;
  to: State;
  context: StateContext;
}

export interface AgentCapability {
  name: string;
  description: string;
  version: string;
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

export interface Action {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  payload: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface Feedback {
  id: string;
  type: string;
  content: string;
  rating: number;
  timestamp: number;
}

export interface FormTask {
  id: string;
  type: 'form_filling';
  url: string;
  fields: Record<string, string>;
  submitSelector: string;
  successIndicator: string;
  requiresAuth: boolean;
  credentials?: {
    username: string;
    password: string;
    usernameSelector: string;
    passwordSelector: string;
    submitSelector: string;
  };
}

export interface ScrapingTask {
  id: string;
  type: 'scraping';
  url: string;
  selectors: Record<string, string>;
  options: {
    waitForSelector?: string;
    timeout?: number;
  };
}