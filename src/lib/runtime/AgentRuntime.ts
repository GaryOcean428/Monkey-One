import { BaseAgent } from '../agents/base';
import { Message, RuntimeConfig, RuntimeMetrics } from '../../types';
import { MessageQueue } from '../memory/MessageQueue';
import { AgentMonitor } from '../monitoring/AgentMonitor';
import { 
  AgentError, 
  AgentExecutionError, 
  TimeoutError,
  MemoryError 
} from '../errors/AgentErrors';

const DEFAULT_CONFIG: Required<RuntimeConfig> = {
  batchSize: 10,
  processingTimeout: 30000,
  maxRetries: 3,
  monitoringEnabled: true,
  priorityLevels: 3,
  maxQueueSize: 1000,
  messageTimeout: 300000, // 5 minutes
  persistenceEnabled: false
};

export class AgentRuntime {
  private agent: BaseAgent;
  private queue: MessageQueue;
  private monitor: AgentMonitor | null;
  private isProcessing: boolean;
  private config: Required<RuntimeConfig>;
  private processingPromise: Promise<void> | null;
  private shutdownRequested: boolean;

  constructor(agent: BaseAgent, config: Partial<RuntimeConfig> = {}) {
    this.agent = agent;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.queue = new MessageQueue({
      maxSize: this.config.maxQueueSize,
      messageTimeout: this.config.messageTimeout,
      priorityLevels: this.config.priorityLevels,
      persistenceEnabled: this.config.persistenceEnabled
    });
    this.monitor = this.config.monitoringEnabled ? new AgentMonitor() : null;
    this.isProcessing = false;
    this.processingPromise = null;
    this.shutdownRequested = false;

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.monitor?.startOperation('initialize');
      await this.agent.initialize();
      this.startProcessing();
      this.monitor?.endOperation('initialize');
    } catch (error) {
      this.handleError(error);
    }
  }

  private startProcessing(): void {
    if (!this.isProcessing && !this.shutdownRequested) {
      this.isProcessing = true;
      this.processingPromise = this.processMessages().catch(this.handleError);
    }
  }

  private async processMessages(): Promise<void> {
    while (this.isProcessing && !this.shutdownRequested) {
      try {
        await this.processBatch();
        await this.queue.cleanup(); // Clean up expired messages
      } catch (error) {
        this.handleError(error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Backoff on error
      }
    }
  }

  private async processBatch(): Promise<void> {
    const batch = await this.queue.getBatch(this.config.batchSize);
    
    if (batch.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }

    const startTime = Date.now();
    this.monitor?.startOperation('processBatch');

    try {
      await Promise.race([
        this.processMessageBatch(batch),
        this.createTimeout()
      ]);

      this.monitor?.endOperation('processBatch', {
        batchSize: batch.length,
        processingTime: Date.now() - startTime
      });
    } catch (error) {
      if (error instanceof TimeoutError) {
        await this.handleBatchTimeout(batch);
      } else {
        await this.requeueFailedMessages(batch);
      }
      throw error;
    }
  }

  private async processMessageBatch(messages: Message[]): Promise<void> {
    const processingPromises = messages.map(message => 
      this.processMessageWithRetry(message)
    );

    await Promise.allSettled(processingPromises);
  }

  private async processMessageWithRetry(message: Message): Promise<void> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        await this.agent.handleMessage(message);
        return;
      } catch (error) {
        retries++;
        if (retries === this.config.maxRetries) {
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retries) * 1000)
        );
      }
    }
  }

  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError('Message processing timeout exceeded'));
      }, this.config.processingTimeout);
    });
  }

  private async handleBatchTimeout(messages: Message[]): Promise<void> {
    this.monitor?.logError(new TimeoutError('Batch processing timeout'));
    await this.requeueFailedMessages(messages);
  }

  private async requeueFailedMessages(messages: Message[]): Promise<void> {
    const backoffDelay = 1000;
    
    for (const message of messages) {
      try {
        message.retryCount = (message.retryCount || 0) + 1;
        if (message.retryCount < this.config.maxRetries) {
          const delay = backoffDelay * Math.pow(2, message.retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          await this.enqueueMessage(message, 0); // Requeue with lowest priority
        }
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  private handleError(error: unknown): void {
    let agentError: AgentError;

    if (error instanceof AgentError) {
      agentError = error;
    } else if (error instanceof Error) {
      agentError = new AgentExecutionError(error.message, {
        originalError: error.stack || error.message
      });
    } else {
      agentError = new AgentExecutionError('Unknown error', {
        originalError: String(error)
      });
    }

    this.monitor?.logError(agentError);
    console.error('Runtime error:', agentError);
  }

  public async enqueueMessage(message: Message, priority?: number): Promise<void> {
    try {
      await this.queue.add(message, priority);
      this.startProcessing();
    } catch (error) {
      if (error instanceof MemoryError) {
        this.monitor?.logError(error);
        throw error;
      }
      this.handleError(error);
    }
  }

  public async shutdown(): Promise<void> {
    this.shutdownRequested = true;
    this.isProcessing = false;

    try {
      if (this.processingPromise) {
        await this.processingPromise;
      }
      await this.agent.cleanup();
      await this.queue.cleanup();
      this.monitor?.shutdown();
    } catch (error) {
      this.handleError(error);
    }
  }

  public getMetrics(): RuntimeMetrics {
    const queueMetrics = this.queue.getMetrics();
    const monitorMetrics = this.monitor?.getMetrics() || {};

    return {
      queueSize: queueMetrics.size,
      isProcessing: this.isProcessing,
      operationMetrics: monitorMetrics,
      errorCount: queueMetrics.errorCount,
      avgProcessingTime: queueMetrics.avgProcessingTime
    };
  }
}
