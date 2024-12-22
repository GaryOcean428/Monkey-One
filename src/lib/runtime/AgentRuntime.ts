import { BaseAgent } from '../agents/base';
import { Message } from '../../types';
import { MessageQueue } from '../memory/MessageQueue';

export class AgentRuntime {
  private agent: BaseAgent;
  private queue: MessageQueue;
  private isProcessing: boolean = false;
  private processingTimeout: number | null = null;
  private abortController: AbortController | null = null;

  constructor(agent: BaseAgent) {
    this.agent = agent;
    this.queue = new MessageQueue();
    this.startProcessing();
  }

  private startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processQueue();
  }

  private async processQueue() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    while (this.isProcessing && this.queue.hasMessages()) {
      try {
        const message = await this.queue.next();
        if (message) {
          await this.agent.processMessage(message);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Processing aborted');
          break;
        }
        console.error('Error processing message:', error);
      }
    }
    
    if (this.isProcessing) {
      // Use requestAnimationFrame for browser environments
      if (typeof window !== 'undefined') {
        requestAnimationFrame(() => this.processQueue());
      } else {
        // Use setImmediate or setTimeout for Node.js
        setImmediate(() => this.processQueue());
      }
    }
  }

  enqueueMessage(message: Message) {
    this.queue.add(message);
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  async shutdown() {
    this.isProcessing = false;
    if (this.processingTimeout !== null) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    await this.queue.clear();
  }

  getAgent(): BaseAgent {
    return this.agent;
  }

  isActive(): boolean {
    return this.isProcessing;
  }
}