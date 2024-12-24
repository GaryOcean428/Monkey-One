import { useState, useCallback, useEffect } from 'react';
import { vectorStore } from '../lib/vectorstore';
import type { CodeInsight, LearningMetric, VectorIndex, SearchResult } from '../types';

export function useVectorStore() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indexes, setIndexes] = useState<VectorIndex[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Fetch indexes on mount
  useEffect(() => {
    refreshIndexes();
  }, []);

  const refreshIndexes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const indexList = await vectorStore.listIndexes();
      setIndexes(indexList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch indexes';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createIndex = useCallback(async (
    name: string,
    dimension: number,
    options?: {
      description?: string;
      metric?: 'cosine' | 'euclidean' | 'dotproduct';
      pods?: number;
      replicas?: number;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await vectorStore.createIndex(name, dimension, options);
      await refreshIndexes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create index';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshIndexes]);

  const deleteIndex = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await vectorStore.deleteIndex(name);
      await refreshIndexes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete index';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshIndexes]);

  const search = useCallback(async (
    query: string,
    options?: {
      index?: string;
      limit?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const embedding = await vectorStore.generateEmbedding(query);
      const results = await vectorStore.search(embedding, options);
      setSearchResults(results);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to perform search';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findSimilarInsights = useCallback(async (
    embedding: number[],
    options?: {
      type?: string;
      confidence?: number;
      limit?: number;
      useCache?: boolean;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      return await vectorStore.findSimilarInsights(embedding, options);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find similar insights';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findSimilarPatterns = useCallback(async (
    embedding: number[],
    limit?: number
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      return await vectorStore.findSimilarLearningPatterns(embedding, limit);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find similar patterns';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeInsight = useCallback(async (
    insight: CodeInsight,
    embedding: number[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await vectorStore.storeInsight(insight, embedding);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to store insight';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const storeMetrics = useCallback(async (
    metrics: LearningMetric[],
    embedding: number[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await vectorStore.storeLearningMetrics(metrics, embedding);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to store metrics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Index management
    indexes,
    refreshIndexes,
    createIndex,
    deleteIndex,
    
    // Search functionality
    search,
    searchResults,
    
    // Insights and patterns
    findSimilarInsights,
    findSimilarPatterns,
    storeInsight,
    storeMetrics,
    
    // Status
    isLoading,
    error,
    clearError: () => setError(null)
  };
}