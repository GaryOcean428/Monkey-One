export class MessageQueue<T> {
  private queue: T[] = [];
  private maxSize: number;
  private listeners: ((message: T) => void)[] = [];

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
    return this.queue.shift();
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
    this.listeners.push(listener);
  }

  private notifyListeners(message: T): void {
    this.listeners.forEach(listener => listener(message));
  }

  toArray(): T[] {
    return [...this.queue];
  }
}