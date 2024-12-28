import type { Message } from '../../types';

export class MessageQueue {
  private queue: Message[] = [];
  private listeners: ((message: Message) => void)[] = [];
  private processing: boolean = false;

  enqueue(message: Message): void {
    this.queue.push(message);
    this.notifyListeners(message);
  }

  async dequeue(): Promise<Message | undefined> {
    return this.queue.shift();
  }

  peek(): Message | undefined {
    return this.queue[0];
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  on(listener: (message: Message) => void): void {
    this.listeners.push(listener);
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

  toArray(): Message[] {
    return [...this.queue];
  }

  isProcessing(): boolean {
    return this.processing;
  }
}