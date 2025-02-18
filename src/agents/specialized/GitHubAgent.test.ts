import { GitHubAgent } from './GitHubAgent';
import { jest } from '@jest/globals';
import type { Octokit } from '@octokit/rest';

describe('GitHubAgent', () => {
  let agent: GitHubAgent;
  const mockOctokit = {
    rest: {
      pulls: {
        get: jest.fn(),
        listFiles: jest.fn(),
        createReview: jest.fn(),
      },
      issues: {
        createComment: jest.fn(),
      },
      rateLimit: {
        get: jest.fn(),
      },
    },
  } as unknown as Octokit;

  beforeEach(() => {
    agent = new GitHubAgent({
      octokit: mockOctokit,
      apiVersion: '2022-11-28',
    });
  });

  test('should initialize with valid configuration', () => {
    expect(agent).toBeInstanceOf(GitHubAgent);
    expect(agent['octokit']).toBeDefined();
  });

  test('handleRequest should process valid requests', async () => {
    const mockReq = { body: { action: 'pr_review', prNumber: 123 } };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await agent.handleRequest(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
