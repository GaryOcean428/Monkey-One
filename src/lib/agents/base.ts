import { Message, MessageType } from '../../types';
import { GitHubClient } from '../github/GitHubClient';

export abstract class BaseAgent {
  protected github: GitHubClient;
  public readonly capabilities: AgentCapability[];
  public readonly subordinates: BaseAgent[] = [];

  constructor(
    public readonly id: string,
    public readonly agentName: string,
    public readonly role: string,
    capabilities: AgentCapability[] = []
  ) {
    this.github = new GitHubClient();
    this.capabilities = capabilities;
  }

  abstract processMessage(message: Message): Promise<Message>;

  protected async searchGitHubForSolutions(query: string, language?: string) {
    try {
      if (!this.github.isGitHubConfigured()) {
        console.warn('GitHub integration not configured. Skipping code search.');
        return [];
      }
      const results = await this.github.searchCode(query, { language });
      return results.items;
    } catch (error) {
      console.error('Error searching GitHub:', error);
      return [];
    }
  }

  protected async reuseExistingCode(owner: string, repo: string, path: string) {
    try {
      if (!this.github.isGitHubConfigured()) {
        console.warn('GitHub integration not configured. Skipping code reuse.');
        return null;
      }
      const content = await this.github.getContents(owner, repo, path);
      return content;
    } catch (error) {
      console.error('Error reusing code:', error);
      return null;
    }
  }

  protected async createDevelopmentEnvironment(repoId: string) {
    try {
      if (!this.github.isGitHubConfigured()) {
        console.warn('GitHub integration not configured. Skipping environment creation.');
        return null;
      }
      return await this.github.createRepository(repoId);
    } catch (error) {
      console.error('Error creating development environment:', error);
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
    return [...this.capabilities];
  }

  hasCapability(capability: string): boolean {
    return this.capabilities.some(cap => cap.name === capability);
  }

  addSubordinate(agent: BaseAgent): void {
    this.subordinates.push(agent);
  }

  removeSubordinate(agentId: string): void {
    this.subordinates = this.subordinates.filter(agent => agent.id !== agentId);
  }

  getSubordinates(): BaseAgent[] {
    return [...this.subordinates];
  }
}
