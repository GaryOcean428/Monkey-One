import { AgentType, AgentCapability } from '../../types';
import { BaseAgent } from '../agents/BaseAgent';
import { RuntimeError } from '../errors/AgentErrors';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agentTypes: Map<AgentType, typeof BaseAgent>;

  private constructor() {
    this.agentTypes = new Map();
    this.registerDefaultAgents();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerDefaultAgents(): void {
    // Register the base agent type
    this.registerAgentType(AgentType.BASE, BaseAgent);
  }

  registerAgentType(type: AgentType, agentClass: typeof BaseAgent): void {
    if (this.agentTypes.has(type)) {
      throw new RuntimeError(`Agent type ${type} is already registered`);
    }
    this.agentTypes.set(type, agentClass);
  }

  createAgent(type: AgentType, capabilities: AgentCapability[] = []): BaseAgent {
    const AgentClass = this.agentTypes.get(type);
    if (!AgentClass) {
      throw new RuntimeError(`Agent type ${type} not registered`);
    }
    return new AgentClass(capabilities);
  }

  getAgentTypes(): AgentType[] {
    return Array.from(this.agentTypes.keys());
  }

  isRegistered(type: AgentType): boolean {
    return this.agentTypes.has(type);
  }
}