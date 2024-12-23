export class MessageQueue<T> {
  private queue: T[] = [];
  private maxSize: number;
  private listeners: ((message: T) => void)[] = [];
  private isProcessing = false;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  enqueue(message: T): void {
    if (this.queue.length >= this.maxSize) {
      throw new Error(`Queue size limit (${this.maxSize}) reached`);
    }
    this.queue.push(message);
    this.notifyListeners(message);
  }

  dequeue(): T | undefined {
    const message = this.queue.shift();
    if (message) {
      this.notifyListeners(message);
    }
    return message;
  }

  peek(): T | undefined {
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

  on(listener: (message: T) => void): void {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    this.listeners.push(listener);
  }

  private notifyListeners(message: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  toArray(): T[] {
    return [...this.queue];
  }

  setProcessing(value: boolean): void {
    this.isProcessing = value;
  }

  isProcessing(): boolean {
    return this.isProcessing;
  }
}