import { Octokit } from '@octokit/rest';
import { BaseAgent } from '../base/BaseAgent';
import { Message } from '../../types/Message';
import { Response } from '../../types/Response';
import { Tool } from '../../tools/registry/Tool';

interface GitHubAgentConfig {
  name: string;
  token: string;
  owner: string;
  repo: string;
}

export class GitHubAgent extends BaseAgent {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubAgentConfig) {
    super({
      name: config.name,
      capabilities: [
        'code_review',
        'issue_management',
        'pr_management',
        'repository_operations'
      ]
    });

    this.octokit = new Octokit({ auth: config.token });
    this.owner = config.owner;
    this.repo = config.repo;
  }

  public async processMessage(message: Message): Promise<Response> {
    try {
      const intent = await this.classifyIntent(message.content);
      switch (intent) {
        case 'review_code':
          return await this.handleCodeReview(message);
        case 'create_issue':
          return await this.handleIssueCreation(message);
        case 'create_pr':
          return await this.handlePRCreation(message);
        default:
          throw new Error(`Unsupported intent: ${intent}`);
      }
    } catch (error) {
      this.logError(error, { message });
      throw error;
    }
  }

  public async handleToolUse(tool: Tool): Promise<Response> {
    // Implement tool usage specific to GitHub operations
    return this.createResponse('Tool handling not implemented yet');
  }

  private async handleCodeReview(message: Message): Promise<Response> {
    try {
      // Extract PR number from message
      const prNumber = this.extractPRNumber(message.content);
      
      // Get PR details
      const { data: pr } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      // Get PR files
      const { data: files } = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });

      // Analyze changes
      const analysis = await this.analyzeChanges(files);

      // Create review
      await this.octokit.pulls.createReview({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: analysis.summary,
        comments: analysis.comments,
        event: 'COMMENT'
      });

      return this.createResponse('Code review completed');
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  private async handleIssueCreation(message: Message): Promise<Response> {
    try {
      const { title, body, labels } = this.extractIssueDetails(message.content);

      const { data: issue } = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        labels
      });

      return this.createResponse(`Issue created: #${issue.number}`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  private async handlePRCreation(message: Message): Promise<Response> {
    try {
      const { title, body, head, base } = this.extractPRDetails(message.content);

      const { data: pr } = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head,
        base
      });

      return this.createResponse(`PR created: #${pr.number}`);
    } catch (error) {
      this.logError(error);
      throw error;
    }
  }

  private async classifyIntent(content: string): Promise<string> {
    // TODO: Implement intent classification using LLM
    if (content.includes('review')) return 'review_code';
    if (content.includes('issue')) return 'create_issue';
    if (content.includes('pr') || content.includes('pull request')) return 'create_pr';
    return 'unknown';
  }

  private async analyzeChanges(files: any[]): Promise<{ summary: string; comments: any[] }> {
    // TODO: Implement code analysis
    return {
      summary: 'Code review summary placeholder',
      comments: []
    };
  }

  private extractPRNumber(content: string): number {
    const match = content.match(/#(\d+)/);
    if (!match) throw new Error('No PR number found in message');
    return parseInt(match[1], 10);
  }

  private extractIssueDetails(content: string): { title: string; body: string; labels: string[] } {
    // TODO: Implement better extraction logic
    return {
      title: 'Issue title placeholder',
      body: 'Issue body placeholder',
      labels: ['needs-review']
    };
  }

  private extractPRDetails(content: string): { title: string; body: string; head: string; base: string } {
    // TODO: Implement better extraction logic
    return {
      title: 'PR title placeholder',
      body: 'PR body placeholder',
      head: 'feature-branch',
      base: 'main'
    };
  }

  private createResponse(content: string): Response {
    return {
      type: 'github_response',
      content,
      timestamp: Date.now()
    };
  }
}
