import { BaseAgent } from '../agents/base/BaseAgent';
import { Message } from '../../types/core';
import { MessageQueue } from '../memory/MessageQueue';

export class AgentRuntime {
  private agent: BaseAgent;
  private messageQueue: MessageQueue;
  private isProcessing: boolean = false;
  private processingTimeout: number | null = null;
  private abortController: AbortController | null = null;

  constructor(agent: BaseAgent) {
    this.agent = agent;
    this.messageQueue = new MessageQueue();
    this.startProcessing();
  }

  public startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    while (this.isProcessing && !this.messageQueue.isEmpty()) {
      try {
        const message = this.messageQueue.dequeue();
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
  }

  public enqueueMessage(message: Message): void {
    this.messageQueue.enqueue(message);
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  async shutdown(): Promise<void> {
    this.isProcessing = false;
    if (this.processingTimeout !== null) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    await this.messageQueue.clear();
  }

  getAgent(): BaseAgent {
    return this.agent;
  }

  isActive(): boolean {
    return this.isProcessing;
  }
}