import type { Message } from '../types/core';
import { MessageHandler } from '../../decorators/MessageHandlers';

export class MessageBroker {
  private subscribers: Map<string, MessageHandler[]> = new Map();

  async publish(topic: string, message: Message): Promise<void> {
    const handlers = this.subscribers.get(topic) || [];
    await Promise.all(handlers.map(handler => {
      try {
        return handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
        return Promise.resolve();
      }
    }));
  }
  
  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)?.push(handler);
  }

  async sendMessage(message: Message): Promise<void> {
    // Sparse communication logic
    await this.publish('messages', message);
  }
}