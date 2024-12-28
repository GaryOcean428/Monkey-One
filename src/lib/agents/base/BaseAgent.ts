import { Agent, AgentType, AgentStatus, Message } from '../../../types/core';
import { logger } from '../../../utils/logger';

export class BaseAgent implements Agent {
  id: string;
  type: AgentType;
  capabilities: string[];
  status: AgentStatus;

  constructor(id: string, name: string) {
    this.id = id;
    this.type = AgentType.SPECIALIST;
    this.capabilities = [];
    this.status = AgentStatus.AVAILABLE;
  }

  async initialize(): Promise<void> {
    logger.info('Base agent initialized', { id: this.id, type: this.type });
  }

  async processMessage(message: Message): Promise<Message> {
    return {
      id: 'response',
      type: message.type,
      role: 'assistant',
      content: 'Base agent response',
      timestamp: Date.now()
    };
  }

  async shutdown(): Promise<void> {
    this.status = AgentStatus.OFFLINE;
    logger.info('Base agent shutdown', { id: this.id });
  }

  getCapabilities(): string[] {
    return this.capabilities;
  }

  hasCapability(name: string): boolean {
    return this.capabilities.includes(name);
  }

  addCapability(capability: string): void {
    if (!this.hasCapability(capability)) {
      this.capabilities.push(capability);
    }
  }

  removeCapability(name: string): void {
    this.capabilities = this.capabilities.filter(cap => cap !== name);
  }
}
