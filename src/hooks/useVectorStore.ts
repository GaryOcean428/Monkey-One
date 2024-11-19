import { useState, useCallback } from 'react';
import { vectorStore } from '@/lib/vectorstore';
import type { CodeInsight, LearningMetric } from '@/types';

export function useVectorStore() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    findSimilarInsights,
    findSimilarPatterns,
    storeInsight,
    storeMetrics,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}