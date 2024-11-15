import { Agent, AgentStatus, Message, MemoryItem, MemoryType } from '@/types'
import { RuntimeError } from '../errors/AgentErrors'

export interface SessionState {
  id: string
  agentId: string
  status: AgentStatus
  context: Record<string, unknown>
  history: Message[]
  memory: MemoryItem[]
  metadata: Record<string, unknown>
  createdAt: number
  updatedAt: number
}

export interface SessionOptions {
  maxHistorySize?: number
  maxMemorySize?: number
  persistenceEnabled?: boolean
  autoSave?: boolean
  saveInterval?: number
}

export class AgentSession {
  private readonly id: string
  private readonly agent: Agent
  private state: SessionState
  private readonly options: Required<SessionOptions>
  private saveInterval?: NodeJS.Timeout

  constructor(agent: Agent, options: SessionOptions = {}) {
    this.id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.agent = agent
    this.options = {
      maxHistorySize: options.maxHistorySize ?? 1000,
      maxMemorySize: options.maxMemorySize ?? 1000,
      persistenceEnabled: options.persistenceEnabled ?? false,
      autoSave: options.autoSave ?? false,
      saveInterval: options.saveInterval ?? 60000 // 1 minute
    }

    this.state = this.initializeState()

    if (this.options.autoSave && this.options.persistenceEnabled) {
      this.setupAutoSave()
    }
  }

  public getId(): string {
    return this.id
  }

  public getAgent(): Agent {
    return this.agent
  }

  public getState(): SessionState {
    return { ...this.state }
  }

  public async addMessage(message: Message): Promise<void> {
    this.validateMessage(message)
    this.state.history.push(message)

    if (this.state.history.length > this.options.maxHistorySize) {
      this.state.history.shift()
    }

    this.state.updatedAt = Date.now()
    await this.saveState()
  }

  public async addMemoryItem(item: MemoryItem): Promise<void> {
    this.validateMemoryItem(item)
    this.state.memory.push(item)

    if (this.state.memory.length > this.options.maxMemorySize) {
      this.state.memory.shift()
    }

    this.state.updatedAt = Date.now()
    await this.saveState()
  }

  public getContext<T>(key: string): T | undefined {
    return this.state.context[key] as T
  }

  public async setContext<T>(key: string, value: T): Promise<void> {
    this.state.context[key] = value
    this.state.updatedAt = Date.now()
    await this.saveState()
  }

  public getHistory(): Message[] {
    return [...this.state.history]
  }

  public getMemory(): MemoryItem[] {
    return [...this.state.memory]
  }

  public getMemoryByType(type: MemoryType): MemoryItem[] {
    return this.state.memory.filter(item => item.type === type)
  }

  public async updateStatus(status: AgentStatus): Promise<void> {
    this.state.status = status
    this.state.updatedAt = Date.now()
    await this.saveState()
  }

  public async updateMetadata(metadata: Record<string, unknown>): Promise<void> {
    this.state.metadata = {
      ...this.state.metadata,
      ...metadata
    }
    this.state.updatedAt = Date.now()
    await this.saveState()
  }

  public async clear(): Promise<void> {
    this.state = this.initializeState()
    await this.saveState()
  }

  public async save(): Promise<void> {
    if (!this.options.persistenceEnabled) {
      return
    }

    try {
      // In a real implementation, this would save to a database or file
      console.log('Saving session state:', this.state)
    } catch (error) {
      throw new RuntimeError(
        'Failed to save session state',
        { sessionId: this.id, error }
      )
    }
  }

  public async load(): Promise<void> {
    if (!this.options.persistenceEnabled) {
      return
    }

    try {
      // In a real implementation, this would load from a database or file
      console.log('Loading session state...')
    } catch (error) {
      throw new RuntimeError(
        'Failed to load session state',
        { sessionId: this.id, error }
      )
    }
  }

  public dispose(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
    }
  }

  private initializeState(): SessionState {
    return {
      id: this.id,
      agentId: this.agent.id,
      status: this.agent.status,
      context: {},
      history: [],
      memory: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  private validateMessage(message: Message): void {
    if (!message.id || !message.type || !message.sender || !message.recipient) {
      throw new RuntimeError(
        'Invalid message format',
        { message }
      )
    }

    if (message.sender !== this.agent.id && message.recipient !== this.agent.id) {
      throw new RuntimeError(
        'Message not related to session agent',
        { 
          sessionAgentId: this.agent.id,
          messageSender: message.sender,
          messageRecipient: message.recipient
        }
      )
    }
  }

  private validateMemoryItem(item: MemoryItem): void {
    if (!item.id || !item.type || !item.timestamp) {
      throw new RuntimeError(
        'Invalid memory item format',
        { item }
      )
    }

    if (!Object.values(MemoryType).includes(item.type)) {
      throw new RuntimeError(
        'Invalid memory type',
        { type: item.type }
      )
    }
  }

  private setupAutoSave(): void {
    this.saveInterval = setInterval(
      () => this.save().catch(console.error),
      this.options.saveInterval
    )
  }

  private async saveState(): Promise<void> {
    if (this.options.persistenceEnabled && !this.options.autoSave) {
      await this.save()
    }
  }
}
