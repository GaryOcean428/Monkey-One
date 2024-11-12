import { BaseAgent } from '../agents/base';
import { Message } from '../../types';
import { MessageQueue } from './memory/MessageQueue';

export class AgentRuntime {
  private agent: BaseAgent;
  private queue: MessageQueue;

  constructor(agent: BaseAgent) {
    this.agent = agent;
    this.queue = new MessageQueue();
    this.startProcessing();
  }

  private startProcessing() {
    // ...existing code...
  }

  enqueueMessage(message: Message) {
    this.queue.add(message);
  }

  // ...additional runtime methods...
}