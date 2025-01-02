import { AgentType, AgentCapability, Message } from '../../../types'
import { Logger } from '../../logger/Logger'

export interface AgentConfig {
  type: AgentType
  capabilities: AgentCapability[]
}

export abstract class BaseAgent {
  protected readonly type: AgentType
  protected readonly capabilities: Set<AgentCapability>
  protected readonly logger: Logger
  protected id: string

  constructor(config: AgentConfig) {
    this.type = config.type
    this.capabilities = new Set(config.capabilities)
    this.logger = new Logger(`Agent:${config.type}`)
    this.id = `${config.type}-${Date.now()}`
  }

  public getId(): string {
    return this.id
  }

  public getType(): AgentType {
    return this.type
  }

  public hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability)
  }

  public getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities)
  }

  abstract handleMessage(message: Message): Promise<void>
  abstract shutdown(): Promise<void>
}
