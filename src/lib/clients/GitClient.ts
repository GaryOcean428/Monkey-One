import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

interface GitConfig {
  baseBranch?: string;
  remote?: string;
  reviewers?: string[];
}

export class GitClient {
  private baseBranch: string;
  private remote: string;
  private reviewers: string[];

  constructor(config: GitConfig = {}) {
    this.baseBranch = config.baseBranch || 'main';
    this.remote = config.remote || 'origin';
    this.reviewers = config.reviewers || [];
  }

  private async execute(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        logger.warn('Git command warning:', stderr);
      }
      return stdout.trim();
    } catch (error) {
      logger.error('Git command failed:', error);
      throw error;
    }
  }

  async createBranch(branchName: string): Promise<void> {
    // Ensure we're on the latest base branch
    await this.execute(`git checkout ${this.baseBranch}`);
    await this.execute(`git pull ${this.remote} ${this.baseBranch}`);
    
    // Create and checkout new branch
    await this.execute(`git checkout -b ${branchName}`);
    logger.info(`Created and checked out branch: ${branchName}`);
  }

  async modifyFile(filePath: string, content: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, content, 'utf-8');
    logger.info(`Modified file: ${filePath}`);
  }

  async commit(message: string, files: string[]): Promise<void> {
    // Stage specified files
    for (const file of files) {
      await this.execute(`git add "${file}"`);
    }

    // Create commit
    await this.execute(`git commit -m "${message}"`);
    logger.info('Created commit with message:', message);
  }

  async push(branchName: string): Promise<void> {
    await this.execute(`git push ${this.remote} ${branchName}`);
    logger.info(`Pushed branch ${branchName} to ${this.remote}`);
  }

  async createPullRequest(title: string, description: string, branchName: string): Promise<string> {
    // This is a placeholder - actual implementation would depend on your Git hosting service
    // (GitHub, GitLab, etc.) and their respective APIs
    logger.info(`Would create PR: ${title} from ${branchName}`);
    return 'pr_url_placeholder';
  }

  async getCurrentBranch(): Promise<string> {
    return this.execute('git rev-parse --abbrev-ref HEAD');
  }

  async getChangedFiles(): Promise<string[]> {
    const output = await this.execute('git status --porcelain');
    return output
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.slice(3));
  }

  async getDiff(file: string): Promise<string> {
    return this.execute(`git diff ${file}`);
  }

  async revertChanges(files: string[]): Promise<void> {
    for (const file of files) {
      await this.execute(`git checkout -- "${file}"`);
    }
    logger.info('Reverted changes in files:', files);
  }

  setReviewers(reviewers: string[]): void {
    this.reviewers = reviewers;
  }

  getReviewers(): string[] {
    return [...this.reviewers];
  }
}
