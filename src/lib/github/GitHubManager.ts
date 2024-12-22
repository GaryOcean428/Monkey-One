import { GitHubClient } from './GitHubClient';

export class GitHubManager {
  private client: GitHubClient;
  private currentRepository?: {
    owner: string;
    name: string;
  };

  constructor() {
    this.client = new GitHubClient();
  }

  async initializeRepository(name: string, description?: string) {
    try {
      const repo = await this.client.createRepository(name, description);
      if (repo) {
        this.currentRepository = {
          owner: repo.owner.login,
          name: repo.name
        };
      }
      return repo;
    } catch (error) {
      console.error('Failed to initialize repository:', error);
      throw error;
    }
  }

  async searchCode(query: string, options?: { language?: string }) {
    try {
      return await this.client.searchCode(query, options);
    } catch (error) {
      console.error('Failed to search code:', error);
      throw error;
    }
  }

  async getBranches() {
    try {
      if (!this.currentRepository) {
        throw new Error('No repository selected');
      }
      return await this.client.getBranches(
        this.currentRepository.owner,
        this.currentRepository.name
      );
    } catch (error) {
      console.error('Failed to get branches:', error);
      return [];
    }
  }

  async getCommits() {
    try {
      if (!this.currentRepository) {
        throw new Error('No repository selected');
      }
      return await this.client.getCommits(
        this.currentRepository.owner,
        this.currentRepository.name
      );
    } catch (error) {
      console.error('Failed to get commits:', error);
      return [];
    }
  }

  async getPullRequests() {
    try {
      if (!this.currentRepository) {
        throw new Error('No repository selected');
      }
      return await this.client.getPullRequests(
        this.currentRepository.owner,
        this.currentRepository.name
      );
    } catch (error) {
      console.error('Failed to get pull requests:', error);
      return [];
    }
  }

  getCurrentRepository() {
    return this.currentRepository;
  }
}