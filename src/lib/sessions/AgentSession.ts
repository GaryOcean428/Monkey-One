import { Agent, Message, MessageType, MemoryItem, MemoryType, AgentStatus } from '../../types';
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
  private status: AgentStatus = AgentStatus.IDLE;
  private metadata: Record<string, any> = {};

  constructor(agent: Agent, options: SessionOptions = {}) {
    this.agent = agent;
    this.options = { 
      maxHistorySize: options.maxHistorySize ?? defaultOptions.maxHistorySize,
      maxMemorySize: options.maxMemorySize ?? defaultOptions.maxMemorySize,
      persistenceEnabled: options.persistenceEnabled ?? defaultOptions.persistenceEnabled,
      saveInterval: options.saveInterval ?? defaultOptions.saveInterval
    };
  }

  getId(): string {
    return this.agent.id;
  }

  getAgent(): Agent {
    return this.agent;
  }

  getState() {
    return {
      history: this.history,
      memory: this.memory,
      status: this.status,
      context: this.context,
      metadata: this.metadata
    };
  }

  async addMessage(message: Message): Promise<void> {
    if (!message.type || !message.content) {
      throw new RuntimeError('Invalid message: type and content are required');
    }

    // Manage history size
    if (this.history.length >= this.options.maxHistorySize) {
      this.history.shift();
    }
    this.history.push(message);
  }

  getHistory(): Message[] {
    return [...this.history];
  }

  async addMemoryItem(item: MemoryItem): Promise<void> {
    if (!item.type || !item.content) {
      throw new RuntimeError('Invalid memory item: type and content are required');
    }

    // Manage memory size
    if (this.memory.length >= this.options.maxMemorySize) {
      this.memory.shift();
    }
    this.memory.push(item);
  }

  getMemory(): MemoryItem[] {
    return [...this.memory];
  }

  getMemoryByType(type: MemoryType): MemoryItem[] {
    return this.memory.filter(item => item.type === type);
  }

  setContext(key: string, value: any): void {
    this.context[key] = value;
  }

  getContext(key: string): any {
    return this.context[key];
  }

  async updateStatus(status: AgentStatus): Promise<void> {
    this.status = status;
  }

  async updateMetadata(metadata: Record<string, any>): Promise<void> {
    this.metadata = { ...this.metadata, ...metadata };
  }

  async save(): Promise<void> {
    if (!this.options.persistenceEnabled) {
      throw new RuntimeError('Persistence is not enabled');
    }
    // Implement actual persistence logic here
  }

  async load(): Promise<void> {
    if (!this.options.persistenceEnabled) {
      throw new RuntimeError('Persistence is not enabled');
    }
    // Implement actual load logic here
  }

  async clear(): Promise<void> {
    this.history = [];
    this.memory = [];
    this.context = {};
  }

  dispose(): void {
    // Cleanup logic
    this.clear();
  }
}
