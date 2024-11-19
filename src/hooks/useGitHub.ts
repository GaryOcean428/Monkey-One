import { useState, useCallback, useEffect } from 'react';
import { GitHubManager } from '@/lib/github/GitHubManager';

export function useGitHub() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [manager] = useState(() => new GitHubManager());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const username = import.meta.env.VITE_GITHUB_USERNAME;
    const email = import.meta.env.VITE_GITHUB_USEREMAIL;
    
    setIsConfigured(Boolean(token && username && email));
  }, []);

  const searchRepositories = useCallback(async (query: string, options?: {
    sort?: 'stars' | 'forks' | 'updated';
    order?: 'asc' | 'desc';
  }) => {
    if (!isConfigured) {
      setError('GitHub credentials not properly configured');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await manager.searchCode(query, { language: 'typescript' });
      setSearchResults(results.items);
      return results.items;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search repositories';
      setError(message);
      console.error('Failed to search repositories:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [manager, isConfigured]);

  const initializeRepository = useCallback(async (name: string, description?: string) => {
    if (!isConfigured) {
      setError('GitHub credentials not properly configured');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await manager.initializeRepository(name, description);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize repository';
      setError(message);
      console.error('Failed to initialize repository:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [manager, isConfigured]);

  const getBranches = useCallback(async () => {
    if (!isConfigured) return [];
    try {
      return await manager.getBranches();
    } catch (error) {
      console.error('Failed to get branches:', error);
      return [];
    }
  }, [manager, isConfigured]);

  const getCommits = useCallback(async () => {
    if (!isConfigured) return [];
    try {
      return await manager.getCommits();
    } catch (error) {
      console.error('Failed to get commits:', error);
      return [];
    }
  }, [manager, isConfigured]);

  const getPullRequests = useCallback(async () => {
    if (!isConfigured) return [];
    try {
      return await manager.getPullRequests();
    } catch (error) {
      console.error('Failed to get pull requests:', error);
      return [];
    }
  }, [manager, isConfigured]);

  return {
    searchRepositories,
    initializeRepository,
    getBranches,
    getCommits,
    getPullRequests,
    searchResults,
    isLoading,
    error,
    isConfigured,
    clearError: () => setError(null)
  };
}