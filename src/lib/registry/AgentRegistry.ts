import { BaseAgent } from '../agents/base';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private registry: Map<string, () => BaseAgent>;

  private constructor() {
    this.registry = new Map();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  register(type: string, factory: () => BaseAgent) {
    this.registry.set(type, factory);
  }

  create(type: string): BaseAgent {
    const factory = this.registry.get(type);
    if (!factory) {
      throw new Error(`Agent type ${type} not registered.`);
    }
    return factory();
  }

  unregister(type: string) {
    if (!this.registry.has(type)) {
      throw new Error(`Agent type ${type} not registered.`);
    }
    this.registry.delete(type);
  }

  reset() {
    this.registry.clear();
  }
}