import { BaseAgent } from '../agents/base';

export class AgentRegistry {
  private static registry: Map<string, () => BaseAgent> = new Map();

  static register(type: string, factory: () => BaseAgent) {
    this.registry.set(type, factory);
  }

  static create(type: string): BaseAgent {
    const factory = this.registry.get(type);
    if (!factory) {
      throw new Error(`Agent type ${type} not registered.`);
    }
    return factory();
  }
}