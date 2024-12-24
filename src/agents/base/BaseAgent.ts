import { EventEmitter } from 'events';
import { Tool } from '../../tools/registry/Tool';
import { Message } from '../../types/Message';
import { Response } from '../../types/Response';
import { Queue } from '../../utils/Queue';
import { agentQueries } from '../../lib/supabase/agents';

export interface AgentConfig {
  name: string;
  capabilities: string[];
  maxRetries?: number;
  timeout?: number;
}

export abstract class BaseAgent extends EventEmitter {
  protected name: string;
  protected capabilities: string[];
  protected messageQueue: Queue<Message>;
  protected maxRetries: number;
  protected timeout: number;

  protected id: string;

  constructor(config: AgentConfig) {
    super();
    this.name = config.name;
    this.capabilities = config.capabilities;
    this.messageQueue = new Queue<Message>();
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
    
    // Create agent record in database
    this.initializeAgent();
  }

  private async initializeAgent() {
    const agent = await agentQueries.createAgent({
      name: this.name,
      type: this.constructor.name,
      status: 'idle',
      capabilities: this.capabilities
    });
    this.id = agent.id;
  }

  protected async storeThought(type: string, message: string, metadata?: any) {
    await agentQueries.storeAgentThought({
      agent_id: this.id,
      type,
      message,
      metadata,
      importance: 1.0,
      confidence: 1.0
    });
  }

  protected async storeMemory(key: string, value: any, metadata?: any) {
    await agentQueries.storeAgentMemory({
      agent_id: this.id,
      key,
      value,
      metadata
    });
  }

  protected async updateStatus(status: string) {
    await agentQueries.updateAgentStatus(this.id, status);
  }

  public getName(): string {
    return this.name;
  }

  public getCapabilities(): string[] {
    return [...this.capabilities];
  }

  public async enqueueMessage(message: Message): Promise<void> {
    await this.messageQueue.enqueue(message);
    this.emit('messageReceived', message);
  }

  public abstract processMessage(message: Message): Promise<Response>;

  public abstract handleToolUse(tool: Tool): Promise<Response>;

  protected async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.timeout
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }

  protected validateMessage(message: Message): boolean {
    return (
      message &&
      typeof message.content === 'string' &&
      message.content.length > 0
    );
  }

  protected logError(error: Error, context?: any): void {
    this.emit('error', {
      agent: this.name,
      error: error.message,
      stack: error.stack,
      context
    });
  }
}
