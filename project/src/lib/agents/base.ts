import type { Message } from '../../types';
import { GitHubClient } from '../github/GitHubClient';
import { tools } from '../tools';
import { memoryManager } from '../memory';

export abstract class BaseAgent {
  protected github: GitHubClient;
  protected capabilities: string[];
  protected subordinates: BaseAgent[] = [];

  constructor(
    public readonly id: string,
    public readonly agentName: string,
    public readonly role: string,
    capabilities: string[] = []
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
      console.warn('Error searching GitHub:', error);
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
      console.warn('Error reusing code:', error);
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
      console.warn('Error creating development environment:', error);
      return null;
    }
  }

  protected createResponse(content: string): Message {
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
  }

  getCapabilities(): string[] {
    return [...this.capabilities];
  }

  hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability);
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