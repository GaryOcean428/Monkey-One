export type WorkerConfig = {
  id: string;
  type: string;
  options?: Record<string, unknown>;
};

export type WorkerId = string;

export type WorkerStatus = {
  id: WorkerId;
  status: 'running' | 'stopped' | 'error';
  lastHeartbeat?: Date;
};

// Convert AgentType from type to enum
export enum AgentType {
  BASE = 'BASE',
  ORCHESTRATOR = 'orchestrator',
  CODER = 'coder',
  WEBSURFER = 'websurfer',
  FILESURFER = 'filesurfer'
}

export type SessionStore = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
};

export type AgentState = {
  id: string;
  type: AgentType;
  status: string;
  data: Record<string, unknown>;
};

export interface Tool {
  name: string;
  description: string;
  execute(args: Record<string, unknown>): Promise<unknown>;
}

// Convert to enum
export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR'
}

// Convert to enum 
export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  TASK = 'TASK',
  RESPONSE = 'RESPONSE',
  COMMAND = 'COMMAND'
}

// Update Message type
export type Message = {
  id: string;
  type: MessageType;
  content: string; 
  sender?: string;
  recipient?: string;
  timestamp?: number | Date;
  status?: string;
  role?: string;
};

// Update Agent interface
export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  subordinates?: Agent[];
  capabilities: Array<{name: string, description?: string}>;
  getCapabilities(): Array<{name: string, description?: string}>;
  registerCapability(cap: {name: string, description?: string}): void;
  handleMessage(message: Message): Promise<Message>;
  initialize(): Promise<void>;
}

// Add MemoryItem and MemoryType
export interface MemoryItem {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: Date;
}

export enum MemoryType {
  CONVERSATION = 'conversation',
  KNOWLEDGE = 'knowledge',
  TASK = 'task'
}

// Update State interfaces
export interface StateConfig {
  allowedTransitions: Array<{
    from: AgentStatus;
    to: AgentStatus;
    condition?: () => boolean;
    action?: () => Promise<void>;
  }>;
  onEnter?: () => void;
  onExit?: () => void;
  onMessage?: (agent: Agent, message: Message) => void;
  timeout?: number;
  maxRetries?: number;
}

export interface StateContext {
  agent: Agent;
  message?: Message;
}

// Remove duplicate AgentStatus type declaration
// export type AgentStatus = 'IDLE' | 'BUSY' | 'ERROR';

export interface AgentMetrics {
  totalMessages: number;
  averageResponseTime: number;
  successRate: number;
  lastActive: number;
  status: string;
}

export type TaskMessage = Message & {
  task?: any;
};
