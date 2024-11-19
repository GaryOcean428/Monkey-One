import { Message } from '@/types';

export class MessageQueue {
  private queue: Message[] = [];
  private processing: boolean = false;
  private maxSize: number = 1000;
  private listeners: Set<(message: Message) => void> = new Set();

  add(message: Message) {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift(); // Remove oldest message
    }
    this.queue.push(message);
    this.notifyListeners(message);
  }

  hasMessages(): boolean {
    return this.queue.length > 0;
  }

  async next(): Promise<Message | null> {
    return this.queue.shift() || null;
  }

  async clear(): Promise<void> {
    this.queue = [];
    this.processing = false;
  }

  isProcessing(): boolean {
    return this.processing;
  }

  setProcessing(value: boolean): void {
    this.processing = value;
  }

  onMessage(callback: (message: Message) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(message: Message): void {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  peek(): Message | null {
    return this.queue[0] || null;
  }

  toArray(): Message[] {
    return [...this.queue];
  }
}