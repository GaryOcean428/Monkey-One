import { Agent, AgentType } from '@/types'
import { RuntimeError } from '../errors/AgentErrors'

export interface AgentConstructor {
  new (capabilities: string[]): Agent
}

export interface AgentMetadata {
  type: AgentType
  description: string
  capabilities: string[]
  version: string
  author?: string
  dependencies?: string[]
}

export class AgentRegistry {
  private static instance: AgentRegistry
  private agentConstructors: Map<AgentType, AgentConstructor>
  private agentMetadata: Map<AgentType, AgentMetadata>

  private constructor() {
    this.agentConstructors = new Map()
    this.agentMetadata = new Map()
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry()
    }
    return AgentRegistry.instance
  }

  public registerAgentType(
    constructor: AgentConstructor,
    metadata: AgentMetadata
  ): void {
    if (this.agentConstructors.has(metadata.type)) {
      throw new RuntimeError(
        'Agent type already registered',
        { type: metadata.type }
      )
    }

    this.validateMetadata(metadata)
    this.agentConstructors.set(metadata.type, constructor)
    this.agentMetadata.set(metadata.type, metadata)
  }

  public unregisterAgentType(type: AgentType): void {
    if (!this.agentConstructors.has(type)) {
      throw new RuntimeError(
        'Agent type not registered',
        { type }
      )
    }

    this.agentConstructors.delete(type)
    this.agentMetadata.delete(type)
  }

  public getAgentConstructor(type: AgentType): AgentConstructor {
    const constructor = this.agentConstructors.get(type)
    if (!constructor) {
      throw new RuntimeError(
        'Agent type not registered',
        { type }
      )
    }
    return constructor
  }

  public getAgentMetadata(type: AgentType): AgentMetadata {
    const metadata = this.agentMetadata.get(type)
    if (!metadata) {
      throw new RuntimeError(
        'Agent type not registered',
        { type }
      )
    }
    return { ...metadata }
  }

  public getAllAgentTypes(): AgentType[] {
    return Array.from(this.agentConstructors.keys())
  }

  public getAgentsByCapability(capability: string): AgentType[] {
    return Array.from(this.agentMetadata.entries())
      .filter(([_, metadata]) => metadata.capabilities.includes(capability))
      .map(([type]) => type)
  }

  public getAgentsByDependency(dependency: string): AgentType[] {
    return Array.from(this.agentMetadata.entries())
      .filter(([_, metadata]) => metadata.dependencies?.includes(dependency))
      .map(([type]) => type)
  }

  public validateCapabilities(type: AgentType, capabilities: string[]): boolean {
    const metadata = this.agentMetadata.get(type)
    if (!metadata) {
      throw new RuntimeError(
        'Agent type not registered',
        { type }
      )
    }

    return capabilities.every(cap => metadata.capabilities.includes(cap))
  }

  public checkDependencies(type: AgentType): boolean {
    const metadata = this.agentMetadata.get(type)
    if (!metadata) {
      throw new RuntimeError(
        'Agent type not registered',
        { type }
      )
    }

    if (!metadata.dependencies?.length) {
      return true
    }

    return metadata.dependencies.every(dep => {
      const dependentTypes = this.getAgentsByCapability(dep)
      return dependentTypes.length > 0
    })
  }

  public createAgent(type: AgentType, capabilities: string[]): Agent {
    const constructor = this.getAgentConstructor(type)
    
    if (!this.validateCapabilities(type, capabilities)) {
      throw new RuntimeError(
        'Invalid capabilities for agent type',
        { type, capabilities }
      )
    }

    if (!this.checkDependencies(type)) {
      throw new RuntimeError(
        'Missing dependencies for agent type',
        { type }
      )
    }

    return new constructor(capabilities)
  }

  private validateMetadata(metadata: AgentMetadata): void {
    if (!metadata.type || !metadata.description || !metadata.capabilities || !metadata.version) {
      throw new RuntimeError(
        'Invalid agent metadata',
        { metadata }
      )
    }

    if (!Object.values(AgentType).includes(metadata.type)) {
      throw new RuntimeError(
        'Invalid agent type',
        { type: metadata.type }
      )
    }

    if (!metadata.capabilities.length) {
      throw new RuntimeError(
        'Agent must have at least one capability',
        { type: metadata.type }
      )
    }

    if (!this.validateVersion(metadata.version)) {
      throw new RuntimeError(
        'Invalid version format',
        { version: metadata.version }
      )
    }
  }

  private validateVersion(version: string): boolean {
    // Semantic versioning regex
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
    return semverRegex.test(version)
  }

  public reset(): void {
    this.agentConstructors.clear()
    this.agentMetadata.clear()
  }
}
