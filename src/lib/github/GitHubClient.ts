import { Octokit } from '@octokit/rest';

export class GitHubClient {
  private octokit: Octokit | null = null;
  private isConfigured: boolean = false;
  private username?: string;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    this.username = import.meta.env.VITE_GITHUB_USERNAME;
    const email = import.meta.env.VITE_GITHUB_USEREMAIL;

    if (token && this.username && email) {
      this.octokit = new Octokit({
        auth: token,
        userAgent: 'Monkey-One v1.0'
      });
      this.isConfigured = true;
    } else {
      console.warn('GitHub credentials not fully configured. Some features may be limited.');
    }
  }

  private ensureClient(): void {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Please configure GitHub credentials.');
    }
  }

  async searchCode(query: string, options?: {
    language?: string;
    sort?: 'indexed';
    order?: 'asc' | 'desc';
    perPage?: number;
    page?: number;
  }) {
    if (!this.isConfigured) {
      return { items: [] };
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.search.code({
        q: query + (options?.language ? ` language:${options.language}` : ''),
        sort: options?.sort,
        order: options?.order,
        per_page: options?.perPage || 30,
        page: options?.page || 1
      });

      return response.data;
    } catch (error) {
      console.warn('GitHub search failed:', error);
      return { items: [] };
    }
  }

  async createRepository(name: string, description?: string) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.repos.createForAuthenticatedUser({
        name,
        description,
        auto_init: true
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to create repository:', error);
      return null;
    }
  }

  async getBranches(owner: string, repo: string) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.repos.listBranches({
        owner,
        repo
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to get branches:', error);
      return [];
    }
  }

  async getCommits(owner: string, repo: string) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.repos.listCommits({
        owner,
        repo
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to get commits:', error);
      return [];
    }
  }

  async getPullRequests(owner: string, repo: string) {
    if (!this.isConfigured) {
      return [];
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.pulls.list({
        owner,
        repo
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to get pull requests:', error);
      return [];
    }
  }

  async getContents(owner: string, repo: string, path: string) {
    if (!this.isConfigured) {
      return null;
    }

    try {
      this.ensureClient();
      const response = await this.octokit!.rest.repos.getContent({
        owner,
        repo,
        path
      });
      return response.data;
    } catch (error) {
      console.warn('Failed to get contents:', error);
      return null;
    }
  }

  isGitHubConfigured(): boolean {
    return this.isConfigured;
  }

  getUsername(): string | undefined {
    return this.username;
  }
}