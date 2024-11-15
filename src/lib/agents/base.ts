import { v4 as uuidv4 } from 'uuid'
import {
  Agent,
  AgentType,
  AgentStatus,
  Message,
  MessageType,
  Tool,
  ToolResult
} from '@/types'
import {
  AgentError,
  InitializationError,
  MessageError,
  ToolError,
  ValidationError
} from '../errors/AgentErrors'

export abstract class BaseAgent implements Agent {
  public readonly id: string
  public status: AgentStatus
  public abstract readonly type: AgentType
  public abstract readonly capabilities: string[]

  protected tools: Map<string, Tool>
  protected messageQueue: Message[]

  constructor() {
    this.id = uuidv4()
    this.status = AgentStatus.IDLE
    this.tools = new Map()
    this.messageQueue = []
  }

  public async initialize(): Promise<void> {
    try {
      await this.registerTools()
      this.status = AgentStatus.IDLE
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw new InitializationError(
        'Failed to initialize agent',
        { agentId: this.id, error }
      )
    }
  }

  public async handleMessage(message: Message): Promise<Message> {
    try {
      this.validateMessage(message)
      this.messageQueue.push(message)
      
      switch (message.type) {
        case MessageType.COMMAND:
          return await this.handleCommand(message)
        case MessageType.TASK:
          return await this.handleTask(message)
        case MessageType.STATUS:
          return this.handleStatus(message)
        default:
          throw new MessageError(
            'Unsupported message type',
            { messageType: message.type }
          )
      }
    } catch (error) {
      return this.createErrorResponse(message, error as Error)
    }
  }

  protected abstract registerTools(): Promise<void>

  protected async executeTool(toolId: string, params: unknown): Promise<ToolResult> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new ToolError(
        'Tool not found',
        { toolId }
      )
    }

    if (!tool.validate(params)) {
      throw new ValidationError(
        'Invalid tool parameters',
        { toolId, params }
      )
    }

    try {
      const result = await tool.execute(params)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: error as Error
      }
    }
  }

  protected createResponse(
    originalMessage: Message,
    content: unknown,
    type: MessageType = MessageType.RESPONSE
  ): Message {
    return {
      id: uuidv4(),
      type,
      sender: this.id,
      recipient: originalMessage.sender,
      content,
      timestamp: Date.now(),
      metadata: {
        originalMessageId: originalMessage.id
      }
    }
  }

  protected createErrorResponse(originalMessage: Message, error: Error): Message {
    return this.createResponse(
      originalMessage,
      {
        message: error.message,
        name: error.name,
        stack: error.stack
      },
      MessageType.ERROR
    )
  }

  private validateMessage(message: Message): void {
    if (!message.id || !message.type || !message.sender || !message.recipient) {
      throw new ValidationError(
        'Invalid message format',
        { message }
      )
    }

    if (message.recipient !== this.id) {
      throw new ValidationError(
        'Message recipient mismatch',
        { expected: this.id, received: message.recipient }
      )
    }
  }

  private async handleCommand(message: Message): Promise<Message> {
    this.status = AgentStatus.BUSY
    try {
      const result = await this.executeCommand(message.content)
      this.status = AgentStatus.IDLE
      return this.createResponse(message, result)
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw error
    }
  }

  private async handleTask(message: Message): Promise<Message> {
    this.status = AgentStatus.BUSY
    try {
      const result = await this.executeTask(message.content)
      this.status = AgentStatus.IDLE
      return this.createResponse(message, result)
    } catch (error) {
      this.status = AgentStatus.ERROR
      throw error
    }
  }

  private handleStatus(message: Message): Message {
    return this.createResponse(message, {
      status: this.status,
      messageQueueLength: this.messageQueue.length,
      capabilities: this.capabilities
    })
  }

  protected abstract executeCommand(command: unknown): Promise<unknown>
  protected abstract executeTask(task: unknown): Promise<unknown>
}
