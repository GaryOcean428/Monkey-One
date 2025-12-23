import { Octokit } from '@octokit/rest'
import { BaseAgent } from '../base/BaseAgent'
import { AgentConfig, AgentType, Message } from '../../types'
import type { AgentConfig } from '../../types/agent'
import type { Request, Response, NextFunction } from 'express'
import { rateLimit } from 'express-rate-limit'
import { logger } from '../../utils/logger'

interface GitHubConfig {
  id: string
  token: string
  owner: string
  repo: string
  maxRequestsPerMinute?: number
}

interface PullRequestFile {
  filename: string
  additions: number
  deletions: number
  changes: number
  patch?: string
}

interface RateLimitOptions {
  method: string
  url: string
  retryAfter: number
}

interface GitHubComment {
  path: string
  position?: number
  body: string
  line: number
  side?: 'LEFT' | 'RIGHT'
  start_line?: number
  start_side?: 'LEFT' | 'RIGHT'
}

interface AnalysisResult {
  summary: string
  comments: GitHubComment[]
}

export class GitHubAgent extends BaseAgent {
  private octokit: Octokit
  private owner: string
  private repo: string
  private rateLimiter: ReturnType<typeof rateLimit>

  constructor(config: GitHubConfig) {
    const agentConfig: AgentConfig = {
      id: config.id,
      name: 'GitHubAgent',
      type: AgentType.BASE,
      capabilities: [],
    }
    super(agentConfig)

    // Validate token
    if (!config.token?.match(/^gh[ps]_[a-zA-Z0-9]{36}$/)) {
      throw new Error('Invalid GitHub token format')
    }

    // Initialize rate limiter
    this.rateLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: config.maxRequestsPerMinute || 30,
      message: 'Too many requests from this agent, please try again later',
    })

    // Initialize Octokit with rate limiting
    this.octokit = new Octokit({
      auth: config.token,
      throttle: {
        onRateLimit: (retryAfter: number, options: RateLimitOptions) => {
          logger.warn(
            `Request quota exhausted for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`
          )
          return true
        },
        onSecondaryRateLimit: (retryAfter: number, options: RateLimitOptions) => {
          logger.warn(
            `Secondary rate limit hit for request ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`
          )
          return true
        },
      },
    })

    this.owner = config.owner
    this.repo = config.repo

    this.setupCapabilities()
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.processRequest(req)
      res.status(200).json(result)
    } catch (error) {
      this.handleError(error as Error, res)
    }
  }

  async handleToolUse(toolName: string, params: unknown): Promise<unknown> {
    const tool = this.getTool(toolName)
    return tool.execute(params)
  }

  private async handleCodeReview(message: Message): Promise<{ success: boolean }> {
    try {
      // Extract PR number from message
      const prNumber = this.extractPRNumber(message.content)

      // Check rate limit before proceeding
      const { data: rateLimit } = await this.octokit.rateLimit.get()
      const remaining = (rateLimit?.resources.core as { remaining: number }).remaining
      if (remaining < 10) {
        // Reserve some quota for other operations
        throw new Error('Insufficient API rate limit remaining')
      }

      // Get PR details and files
      const { data: _pr } = await this.octokit.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      })

      const { data: files } = await this.octokit.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
      })

      // Analyze changes
      const analysis = await this.analyzeChanges(files as PullRequestFile[])

      // Create review
      await this.octokit.pulls.createReview({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        body: analysis.summary,
        comments: analysis.comments,
        event: 'COMMENT',
      })

      return { success: true }
    } catch (error) {
      this.logError('Failed to review PR:', error)
      return { success: false }
    }
  }

  private async executeRequest<T>(
    req: Request,
    res: Response,
    next: NextFunction,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.rateLimiter(req, res, (error: Error | undefined) => {
        if (error) {
          reject(error)
        } else {
          operation().then(resolve).catch(reject)
        }
      })
    })
  }

  private extractPRNumber(content: string): number {
    const match = content.match(/^#?(\d{1,10})$/)
    if (!match) {
      throw new Error('Invalid PR number format')
    }
    const prNumber = parseInt(match[1], 10)
    if (prNumber <= 0) {
      throw new Error('PR number must be positive')
    }
    return prNumber
  }

  private extractIssueDetails(_content: string): { title: string; body: string; labels: string[] } {
    // TODO: Implement better extraction logic
    return {
      title: 'Issue title placeholder',
      body: 'Issue body placeholder',
      labels: ['needs-triage'],
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
      head: 'main',
      base: 'develop',
    }
  }

  private createResponse(_content: string, _data?: unknown): { success: boolean } {
    return {
      success: true,
    }
  }

  private async analyzeChanges(files: PullRequestFile[]): Promise<AnalysisResult> {
    const totalChanges = files.reduce((acc, file) => acc + file.changes, 0)
    const totalAdditions = files.reduce((acc, file) => acc + file.additions, 0)
    const totalDeletions = files.reduce((acc, file) => acc + file.deletions, 0)

    const fileAnalysis = files.map(file => ({
      filename: file.filename,
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions,
    }))

    return {
      summary: `Changes analyzed: ${files.length} files modified with ${totalChanges} changes (${totalAdditions} additions, ${totalDeletions} deletions)`,
      comments: fileAnalysis.map(file => ({
        body: `File ${file.filename} has ${file.changes} changes (${file.additions} additions, ${file.deletions} deletions)`,
        path: file.filename,
        line: 1,
      })),
    }
  }

  private getCapabilities() {
    return {
      codeReview: true,
      issueTracking: true,
      prManagement: true,
    }
  }

  private handleError(error: Error, res: Response): void {
    logger.error(`GitHub Agent Error: ${error.message}`)
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}
