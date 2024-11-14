// Core Types
export type MessageType = 
  | 'command'
  | 'response'
  | 'error'
  | 'status'
  | 'event'
  | 'broadcast';

// Agent Types
export interface AgentInterface {
  protected readonly name: string;
  getName(): string;
  handleMessage(message: Message): Promise<void>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): AgentState;
  getCapabilities(): string[];
  handleError(error: Error): Promise<void>;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string | Record<string, unknown>;
  sender: string;
  recipient: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  retryCount?: number;
  priority?: number;
  correlationId?: string;
  sessionId?: string;
  language?: string;
}

export interface TaskLedger {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: unknown;
  error?: Error;
}

export interface ProgressLedger {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

export interface AgentConfig {
  name: string;
  description?: string;
  capabilities?: string[];
  maxConcurrent?: number;
  timeout?: number;
  retries?: number;
  tools?: Tool[];
  taskLedger?: TaskLedger;
  progressLedger?: ProgressLedger;
  metadata?: AgentMetadata;
}

export interface AgentState {
  status: 'idle' | 'busy' | 'error';
  currentTask?: string;
  lastError?: Error;
  metrics: Record<string, number>;
  isInitialized: boolean;
  isProcessing: boolean;
  metadata?: Record<string, unknown>;
}

export interface ExecutionContext {
  taskId: string;
  parentId?: string;
  startTime: Date;
  timeout?: number;
  metadata?: Record<string, unknown>;
  agent?: AgentInterface;
}

export interface AgentMetadata extends Record<string, unknown> {
  id: string;
  version: string;
  capabilities: string[];
  dependencies: string[];
  author?: string;
  license?: string;
  tools?: string[];
}

// User Management Types
export interface UserProfile {
  id: string;
  username: string;
  preferences: Record<string, unknown>;
  capabilities: string[];
  lastActive: Date;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  context: Record<string, unknown>;
}

// Tool System Types
export interface Tool {
  name: string;
  description: string;
  version: string;
  category: string;
  execute(args: Record<string, unknown>): Promise<unknown>;
  validateArgs(args: Record<string, unknown>): Promise<void>;
  cleanup(): Promise<void>;
  metrics: ToolMetrics;
  
  // Optional configuration
  timeout?: number;
  rateLimit?: number;
  cache?: boolean;
  dependencies?: string[];
  retries?: number;
}

export interface ToolMetrics {
  totalCalls: number;
  successRate: number;
  averageLatency: number;
  errorCounts: Record<string, number>;
  lastExecuted: Date;
  resourceUsage: {
    cpu: number;
    memory: number;
  };
}

// Monitoring System Types
export interface MonitoringMetrics {
  // System metrics
  counters: Record<string, number>;
  gauges: Record<string, number>;
  histograms: Record<string, number[]>;
  operations: Record<string, number>;
  operationDuration: Record<string, number>;
  
  // Performance metrics
  successCount: number;
  errorCount: number;
  avgProcessingTime: number;
  lastError?: Error;
  
  // User metrics
  userMetrics: {
    activeUsers: number;
    averageResponseTime: number;
    sessionDurations: number[];
    errorRates: Record<string, number>;
  };
  
  // NLP metrics
  nlpMetrics: {
    intentRecognitionRate: number;
    confidenceScores: number[];
    processingTimes: number[];
  };
  
  // Resource metrics
  resourceMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
  };
  
  // Events
  events: Array<{
    name: string;
    timestamp: Date;
    details: Record<string, unknown>;
  }>;
}

export interface AgentMonitor {
  recordMetric(name: string, value: number): void;
  recordEvent(name: string, details: Record<string, unknown>): void;
  getMetrics(): MonitoringMetrics;
  reset(): void;
}

// Queue Types
export interface MessageQueueInterface {
  enqueue(message: Message): void;
  dequeue(): Message | null;
  peek(): Message | null;
  size(): number;
  clear(): void;
}

// Runtime Types
export interface RuntimeConfig {
  maxConcurrent: number;
  timeout: number;
  retries: number;
  monitoring: boolean;
  batchSize?: number;
  maxQueueSize?: number;
  messageTimeout?: number;
  priorityLevels?: number;
  persistenceEnabled?: boolean;
  monitoringEnabled?: boolean;
  processingTimeout?: number;
  maxRetries?: number;
}

export interface RuntimeMetrics {
  activeAgents: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  queueSize?: number;
  isProcessing?: boolean;
  operationMetrics?: Record<string, number>;
}

// Error Handling Types
export interface ErrorDetails {
  severity: 'info' | 'warning' | 'error' | 'critical';
  errorId: string;
  timestamp: Date;
  toolName?: string;
  originalError?: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
  [key: string]: string | number | boolean | ErrorDetails | null | undefined;
}

export interface ToolError extends Error {
  code?: string;
  details?: Record<string, unknown>;
  context?: ToolContext;
}

// Natural Language Processing Types
export interface NLPResult {
  intent: string;
  confidence: number;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  sentiment?: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
  language: string;
}

// Pipeline Types
export interface ToolPipelineStage {
  tool: string;
  args: Record<string, unknown>;
  condition?: (prevResult: unknown) => boolean | Promise<boolean>;
  transform?: (prevResult: unknown) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

export interface ToolPipelineOptions {
  stopOnError?: boolean;
  parallel?: boolean;
  maxConcurrency?: number;
  timeout?: number;
  retries?: number;
}

// Testing Types 
export interface MockTool extends Partial<Tool> {
  name?: string;
  description?: string;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
  timeout?: number;
  rateLimit?: number;
  cache?: boolean;
  dependencies?: string[];
  retries?: number;
}

export interface ToolValidation {
  required?: string[];
  validate?: (args: Record<string, unknown>) => void | Promise<void>;
}

export interface ToolMonitoring {
  onStart?: (context: ToolContext) => void | Promise<void>;
  onEnd?: (context: ToolContext, result: ToolResult) => void | Promise<void>;
  onError?: (context: ToolContext, error: ToolError) => void | Promise<void>;
}

export interface ToolContext {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  attempts: number;
  cached: boolean;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata?: Record<string, unknown>;
}
