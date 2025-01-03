import { Octokit } from '@octokit/rest'
import { BaseAgent } from '../../lib/agents/base/BaseAgent'
import { AgentType } from '../../lib/types/agent'
import type {
  Message,
  AgentConfig,
  AgentCapabilityType,
  MessageResponse,
} from '../../lib/types/agent'
import type { Tool } from '../../tools/registry/Tool'

interface GitHubConfig {
  id: string
  token: string
  owner: string
  repo: string
}

type PullRequestFile = {
  filename: string
  additions: number
  deletions: number
  changes: number
  patch?: string
}

export class GitHubAgent extends BaseAgent {
  private octokit: Octokit
  private owner: string
  private repo: string

  constructor(config: GitHubConfig) {
    const agentConfig: AgentConfig = {
      id: config.id,
      name: 'GitHubAgent',
      type: AgentType.BASE,
      capabilities: [],
    }
    super(agentConfig)

    this.octokit = new Octokit({ auth: config.token })
    this.owner = config.owner
    this.repo = config.repo

    this.setupCapabilities()
  }

  private setupCapabilities(): void {
    const capabilities: AgentCapabilityType[] = [
      {
        name: 'code_review',
        description: 'Reviews pull request code changes',
        version: '1.0.0',
        parameters: {
          pr_number: {
            type: 'number',
            description: 'Pull request number to review',
            required: true,
          },
        },
      },
      {
        name: 'issue_management',
        description: 'Creates and manages GitHub issues',
        version: '1.0.0',
        parameters: {
          title: {
            type: 'string',
            description: 'Issue title',
            required: true,
          },
          body: {
            type: 'string',
            description: 'Issue description',
            required: true,
          },
        },
      },
      {
        name: 'pr_management',
        description: 'Creates and manages pull requests',
        version: '1.0.0',
        parameters: {
          title: {
            type: 'string',
            description: 'PR title',
            required: true,
          },
          body: {
            type: 'string',
            description: 'PR description',
            required: true,
          },
          head: {
            type: 'string',
            description: 'Head branch',
            required: true,
          },
          base: {
            type: 'string',
            description: 'Base branch',
            required: true,
          },
        },
      },
    ]

    capabilities.forEach(cap => this.addCapability(cap))
  }

  public async handleMessage(message: Message): Promise<{ success: boolean }> {
    try {
      const intent = await this.classifyIntent(message.content)
      switch (intent) {
        case 'review_code':
          return await this.handleCodeReview(message)
        case 'create_issue':
          return await this.handleIssueCreation(message)
        case 'create_pr':
          return await this.handlePRCreation(message)
        default:
          throw new Error(`Unsupported intent: ${intent}`)
      }
    } catch (error) {
      this.logError(error, { message })
      throw error
    }
  }

  public async handleRequest(request: unknown): Promise<unknown> {
    if (typeof request === 'string') {
      return this.handleMessage({
        id: Date.now().toString(),
        type: 'text',
        content: request,
        timestamp: Date.now(),
      })
    }
    throw new Error('Invalid request format')
  }

  public async handleToolUse(tool: unknown): Promise<MessageResponse> {
    try {
      const typedTool = tool as Tool
      const metadata = typedTool.getMetadata()

      if (
        metadata.capabilities.some(cap =>
          ['code_review', 'issue_management', 'pr_management'].includes(cap)
        )
      ) {
        const result = await typedTool.execute({})
        return { status: 'success', data: result }
      }

      throw new Error('Unsupported tool for GitHub operations')
    } catch (error) {
      return {
        status: 'error',
        data: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  protected logError(error: unknown, context?: Record<string, unknown>): void {
    console.error('[GitHubAgent Error]', error, context)
  }

  private async handleCodeReview(message: Message): Promise<{ success: boolean }> {
    try {
      // Extract PR number from message
      const prNumber = this.extractPRNumber(message.content)

      // Get PR details
      const { data: _pr } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      })

      // Get PR files
      const { data: files } = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      })

      // Analyze changes
      const analysis = await this.analyzeChanges(files)

      // Create review
      await this.octokit.pulls.createReview({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: analysis.summary,
        comments: analysis.comments,
        event: 'COMMENT',
      })

      return this.createResponse('Code review completed')
    } catch (error) {
      this.logError(error)
      throw error
    }
  }

  private async handleIssueCreation(message: Message): Promise<{ success: boolean }> {
    try {
      const { title, body, labels } = this.extractIssueDetails(message.content)

      const { data: issue } = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        labels,
      })

      return this.createResponse(`Issue created: #${issue.number}`)
    } catch (error) {
      this.logError(error)
      throw error
    }
  }

  private async handlePRCreation(message: Message): Promise<{ success: boolean }> {
    try {
      const { title, body, head, base } = this.extractPRDetails(message.content)

      const { data: pr } = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        body,
        head,
        base,
      })

      return this.createResponse(`PR created: #${pr.number}`)
    } catch (error) {
      this.logError(error)
      throw error
    }
  }

  private async classifyIntent(content: string): Promise<string> {
    // TODO: Implement intent classification using LLM
    if (content.includes('review')) return 'review_code'
    if (content.includes('issue')) return 'create_issue'
    if (content.includes('pr') || content.includes('pull request')) return 'create_pr'
    return 'unknown'
  }

  private async analyzeChanges(
    files: PullRequestFile[]
  ): Promise<{ summary: string; comments: any[] }> {
    const totalChanges = files.reduce((acc, file) => acc + file.changes, 0)
    const totalAdditions = files.reduce((acc, file) => acc + file.additions, 0)
    const totalDeletions = files.reduce((acc, file) => acc + file.deletions, 0)

    const fileAnalysis = files.map(file => ({
      filename: file.filename,
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
    }))

    return {
      summary: `Changes analyzed: ${files.length} files modified with ${totalChanges} changes (${totalAdditions} additions, ${totalDeletions} deletions)`,
      comments: fileAnalysis.map(file => ({
        path: file.filename,
        body: `File has ${file.changes} changes (${file.additions} additions, ${file.deletions} deletions)`,
      })),
    }
  }

  private extractPRNumber(content: string): number {
    const match = content.match(/#(\d+)/)
    if (!match) throw new Error('No PR number found in message')
    return parseInt(match[1], 10)
  }

  private extractIssueDetails(_content: string): { title: string; body: string; labels: string[] } {
    // TODO: Implement better extraction logic
    return {
      title: 'Issue title placeholder',
      body: 'Issue body placeholder',
      labels: ['needs-review'],
    }
  }

  private extractPRDetails(_content: string): {
    title: string
    body: string
    head: string
    base: string
  } {
    // TODO: Implement better extraction logic
    return {
      title: 'PR title placeholder',
      body: 'PR body placeholder',
      head: 'feature-branch',
      base: 'main',
    }
  }

  private createResponse(_content: string, _data?: unknown): { success: boolean } {
    return {
      success: true,
    }
  }
}
