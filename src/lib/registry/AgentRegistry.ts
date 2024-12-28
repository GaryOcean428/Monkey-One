import { Agent, AgentType } from '../types/core';
import { RuntimeError } from '../errors/AgentErrors';
import { logger } from '../../utils/logger';
import { BaseAgent } from '../agents/base';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, () => Promise<Agent>>;

  private constructor() {
    this.agents = new Map();
    this.registerBaseAgent();
  }

  private registerBaseAgent() {
    this.agents.set('BASE', async () => {
      const agent = new BaseAgent('base-agent', 'Base Agent');
      await agent.initialize();
      return agent;
    });
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  async register(type: string, factory: () => Promise<Agent>): Promise<void> {
    if (this.agents.has(type)) {
      throw new RuntimeError(`Agent type ${type} is already registered`);
    }
    this.agents.set(type, factory);
    logger.info(`Agent type ${type} registered`);
  }

  async unregister(type: string): Promise<void> {
    if (!this.agents.has(type)) {
      throw new RuntimeError(`Agent type ${type} not registered`);
    }
    this.agents.delete(type);
  }

  async createAgent(type: string): Promise<Agent> {
    const factory = this.agents.get(type);
    if (!factory) {
      throw new RuntimeError(`Agent type ${type} not found`);
    }
    return factory();
  }

  hasAgent(type: string): boolean {
    return this.agents.has(type);
  }

  reset(): void {
    this.agents.clear();
    this.registerBaseAgent();
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.agents.keys());
  }
}