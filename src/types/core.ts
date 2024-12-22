// Runtime types
export interface BaseRuntime {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
}

export interface WorkerConfig {
  maxConcurrentTasks: number;
  taskTimeout: number;
  retryAttempts: number;
}

export interface WorkerId {
  id: string;
  type: string;
}

export interface WorkerStatus {
  isActive: boolean;
  currentLoad: number;
  lastHeartbeat: number;
}

// Agent types
export interface AgentState {
  id: string;
  status: 'idle' | 'active' | 'error';
  currentTask?: string;
  memory: Record<string, unknown>;
}

export interface AgentMetrics {
  successRate: number;
  responseTime: number;
  errorRate: number;
  taskCompletion: number;
}

// State management types
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

// Session types
export interface SessionStore {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

// Code execution types
export interface CodeBlock {
  language: string;
  code: string;
  context?: Record<string, unknown>;
}

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
}

// Message types
export interface DebateMessage {
  id: string;
  content: string;
  from: string;
  round: number;
  timestamp: number;
}

// Agent type definitions
export type AgentType = 'orchestrator' | 'coder' | 'websurfer' | 'filesurfer';