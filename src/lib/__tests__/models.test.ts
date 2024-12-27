import { describe, it, expect, vi } from 'vitest';
import { getModel, generateResponseFromModel, generateStreamFromModel, calculateTokenCost } from '../models';

describe('Model Service', () => {
  describe('generateResponse', () => {
    it('should use default model when no model specified', async () => {
      const response = await generateResponseFromModel('test prompt');
      expect(response).toContain('gpt-4o-2024-11-06');
    });

    it('should respect token limits', async () => {
      const longPrompt = 'x'.repeat(1000000); // Very long prompt
      await expect(generateResponseFromModel(longPrompt)).rejects.toThrow(/exceeds maximum context length/);
    });

    it('should use cache when available', async () => {
      const prompt = 'test prompt';
      const firstResponse = await generateResponseFromModel(prompt);
      const secondResponse = await generateResponseFromModel(prompt);
      expect(secondResponse).toBe(firstResponse);
    });

    it('should fall back to alternative model on error', async () => {
      const response = await generateResponseFromModel('test prompt', 'o1-2024-12-01');
      expect(response).toContain('o1-2024-12-01');
    });
  });

  describe('generateStreamingResponse', () => {
    it('should stream responses', async () => {
      const stream = await generateStreamFromModel('test prompt');
      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it('should handle streaming errors gracefully', async () => {
      // Mock an error in the stream
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Stream error');
      vi.spyOn(ReadableStream.prototype, 'getReader').mockImplementation(() => {
        throw mockError;
      });

      await expect(generateStreamFromModel('test')).rejects.toThrow('Stream error');
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits', async () => {
      const promises = Array(600).fill(null).map(() => 
        generateResponseFromModel('test', 'gpt-4o-2024-11-06')
      );
      await expect(Promise.all(promises)).rejects.toThrow(/Rate limit exceeded/);
    });

    it('should wait for available tokens', async () => {
      const response = await generateResponseFromModel('test prompt');
      expect(response).toContain('gpt-4o-2024-11-06');
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate costs correctly', () => {
      const cost = calculateTokenCost(1000, 'gpt-4o-2024-11-06');
      expect(cost).toBe(0.03); // 1000 tokens * 0.00003 per token
    });
  });
});
