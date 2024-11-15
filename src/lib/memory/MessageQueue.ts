import { Message } from '@/types'
import { ValidationError } from '../errors/AgentErrors'

export interface MessageQueueOptions {
  maxSize?: number
  retentionPeriod?: number // in milliseconds
}

export class MessageQueue {
  private queue: Message[]
  private readonly maxSize: number
  private readonly retentionPeriod: number

  constructor(options: MessageQueueOptions = {}) {
    this.queue = []
    this.maxSize = options.maxSize || 1000
    this.retentionPeriod = options.retentionPeriod || 24 * 60 * 60 * 1000 // 24 hours default
  }

  public enqueue(message: Message): void {
    this.validateMessage(message)
    this.cleanExpiredMessages()

    if (this.queue.length >= this.maxSize) {
      throw new ValidationError(
        'Message queue is full',
        { maxSize: this.maxSize }
      )
    }

    // Ensure timestamp is set
    const messageWithTimestamp: Message = {
      ...message,
      timestamp: message.timestamp || Date.now()
    }

    this.queue.push(messageWithTimestamp)
  }

  public dequeue(): Message | undefined {
    this.cleanExpiredMessages()
    return this.queue.shift()
  }

  public peek(): Message | undefined {
    this.cleanExpiredMessages()
    return this.queue[0]
  }

  public clear(): void {
    this.queue = []
  }

  public size(): number {
    this.cleanExpiredMessages()
    return this.queue.length
  }

  public isEmpty(): boolean {
    this.cleanExpiredMessages()
    return this.queue.length === 0
  }

  public getMessages(): Message[] {
    this.cleanExpiredMessages()
    return [...this.queue]
  }

  public findById(id: string): Message | undefined {
    return this.queue.find(message => message.id === id)
  }

  public findByType(type: string): Message[] {
    return this.queue.filter(message => message.type === type)
  }

  public findBySender(sender: string): Message[] {
    return this.queue.filter(message => message.sender === sender)
  }

  public findByRecipient(recipient: string): Message[] {
    return this.queue.filter(message => message.recipient === recipient)
  }

  public removeById(id: string): boolean {
    const initialLength = this.queue.length
    this.queue = this.queue.filter(message => message.id !== id)
    return this.queue.length !== initialLength
  }

  private validateMessage(message: Message): void {
    if (!message.id || !message.type || !message.sender || !message.recipient) {
      throw new ValidationError(
        'Invalid message format',
        { message }
      )
    }
  }

  private cleanExpiredMessages(): void {
    const now = Date.now()
    this.queue = this.queue.filter(message => 
      message.timestamp && now - message.timestamp <= this.retentionPeriod
    )
  }

  public getStats(): MessageQueueStats {
    const now = Date.now()
    const messages = this.getMessages()
    const messageTypes = new Map<string, number>()
    let oldestTimestamp = now
    let newestTimestamp = 0

    messages.forEach(message => {
      // Count message types
      messageTypes.set(
        message.type,
        (messageTypes.get(message.type) || 0) + 1
      )

      // Track timestamps
      if (message.timestamp) {
        oldestTimestamp = Math.min(oldestTimestamp, message.timestamp)
        newestTimestamp = Math.max(newestTimestamp, message.timestamp)
      }
    })

    return {
      totalMessages: messages.length,
      messageTypes: Object.fromEntries(messageTypes),
      oldestMessageAge: now - oldestTimestamp,
      newestMessageAge: now - newestTimestamp,
      queueCapacity: this.maxSize,
      queueUtilization: (messages.length / this.maxSize) * 100
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
          break;
        }
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

export interface MessageQueueStats {
  totalMessages: number
  messageTypes: Record<string, number>
  oldestMessageAge: number
  newestMessageAge: number
  queueCapacity: number
  queueUtilization: number
}
