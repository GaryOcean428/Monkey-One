import { EventEmitter } from 'events';
import { BaseAgent } from '../base/BaseAgent';
import { Message } from '../../types/Message';
import { Response } from '../../types/Response';

export interface ConversationConfig {
  maxTurns?: number;
  timeout?: number;
}

export class ConversationManager extends EventEmitter {
  private agents: Map<string, BaseAgent>;
  private history: Message[];
  private maxTurns: number;
  private timeout: number;

  constructor(config: ConversationConfig = {}) {
    super();
    this.agents = new Map();
    this.history = [];
    this.maxTurns = config.maxTurns || 10;
    this.timeout = config.timeout || 60000;
  }

  public registerAgent(agent: BaseAgent): void {
    if (this.agents.has(agent.getName())) {
      throw new Error(`Agent ${agent.getName()} is already registered`);
    }

    this.agents.set(agent.getName(), agent);
    this.emit('agentRegistered', agent.getName());
  }

  public unregisterAgent(agentName: string): void {
    if (this.agents.delete(agentName)) {
      this.emit('agentUnregistered', agentName);
    }
  }

  public async routeMessage(message: Message): Promise<Response> {
    this.validateMessage(message);
    this.history.push(message);

    const agent = this.selectAgent(message);
    if (!agent) {
      throw new Error('No suitable agent found for message');
    }

    try {
      const response = await this.withTimeout(
        agent.processMessage(message),
        this.timeout
      );
      this.history.push(response as unknown as Message);
      return response;
    } catch (error) {
      this.emit('error', {
        type: 'routingError',
        message: error.message,
        agentName: agent.getName()
      });
      throw error;
    }
  }

  public getHistory(): Message[] {
    return [...this.history];
  }

  public getAgent(agentName: string): BaseAgent | undefined {
    return this.agents.get(agentName);
  }

  public getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  private selectAgent(message: Message): BaseAgent | undefined {
    // TODO: Implement more sophisticated agent selection logic
    // For now, return the first agent that can handle the message
    return this.getAllAgents().find(agent =>
      this.canAgentHandleMessage(agent, message)
    );
  }

  private canAgentHandleMessage(agent: BaseAgent, message: Message): boolean {
    // TODO: Implement proper capability matching
    return agent.getCapabilities().some(cap =>
      message.content.toLowerCase().includes(cap.toLowerCase())
    );
  }

  private validateMessage(message: Message): void {
    if (!message || !message.content) {
      throw new Error('Invalid message format');
    }

    if (this.history.length >= this.maxTurns * 2) {
      throw new Error('Maximum conversation turns reached');
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeout]);
  }
}
