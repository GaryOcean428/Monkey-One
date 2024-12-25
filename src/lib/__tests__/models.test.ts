import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateResponse, generateStreamingResponse, getModel } from '../models';
import { TokenCounter } from '../utils/tokenCounter';
import { LocalModelClient } from '../local/localModelClient';
import { ResponseCache } from '../utils/responseCache';
import { RateLimiter } from '../utils/rateLimiter';

// Mock dependencies
vi.mock('../utils/tokenCounter');
vi.mock('../local/localModelClient');
vi.mock('../utils/responseCache');
vi.mock('../utils/rateLimiter');

describe('Model Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateResponse', () => {
    it('should use default model when no model specified', async () => {
      const response = await generateResponse('test prompt');
      expect(response).toBeDefined();
      expect(response.text).toBeTruthy();
    });

    it('should respect token limits', async () => {
      vi.spyOn(TokenCounter, 'validateContextLength').mockReturnValueOnce(false);
      
      await expect(generateResponse('test prompt')).rejects.toThrow(/exceeds maximum context length/);
    });

    it('should use cache when available', async () => {
      const cachedResponse = {
        text: 'cached response',
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
      };
      
      vi.spyOn(ResponseCache.prototype, 'get').mockResolvedValueOnce(cachedResponse);
      
      const response = await generateResponse('test prompt', undefined, { cacheResponse: true });
      expect(response).toEqual(cachedResponse);
    });

    it('should fall back to alternative model on error', async () => {
      const mockError = new Error('Primary model failed');
      vi.spyOn(LocalModelClient.prototype, 'generate').mockRejectedValueOnce(mockError);
      
      const fallbackResponse = {
        text: 'fallback response',
        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
      };
      vi.spyOn(LocalModelClient.prototype, 'generate').mockResolvedValueOnce(fallbackResponse);
      
      const response = await generateResponse('test prompt');
      expect(response).toEqual(fallbackResponse);
    });
  });

  describe('generateStreamingResponse', () => {
    it('should stream responses', async () => {
      const chunks = [
        { text: 'chunk1', done: false },
        { text: 'chunk2', done: false },
        { text: 'chunk3', done: true }
      ];

      vi.spyOn(LocalModelClient.prototype, 'generateStream').mockImplementation(async function*() {
        for (const chunk of chunks) {
          yield chunk;
        }
      });

      const generator = generateStreamingResponse('test prompt');
      const results = [];
      
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toEqual(chunks);
    });

    it('should handle streaming errors gracefully', async () => {
      const mockError = new Error('Streaming failed');
      vi.spyOn(LocalModelClient.prototype, 'generateStream').mockImplementation(async function*() {
        throw mockError;
      });

      const generator = generateStreamingResponse('test prompt');
      const results = [];
      
      for await (const chunk of generator) {
        results.push(chunk);
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        text: mockError.message,
        done: true
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      vi.spyOn(RateLimiter.prototype, 'waitForToken').mockResolvedValueOnce(false);
      
      await expect(generateResponse('test prompt')).rejects.toThrow(/Rate limit exceeded/);
    });

    it('should wait for available tokens', async () => {
      const mockWait = vi.spyOn(RateLimiter.prototype, 'waitForToken');
      mockWait.mockResolvedValueOnce(true);

      await generateResponse('test prompt');
      expect(mockWait).toHaveBeenCalled();
    });
  });
});
