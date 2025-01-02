import { EventEmitter } from 'events'
import { Tool } from '../../tools/registry/Tool'
import type { MessagePayload, MessageResponse } from '../../lib/types/messages'
import type { ToolEvent, ToolResponse } from '../../lib/types/tool'
import { Queue } from '../../utils/Queue'
import { agentQueries } from '../../lib/supabase/agents'

export interface AgentConfig {
  name: string
  capabilities: string[]
  maxRetries?: number
  timeout?: number
}

export abstract class BaseAgent extends EventEmitter {
  protected name: string
  protected capabilities: Set<string>
  protected messageQueue: Queue<{
    payload: MessagePayload
    response: (response: MessageResponse) => void
  }>
  protected maxRetries: number
  protected timeout: number
  protected id: string
  protected status: 'idle' | 'busy' | 'error' = 'idle'
  private capabilityMetrics: Map<string, { used: number; success: number }> = new Map()

  constructor(config: AgentConfig) {
    super()
    this.name = config.name
    this.capabilities = new Set(config.capabilities)
    this.messageQueue = new Queue<{
      payload: MessagePayload
      response: (response: MessageResponse) => void
    }>()
    this.maxRetries = config.maxRetries || 3
    this.timeout = config.timeout || 30000

    // Create agent record in database
    this.initializeAgent()
  }

  private async initializeAgent() {
    try {
      const agent = await agentQueries.createAgent({
        name: this.name,
        type: this.constructor.name,
        status: this.status,
        capabilities: Array.from(this.capabilities),
      })
      this.id = agent.id
      this.emit('initialized', { id: this.id, type: this.constructor.name })
    } catch (error) {
      this.status = 'error'
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Add a new capability to the agent
   */
  public addCapability(capability: string): void {
    this.capabilities.add(capability)
    this.capabilityMetrics.set(capability, { used: 0, success: 0 })
    this.emit('capabilityAdded', capability)
  }

  /**
   * Remove a capability from the agent
   */
  public removeCapability(capability: string): boolean {
    const removed = this.capabilities.delete(capability)
    if (removed) {
      this.capabilityMetrics.delete(capability)
      this.emit('capabilityRemoved', capability)
    }
    return removed
  }

  /**
   * Check if agent has a specific capability
   */
  public hasCapability(capability: string): boolean {
    return this.capabilities.has(capability)
  }

  /**
   * Get all capabilities
   */
  public getCapabilities(): string[] {
    return Array.from(this.capabilities)
  }

  /**
   * Track capability usage and success
   */
  protected trackCapabilityUsage(capability: string, success: boolean): void {
    const metrics = this.capabilityMetrics.get(capability) || { used: 0, success: 0 }
    metrics.used++
    if (success) metrics.success++
    this.capabilityMetrics.set(capability, metrics)
  }

  /**
   * Get capability performance metrics
   */
  public getCapabilityMetrics(): {
    [key: string]: { used: number; success: number; successRate: number }
  } {
    const metrics: { [key: string]: { used: number; success: number; successRate: number } } = {}
    this.capabilityMetrics.forEach((value, key) => {
      metrics[key] = {
        ...value,
        successRate: value.used > 0 ? value.success / value.used : 0,
      }
    })
    return metrics
  }

  protected async storeThought(type: string, message: string, metadata?: any) {
    try {
      await agentQueries.storeAgentThought({
        agent_id: this.id,
        type,
        message,
        metadata,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      this.emit('error', { type: 'thoughtStorageError', error })
    }
  }

  protected async storeMemory(key: string, value: any, metadata?: any) {
    await agentQueries.storeAgentMemory({
      agent_id: this.id,
      key,
      value,
      metadata,
    })
  }

  protected async updateStatus(status: string) {
    await agentQueries.updateAgentStatus(this.id, status)
  }

  public getName(): string {
    return this.name
  }

  public async enqueueMessage(
    payload: MessagePayload,
    response: (response: MessageResponse) => void
  ): Promise<void> {
    await this.messageQueue.enqueue({ payload, response })
    this.emit('messageReceived', payload)
  }

  public abstract async handleRequest(
    capability: string,
    params: MessagePayload
  ): Promise<MessageResponse>

  public abstract async handleToolUse(tool: Tool): Promise<MessageResponse>

  protected async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.retry(operation, retries - 1)
      }
      throw error
    }
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    return Promise.race([promise, timeout])
  }

  protected validateMessage(payload: MessagePayload): boolean {
    return payload && typeof payload.content === 'string' && payload.content.length > 0
  }

  protected logError(error: Error, context?: any): void {
    this.emit('error', {
      agent: this.name,
      error: error.message,
      stack: error.stack,
      context,
    })
  }

  protected async handleToolEvent(_event: Record<string, unknown>): Promise<MessageResponse> {
    throw new Error('Method not implemented')
  }

  protected async processError(_error: Error): Promise<MessageResponse> {
    throw new Error('Method not implemented')
  }

  protected async validateInput(_input: Record<string, unknown>): Promise<boolean> {
    throw new Error('Method not implemented')
  }

  protected async transformResponse(_response: Record<string, unknown>): Promise<MessageResponse> {
    throw new Error('Method not implemented')
  }

  protected async handleToolResponse(_response: ToolResponse): Promise<MessageResponse> {
    // Implementation
  }

  protected async validateToolEvent(_event: ToolEvent): Promise<boolean> {
    // Implementation
  }

  protected async processToolResponse(_response: ToolResponse): Promise<MessageResponse> {
    // Implementation
  }

  protected async transformToolEvent(_event: ToolEvent): Promise<Record<string, unknown>> {
    // Implementation
  }
}
