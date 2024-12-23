import { Message, MessageType, AgentCapability, AgentType, AgentStatus, Agent } from '../../types';
import { GitHubClient } from '../github/GitHubClient';
import { logger } from '../logger';
import { RuntimeError } from '../errors';

export abstract class BaseAgent implements Agent {
  public readonly capabilities: AgentCapability[];
  public readonly subordinates: Agent[] = [];
  public type: AgentType;
  public status: AgentStatus;
  protected github: GitHubClient;

  constructor(
    public readonly id: string,
    public readonly name: string,
    type: AgentType,
    capabilities: AgentCapability[] = []
  ) {
    this.type = type;
    this.status = AgentStatus.IDLE;
    this.github = new GitHubClient();
    this.capabilities = capabilities;
  }

  abstract processMessage(message: Message): Promise<Message>;

  async handleMessage(message: Message): Promise<Message> {
    try {
      return await this.processMessage(message);
    } catch (error) {
      logger.error('Error handling message:', error);
      throw new RuntimeError('Failed to handle message', { cause: error });
    }
  }

  async initialize(): Promise<void> {
    logger.debug('Base agent initialized', { id: this.id, type: this.type });
  }

  getCapabilities(): AgentCapability[] {
    return [...this.capabilities];
  }

  registerCapability(capability: AgentCapability): void {
    if (!this.capabilities.some(cap => cap.name === capability.name)) {
      this.capabilities.push(capability);
      logger.debug('Capability registered', { 
        agentId: this.id, 
        capability: capability.name 
      });
    }
  }

  protected async searchGitHubForSolutions(query: string, language?: string) {
    try {
      if (!this.github.isGitHubConfigured()) {
        logger.warn('GitHub integration not configured. Skipping code search.');
        return [];
      }
      const results = await this.github.searchCode(query, { language });
      return results.items;
    } catch (error) {
      logger.error('Error searching GitHub:', error);
      return [];
    }
  }

  protected async reuseExistingCode(owner: string, repo: string, path: string) {
    try {
      if (!this.github.isGitHubConfigured()) {
        logger.warn('GitHub integration not configured. Skipping code reuse.');
        return null;
      }
      const content = await this.github.getContents(owner, repo, path);
      return content;
    } catch (error) {
      logger.error('Error reusing code:', error);
      return null;
    }
  }

  protected createResponse(content: string, additionalData?: Record<string, unknown>): Message {
    const message: Message = {
      id: crypto.randomUUID(),
      type: MessageType.RESPONSE,
      content,
      timestamp: Date.now(),
      status: 'sent',
      role: 'assistant',
      sender: this.id,
      ...(additionalData || {})
    };

    return message;
  }

  getCapabilities(): string[] {
    return [...this.capabilities.map(cap => cap.name)];
  }

  hasCapability(capability: string): boolean {
    return this.capabilities.some(cap => cap.name === capability);
  }

  addSubordinate(agent: Agent): void {
    this.subordinates.push(agent);
  }

  removeSubordinate(agentId: string): void {
    this.subordinates = this.subordinates.filter(agent => agent.id !== agentId);
  }

  getSubordinates(): Agent[] {
    return [...this.subordinates];
  }
}
