import { Agent, AgentStatus, Message } from '../../types/core';
import { RuntimeError } from '../errors/AgentErrors';

export interface StateContext {
  [key: string]: any;
}

export interface StateTransition {
  from: AgentStatus;
  to: AgentStatus;
  action?: () => Promise<void>;
  condition?: () => boolean;
}

export interface StateConfig {
  allowedTransitions: StateTransition[];
  onEnter?: () => void;
  onExit?: () => void;
  onMessage?: (agent: Agent, message: Message) => Promise<void>;
  timeout?: number;
  maxRetries?: number;
}

interface TransitionHistoryEntry {
  from: AgentStatus;
  to: AgentStatus;
  timestamp: Date;
}

export class AgentState {
  private agent: Agent;
  private states: Map<AgentStatus, StateConfig> = new Map();
  private transitionHistory: TransitionHistoryEntry[] = [];
  private timeoutHandle?: NodeJS.Timeout;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  registerState(status: AgentStatus, config: StateConfig): void {
    if (this.states.has(status)) {
      throw new RuntimeError('State already registered');
    }
    this.validateStateConfig(config);
    this.states.set(status, config);
  }

  async transition(to: AgentStatus, context: StateConfig = {}): Promise<void> {
    const fromStatus = this.agent.status;
    const currentState = this.states.get(fromStatus);
    const targetState = this.states.get(to);

    if (!this.isTransitionAllowed(fromStatus, to)) {
      throw new RuntimeError('Invalid state transition');
    }

    await this.executeTransition(fromStatus, to, context);
  }

  getCurrentState(): StateConfig | undefined {
    return this.states.get(this.agent.status);
  }

  getTransitionHistory(): TransitionHistoryEntry[] {
    return [...this.transitionHistory];
  }

  getAllowedTransitions(): AgentStatus[] {
    const currentState = this.states.get(this.agent.status);
    if (!currentState) return [];
    return currentState.allowedTransitions.map(t => t.to);
  }

  async handleMessage(message: Message): Promise<void> {
    const currentState = this.states.get(this.agent.status);
    if (currentState?.onMessage) {
      await currentState.onMessage(this.agent, message);
    }
  }

  dispose(): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }
    this.states.clear();
    this.transitionHistory = [];
  }

  private validateStateConfig(config: StateConfig): void {
    if (!Array.isArray(config.allowedTransitions)) {
      throw new RuntimeError('Invalid state configuration');
    }
  }

  private async executeTransition(from: AgentStatus, to: AgentStatus, context: StateConfig): Promise<void> {
    const currentState = this.states.get(from);
    const targetState = this.states.get(to);
    
    if (!currentState || !targetState) {
      throw new RuntimeError('Invalid state configuration');
    }

    try {
      if (currentState.onExit) {
        currentState.onExit();
      }

      const transition = currentState.allowedTransitions.find(t => t.from === from && t.to === to);
      if (!transition) {
        throw new RuntimeError(`No transition defined from ${from} to ${to}`);
      }

      if (transition.condition && !transition.condition()) {
        throw new RuntimeError('Transition condition not met');
      }

      if (transition.action) {
        await this.executeWithRetry(transition.action, context.maxRetries || 0);
      }

      this.agent.status = to;

      if (targetState.onEnter) {
        targetState.onEnter();
      }

      this.transitionHistory.push({
        from,
        to,
        timestamp: new Date()
      });

      this.setupStateTimeout(to, targetState.timeout);

    } catch (error) {
      this.agent.status = AgentStatus.OFFLINE;
      throw error instanceof Error ? error : new RuntimeError(String(error));
    }
  }

  private isTransitionAllowed(from: AgentStatus, to: AgentStatus): boolean {
    const currentState = this.states.get(from);
    return currentState?.allowedTransitions.some(t => t.from === from && t.to === to) || false;
  }

  private async executeWithRetry(action: () => Promise<void>, maxRetries: number): Promise<void> {
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts <= maxRetries) {
      try {
        await action();
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempts++;
      }
    }

    throw lastError || new RuntimeError('Action failed after retries');
  }

  private setupStateTimeout(state: AgentStatus, timeout?: number): void {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = undefined;
    }

    if (timeout) {
      this.timeoutHandle = setTimeout(async () => {
        try {
          await this.transition(AgentStatus.OFFLINE);
        } catch (error) {
          console.error('Timeout transition failed:', error);
        }
      }, timeout);
    }
  }
}