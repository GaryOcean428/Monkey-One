import { 
  AgentInterface, 
  Message, 
  Tool, 
  TaskLedger, 
  ProgressLedger,
  AgentConfig,
  AgentState,
  ExecutionContext,
  AgentMetadata,
  MessageType,
  ErrorDetails
} from '../../types';
import { AgentExecutionError } from '../errors/AgentErrors';
import { randomUUID } from 'crypto';

export abstract class BaseAgent implements AgentInterface {
  protected name: string;
  protected tools: Tool[];
  protected taskLedger?: TaskLedger;
  protected progressLedger?: ProgressLedger;
  protected state: AgentState;
  protected metadata: Record<string, unknown>;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.tools = config.tools || [];
    this.taskLedger = config.taskLedger;
    this.progressLedger = config.progressLedger;
    this.metadata = config.metadata || {};
    this.state = {
      isInitialized: false,
      isProcessing: false,
      metadata: {}
    };
  }

  async initialize(): Promise<void> {
    if (this.state.isInitialized) {
      return;
    }

    try {
      await this.onInitialize();
      this.state.isInitialized = true;
    } catch (error) {
      const details: ErrorDetails = {
        originalError: error instanceof Error ? error.message : String(error)
      };
      throw new AgentExecutionError(
        `Failed to initialize agent ${this.name}`,
        details
      );
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.onCleanup();
      this.state.isInitialized = false;
    } catch (error) {
      const details: ErrorDetails = {
        originalError: error instanceof Error ? error.message : String(error)
      };
      throw new AgentExecutionError(
        `Failed to cleanup agent ${this.name}`,
        details
      );
    }
  }

  async handleMessage(message: Message): Promise<void> {
    if (!this.state.isInitialized) {
      throw new AgentExecutionError('Agent not initialized');
    }

    this.state.isProcessing = true;
    try {
      await this.validateMessage(message);
      const context = this.createExecutionContext(message);
      await this.processMessage(context);
    } finally {
      this.state.isProcessing = false;
    }
  }

  protected async validateMessage(message: Message): Promise<void> {
    if (!message.id || !message.type) {
      throw new AgentExecutionError('Invalid message format');
    }
  }

  protected createExecutionContext(message: Message): ExecutionContext {
    return {
      agent: this,
      message,
      tools: this.tools,
      state: this.state
    };
  }

  protected getMetadata(): AgentMetadata {
    return {
      id: randomUUID(),
      name: this.name,
      version: '1.0.0',
      capabilities: {
        tools: this.tools.map(t => t.name),
        messageTypes: this.getSupportedMessageTypes(),
        supportedTasks: this.getSupportedTasks()
      },
      status: this.state.isProcessing ? 'busy' : 'idle'
    };
  }

  protected createMessage(
    type: MessageType,
    content: unknown,
    metadata?: Record<string, unknown>
  ): Message {
    return {
      id: randomUUID(),
      type,
      content,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        agentId: this.getMetadata().id,
        agentName: this.name
      }
    };
  }

  // Abstract methods to be implemented by specific agents
  protected abstract onInitialize(): Promise<void>;
  protected abstract onCleanup(): Promise<void>;
  protected abstract processMessage(context: ExecutionContext): Promise<void>;
  protected abstract getSupportedMessageTypes(): MessageType[];
  protected abstract getSupportedTasks(): string[];
}
