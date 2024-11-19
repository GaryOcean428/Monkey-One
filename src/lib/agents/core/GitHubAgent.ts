import { BaseAgent } from '../base';
import { GitHubClient } from '../../github/GitHubClient';
import type { Message } from '@/types';

export class GitHubAgent extends BaseAgent {
  private client: GitHubClient;

  constructor(id: string, name: string) {
    super(id, name, 'github', [
      'code_search',
      'repository_management',
      'codespace_management',
      'code_reuse',
      'collaboration'
    ]);
    this.client = new GitHubClient();
  }

  async searchForExistingSolutions(query: string, language?: string): Promise<any[]> {
    try {
      const results = await this.client.searchCode(query, { language });
      return results.items;
    } catch (error) {
      console.error('Error searching for solutions:', error);
      return [];
    }
  }

  async forkAndAdaptRepository(owner: string, repo: string, adaptations: Array<{
    path: string;
    content: string;
    message: string;
  }>) {
    try {
      // Fork the repository
      const fork = await this.client.createFork(owner, repo);
      
      // Apply adaptations
      for (const adaptation of adaptations) {
        // Get current file content if it exists
        const currentFile = await this.client.getContents(
          fork.owner.login,
          fork.name,
          adaptation.path
        ).catch(() => null);

        // Update file
        await this.client.createOrUpdateFile(
          fork.owner.login,
          fork.name,
          adaptation.path,
          adaptation.content,
          adaptation.message,
          currentFile?.sha
        );
      }

      // Create pull request
      await this.client.createPullRequest(
        owner,
        repo,
        'Adaptations by Monkey One Agent',
        `${fork.owner.login}:main`,
        'main',
        'These adaptations were made by the Monkey One Agent to better suit our needs.'
      );

      return fork;
    } catch (error) {
      console.error('Error adapting repository:', error);
      throw error;
    }
  }

  async createDevelopmentEnvironment(repoId: string) {
    try {
      // Create and start a codespace
      const codespace = await this.client.createCodespace(repoId);
      if (codespace) {
        await this.client.startCodespace(codespace.name);
      }
      return codespace;
    } catch (error) {
      console.error('Error creating development environment:', error);
      throw error;
    }
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Extract intent and parameters from message
      const intent = await this.analyzeIntent(message.content);
      
      let response: string;

      switch (intent.action) {
        case 'search_solutions':
          const solutions = await this.searchForExistingSolutions(
            intent.query,
            intent.language
          );
          response = this.formatSolutionsResponse(solutions);
          break;

        case 'adapt_repository':
          const adaptation = await this.forkAndAdaptRepository(
            intent.owner,
            intent.repo,
            intent.adaptations
          );
          response = `Successfully adapted repository. Fork created at ${adaptation.html_url}`;
          break;

        case 'create_environment':
          const environment = await this.createDevelopmentEnvironment(
            intent.repoId
          );
          response = `Development environment created. Codespace URL: ${environment.web_url}`;
          break;

        default:
          response = 'I did not understand the requested GitHub operation.';
      }

      return this.createResponse(response);
    } catch (error) {
      console.error('Error in GitHubAgent:', error);
      return this.createResponse(
        'I encountered an error while processing your GitHub request. Please try again.'
      );
    }
  }

  private async analyzeIntent(content: string): Promise<{
    action: string;
    [key: string]: any;
  }> {
    // Implement intent analysis logic
    // This would use NLP or pattern matching to determine the user's intent
    return {
      action: 'search_solutions',
      query: content,
      language: 'javascript'
    };
  }

  private formatSolutionsResponse(solutions: any[]): string {
    if (solutions.length === 0) {
      return 'No existing solutions found.';
    }

    return `Found ${solutions.length} potential solutions:\n\n` +
      solutions.map((solution, index) => 
        `${index + 1}. ${solution.repository.full_name}\n` +
        `   File: ${solution.path}\n` +
        `   URL: ${solution.html_url}\n`
      ).join('\n');
  }
}