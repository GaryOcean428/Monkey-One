import { Agent, Message, MemoryItem, MemoryType, AgentStatus } from '../../types/core';
import { RuntimeError } from '../errors/AgentErrors';

export interface SessionOptions {
  maxHistorySize?: number;
  maxMemorySize?: number;
  persistenceEnabled?: boolean;
  saveInterval?: number;
}

const defaultOptions: Required<SessionOptions> = {
  maxHistorySize: 100,
  maxMemorySize: 50,
  persistenceEnabled: false,
  saveInterval: 0
};

export class AgentSession {
  private agent: Agent;
  private options: Required<SessionOptions>;
  private history: Message[] = [];
  private memory: MemoryItem[] = [];
  private context: Record<string, any> = {};
  private status: AgentStatus = 'AVAILABLE';  // Use string literal instead of enum
  private metadata: Record<string, any> = {};
  private cleanupInterval?: NodeJS.Timer;

  constructor(agent: Agent, options: SessionOptions = {}) {
    this.agent = agent;
    this.options = { 
      maxHistorySize: options.maxHistorySize ?? defaultOptions.maxHistorySize,
      maxMemorySize: options.maxMemorySize ?? defaultOptions.maxMemorySize,
      persistenceEnabled: options.persistenceEnabled ?? defaultOptions.persistenceEnabled,
      saveInterval: options.saveInterval ?? defaultOptions.saveInterval
    };

    if (this.options.saveInterval > 0) {
      this.cleanupInterval = setInterval(() => {
        this.save();
      }, this.options.saveInterval);
    }
  }

  // ... (rest of the implementation remains the same)
}
