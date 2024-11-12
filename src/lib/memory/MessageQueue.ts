import type { Message } from '../../types';

export class MessageQueue {
  private queue: Message[] = [];

  add(message: Message) {
    this.queue.push(message);
    this.processQueue();
  }

  private async processQueue() {
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      if (message) {
        // ...process message...
      }
    }
  }
}