import { Message, MessageQueueInterface } from '../../types';
import { MemoryError } from '../errors/AgentErrors';

interface QueueOptions {
  maxSize?: number;
  messageTimeout?: number;
  persistenceEnabled?: boolean;
  priorityLevels?: number;
}

interface QueueMetrics {
  size: number;
  processedCount: number;
  errorCount: number;
  avgProcessingTime: number;
}

interface QueuedMessage {
  message: Message;
  priority: number;
  timestamp: number;
  expiresAt?: number;
}

const DEFAULT_OPTIONS: Required<QueueOptions> = {
  maxSize: 1000,
  messageTimeout: 30000, // 30 seconds
  persistenceEnabled: false,
  priorityLevels: 3
};

export class MessageQueue implements MessageQueueInterface {
  private queue: QueuedMessage[][] = [];
  private options: Required<QueueOptions>;
  private metrics: QueueMetrics = {
    size: 0,
    processedCount: 0,
    errorCount: 0,
    avgProcessingTime: 0
  };
  private processing: boolean = false;

  constructor(options: QueueOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.initializePriorityQueues();
  }

  private initializePriorityQueues(): void {
    for (let i = 0; i < this.options.priorityLevels; i++) {
      this.queue[i] = [];
    }
  }

  async add(message: Message, priority: number = 1): Promise<void> {
    this.validatePriority(priority);
    this.checkQueueSize();

    const queuedMessage: QueuedMessage = {
      message,
      priority,
      timestamp: Date.now(),
      expiresAt: this.options.messageTimeout > 0 
        ? Date.now() + this.options.messageTimeout 
        : undefined
    };

    try {
      this.queue[priority].push(queuedMessage);
      this.metrics.size++;
      
      if (this.options.persistenceEnabled) {
        await this.persistQueue();
      }
    } catch (error) {
      throw new MemoryError(
        'Failed to add message to queue',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async getBatch(size: number): Promise<Message[]> {
    const batch: Message[] = [];
    const startTime = Date.now();

    try {
      // Process from highest priority to lowest
      for (let priority = this.options.priorityLevels - 1; priority >= 0; priority--) {
        while (batch.length < size && this.queue[priority].length > 0) {
          const queuedMessage = this.queue[priority][0];
          
          if (this.isMessageExpired(queuedMessage)) {
            this.queue[priority].shift(); // Remove expired message
            this.metrics.size--;
            continue;
          }

          batch.push(queuedMessage.message);
          this.queue[priority].shift();
          this.metrics.size--;
          this.metrics.processedCount++;
        }

        if (batch.length === size) {
      }

      // Update processing time metrics
      const processingTime = Date.now() - startTime;
      this.updateProcessingTimeMetrics(processingTime);

      return batch;
    } catch (error) {
      this.metrics.errorCount++;
      throw new MemoryError(
        'Failed to get batch from queue',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  size(): number {
    return this.metrics.size;
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  clear(): void {
    this.initializePriorityQueues();
    this.metrics.size = 0;
  }

  private validatePriority(priority: number): void {
    if (priority < 0 || priority >= this.options.priorityLevels) {
      throw new MemoryError(
        `Invalid priority level. Must be between 0 and ${this.options.priorityLevels - 1}`,
        { priority }
      );
    }
  }

  private checkQueueSize(): void {
    if (this.metrics.size >= this.options.maxSize) {
      throw new MemoryError(
        'Queue size limit exceeded',
        { maxSize: this.options.maxSize, currentSize: this.metrics.size }
      );
    }
  }

  private isMessageExpired(queuedMessage: QueuedMessage): boolean {
    return !!queuedMessage.expiresAt && Date.now() > queuedMessage.expiresAt;
  }

  private updateProcessingTimeMetrics(processingTime: number): void {
    const oldAvg = this.metrics.avgProcessingTime;
    const oldCount = this.metrics.processedCount;
    this.metrics.avgProcessingTime = 
      (oldAvg * oldCount + processingTime) / (oldCount + 1);
  }

  private async persistQueue(): Promise<void> {
    // Implement queue persistence logic here
    // This could write to disk, database, etc.
    // For now, it's a placeholder for future implementation
  }

  async cleanup(): Promise<void> {
    // Remove expired messages and perform any necessary cleanup
    for (let priority = 0; priority < this.options.priorityLevels; priority++) {
      this.queue[priority] = this.queue[priority].filter(
        queuedMessage => !this.isMessageExpired(queuedMessage)
      );
    }
    
    if (this.options.persistenceEnabled) {
      await this.persistQueue();
    }
  }
}
