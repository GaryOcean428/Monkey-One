import { Agent, AgentType, AgentStatus, Message, AgentCapability } from '../../../types/core';
import { logger } from '../../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class BaseAgent implements Agent {
  id: string;
  name: string;
  type: AgentType;
  capabilities: AgentCapability[];
  status: AgentStatus;

  constructor(id: string = uuidv4(), name: string = 'Base Agent') {
    this.id = id;
    this.name = name;
    this.type = AgentType.SPECIALIST;
    this.capabilities = [];
    this.status = AgentStatus.AVAILABLE;
  }

  async initialize(): Promise<void> {
    logger.info('Base agent initialized', { id: this.id, type: this.type });
  }

  async processMessage(message: Message): Promise<Message> {
    return {
      id: uuidv4(),
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

  getCapabilities(): AgentCapability[] {
    return [...this.capabilities];
  }

  hasCapability(name: string): boolean {
    return this.capabilities.some(cap => cap.name === name);
  }

  addCapability(capability: AgentCapability): void {
    if (!this.hasCapability(capability.name)) {
      this.capabilities.push(capability);
    }
  }

  removeCapability(name: string): void {
    this.capabilities = this.capabilities.filter(cap => cap.name !== name);
  }
}
