import { AgentCapability, Message } from '../../types';

export class BaseAgent {
  private capabilities: Set<AgentCapability>;
  private id: string;
  private type: string;

  constructor(capabilities: AgentCapability[] = [], id?: string, type: string = 'base') {
    this.capabilities = new Set(capabilities);
    this.id = id || `${type}-${Date.now()}`;
    this.type = type;
  }

  getId(): string {
    return this.id;
  }

  getType(): string {
    return this.type;
  }

  hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability);
  }

  addCapability(capability: AgentCapability): void {
    this.capabilities.add(capability);
  }

  removeCapability(capability: AgentCapability): void {
    this.capabilities.delete(capability);
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities);
  }

  async processMessage(message: Message): Promise<void> {
    // Base implementation - to be overridden by specific agent types
    console.log(`Processing message in base agent: ${message.content}`);
  }

  async initialize(): Promise<void> {
    // Base initialization - to be overridden by specific agent types
    console.log(`Initializing base agent: ${this.id}`);
  }

  async shutdown(): Promise<void> {
    // Base shutdown - to be overridden by specific agent types
    console.log(`Shutting down base agent: ${this.id}`);
  }
}
