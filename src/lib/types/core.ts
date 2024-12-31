export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  TASK = 'TASK',
  RESPONSE = 'RESPONSE',
  ERROR = 'ERROR',
  BROADCAST = 'BROADCAST',
  HANDOFF = 'HANDOFF',
  COMMAND = 'COMMAND'  // Adding missing COMMAND type
}

export enum AgentType {
  ORCHESTRATOR = 'ORCHESTRATOR',
  WORKER = 'WORKER',
  SPECIALIST = 'SPECIALIST'
}

export enum AgentStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
  IDLE = 'IDLE'
}

export interface Message {
  id: string;
  type: MessageType;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  status?: 'sending' | 'sent' | 'error';
  sender?: string;
  recipient?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
}

export interface AgentMetrics {
  messageCount: number;
  errorCount: number;
  averageResponseTime: number;
  status: AgentStatus;
  lastActive: number;
  successRate: number;
}

export interface Agent {
  id: string;
  type: AgentType;
  capabilities: AgentCapability[];
  status: AgentStatus;
  
  initialize(): Promise<void>;
  processMessage(message: Message): Promise<Message>;
  getCapabilities(): AgentCapability[];
  hasCapability(name: string): boolean;
  addCapability(capability: AgentCapability): void;
  removeCapability(name: string): void;
  shutdown(): Promise<void>;
}
