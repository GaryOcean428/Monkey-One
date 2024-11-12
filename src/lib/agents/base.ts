import type { Message, TaskLedger, ProgressLedger } from '../../types';
import { XAIClient } from '../xai';
import { configStore } from '../config/store';

export abstract class BaseAgent {
  protected xai: XAIClient;
  protected taskLedger: TaskLedger;
  protected progressLedger: ProgressLedger;
  public readonly subordinates: string[] = [];

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: string,
    public readonly capabilities: string[]
  ) {
    this.xai = new XAIClient(configStore.xai.apiKey);
    this.taskLedger = {
      facts: [],
      assumptions: [],
      currentPlan: []
    };
    this.progressLedger = {
      completedSteps: [],
      currentStep: null,
      remainingSteps: [],
      status: 'idle'
    };
  }

  abstract processMessage(message: Message): Promise<Message>;
  
  protected async updateTaskLedger(update: Partial<TaskLedger>) {
    this.taskLedger = {
      ...this.taskLedger,
      ...update
    };
  }

  protected async updateProgressLedger(update: Partial<ProgressLedger>) {
    this.progressLedger = {
      ...this.progressLedger,
      ...update
    };
  }

  protected createResponse(content: string): Message {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      metadata: {
        agentId: this.id,
        agentName: this.name,
        taskProgress: this.progressLedger
      }
    };
  }

  addSubordinate(agentId: string) {
    if (!this.subordinates.includes(agentId)) {
      this.subordinates.push(agentId);
    }
  }

  removeSubordinate(agentId: string) {
    const index = this.subordinates.indexOf(agentId);
    if (index !== -1) {
      this.subordinates.splice(index, 1);
    }
  }
}
