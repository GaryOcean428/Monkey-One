import { GitHubAgent } from './GitHubAgent';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Octokit } from '@octokit/rest';

describe('GitHubAgent', () => {
  let agent: GitHubAgent;
  const mockOctokit = {
    rest: {
      pulls: {
        get: vi.fn(),
        listFiles: vi.fn(),
        createReview: vi.fn(),
      },
      issues: {
        createComment: vi.fn(),
      },
      rateLimit: {
        get: vi.fn(),
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
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await agent.handleRequest(mockReq as any, mockRes as any);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
