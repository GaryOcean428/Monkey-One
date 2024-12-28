import { expect, describe, it, beforeEach, vi } from 'vitest';
import { models } from '../models';

describe('Model Service', () => {
  describe('Model Configuration', () => {
    it('should have correct model tiers', () => {
      // Low tier
      expect(models['granite3.1-dense'].modelName).toBe('granite3.1-dense:2b');
      
      // Mid tier
      expect(models['claude-3-haiku'].modelName).toBe('claude-3-5-haiku@20241022');
      
      // High tier
      expect(models['claude-3-sonnet'].modelName).toBe('claude-3-5-sonnet-v2@20241022');
      
      // Superior tier
      expect(models['o1'].modelName).toBe('o1-2024-12-01');
    });

    it('should have valid context windows', () => {
      Object.values(models).forEach(model => {
        expect(model.contextWindow).toBeGreaterThan(0);
      });
    });

    it('should have valid provider assignments', () => {
      const validProviders = ['local', 'anthropic', 'openai', 'groq', 'qwen', 'perplexity'];
      Object.values(models).forEach(model => {
        expect(validProviders).toContain(model.provider);
      });
    });
  });

  describe('Model Capabilities', () => {
    it('should define key strengths for each model', () => {
      Object.values(models).forEach(model => {
        expect(model.keyStrengths).toBeDefined();
        expect(model.keyStrengths.length).toBeGreaterThan(0);
      });
    });

    it('should have valid release dates', () => {
      Object.values(models).forEach(model => {
        expect(model.releaseDate).toMatch(/^\d{4}(-\d{2})?$/);
      });
    });
  });

  describe('Documentation', () => {
    it('should have model card URLs', () => {
      Object.values(models).forEach(model => {
        expect(model.modelCardUrl).toMatch(/^https?:\/\/.+/);
      });
    });
  });
});
