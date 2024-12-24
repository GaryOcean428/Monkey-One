import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toolhouse } from '@/lib/toolhouse';
import type { WebSearchResult, Memory, CodeGenerationOptions, ImageGenerationOptions } from '@/lib/toolhouse';

// Retry configuration
const RETRY_COUNT = parseInt(import.meta.env.VITE_AI_RETRY_ATTEMPTS || '3');
const RETRY_DELAY = 1000; // Start with 1 second delay

const getExponentialDelay = (attempt: number) => {
  return Math.min(RETRY_DELAY * Math.pow(2, attempt), 30000); // Cap at 30 seconds
};

// Cache configuration
const CACHE_TIME = 1000 * 60 * 5; // 5 minutes
const STALE_TIME = 1000 * 60; // 1 minute

export const useWebSearch = (query: string) => {
  return useQuery({
    queryKey: ['webSearch', query],
    queryFn: () => toolhouse.webSearch(query),
    enabled: !!query,
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });
};

export const useMemoryStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: { text: string; metadata?: Record<string, any> }) =>
      toolhouse.storeMemory(content.text, content.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
  });
};

export const useMemorySearch = (query: string) => {
  return useQuery({
    queryKey: ['memorySearch', query],
    queryFn: () => toolhouse.searchMemory(query),
    enabled: !!query,
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });
};

export const useCodeGeneration = () => {
  return useMutation({
    mutationFn: ({ prompt, options }: { prompt: string; options?: CodeGenerationOptions }) =>
      toolhouse.generateCode(prompt, options),
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
  });
};

export const useImageGeneration = () => {
  return useMutation({
    mutationFn: ({ prompt, options }: { prompt: string; options?: ImageGenerationOptions }) =>
      toolhouse.generateImage(prompt, options),
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
  });
};

export const usePineconeSearch = (vector: number[], topK: number = 10) => {
  return useQuery({
    queryKey: ['pineconeSearch', vector, topK],
    queryFn: () => toolhouse.pineconeSearch(vector, {
      apiKey: import.meta.env.VITE_PINECONE_API_KEY,
      environment: import.meta.env.VITE_PINECONE_ENVIRONMENT,
      indexName: import.meta.env.VITE_PINECONE_INDEX_NAME,
    }, topK),
    enabled: !!vector.length,
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });
};

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: () => toolhouse.getNews(),
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
    retry: RETRY_COUNT,
    retryDelay: getExponentialDelay,
    cacheTime: CACHE_TIME,
    staleTime: STALE_TIME,
  });
};
