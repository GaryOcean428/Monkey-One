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

export enum AgentStatus {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  ERROR = 'ERROR',
  OFFLINE = 'OFFLINE'
}

export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  COMMAND = 'COMMAND',
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sender?: string;
  recipient?: string;
  timestamp?: number | Date;
  status?: string;
  role?: string;
}

export type AgentCapability = string;

export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  name?: string;
  description?: string;
  
  getCapabilities(): AgentCapability[];
  hasCapability(capability: AgentCapability): boolean;
  addCapability(capability: AgentCapability): void;
  removeCapability(capability: AgentCapability): void;
  processMessage(message: Message): Promise<void>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

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

export interface AgentMetrics {
  totalMessages: number;
  averageResponseTime: number;
  successRate: number;
  lastActive: number;
  status: string;
}

export interface TaskMessage extends Message {
  task?: any;
}
