import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolResultHandling } from '../../lib/tools/ToolResultHandling';
import { Tool } from '../../types';
import { ToolExecutionError } from '../../lib/errors/AgentErrors';

const createMockTool = (result: unknown): Tool => ({
  name: 'test',
  description: 'test tool',
  execute: vi.fn().mockResolvedValue(result)
});

describe('ToolResultHandling', () => {
  describe('basic validation', () => {
    it('should validate number results', async () => {
      const tool = createMockTool(42);
      const validatedTool = ToolResultHandling.withNumberResult(tool);
      
      const result = await validatedTool.execute({});
      expect(result).toBe(42);
    });

    it('should reject non-number results', async () => {
      const tool = createMockTool('not a number');
      const validatedTool = ToolResultHandling.withNumberResult(tool);
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });

    it('should validate string results', async () => {
      const tool = createMockTool('test');
      const validatedTool = ToolResultHandling.withStringResult(tool);
      
      const result = await validatedTool.execute({});
      expect(result).toBe('test');
    });

    it('should reject non-string results', async () => {
      const tool = createMockTool(123);
      const validatedTool = ToolResultHandling.withStringResult(tool);
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });
  });

  describe('array validation', () => {
    it('should validate array of numbers', async () => {
      const tool = createMockTool([1, 2, 3]);
      const validatedTool = ToolResultHandling.withArrayResult(
        tool,
        (value): value is number => typeof value === 'number'
      );
      
      const result = await validatedTool.execute({});
      expect(result).toEqual([1, 2, 3]);
    });

    it('should reject invalid array elements', async () => {
      const tool = createMockTool([1, '2', 3]);
      const validatedTool = ToolResultHandling.withArrayResult(
        tool,
        (value): value is number => typeof value === 'number'
      );
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });
  });

  describe('async transformation', () => {
    it('should transform results asynchronously', async () => {
      const tool = createMockTool(42);
      const transformedTool = ToolResultHandling.withAsyncTransformation(
        tool,
        async (num) => String(num)
      );
      
      const result = await transformedTool.execute({});
      expect(result).toBe('42');
    });

    it('should handle transformation errors', async () => {
      const tool = createMockTool(42);
      const transformedTool = ToolResultHandling.withAsyncTransformation(
        tool,
        async () => { throw new Error('Transform error'); }
      );
      
      await expect(transformedTool.execute({}))
        .rejects.toThrow(/Transform error/);
    });
  });

  describe('error mapping', () => {
    it('should map known errors', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('rate_limit_exceeded'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'rate_limit_exceeded': 'Please try again later'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('Please try again later');
    });

    it('should pass through unknown errors', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('UNKNOWN_ERROR'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'known_error': 'Mapped error'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('UNKNOWN_ERROR');
    });

    it('should handle regex patterns in error mapping', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('Error: Something went wrong'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'Error:': 'An error occurred'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('An error occurred');
    });
  });

  describe('composition', () => {
    it('should maintain error context through the chain', async () => {
      const tool = createMockTool(['1', '2', '3']);
      const composedTool = ToolResultHandling.withArrayResult(
        tool,
        (value): value is number => typeof value === 'number'
      );
      
      await expect(composedTool.execute({}))
        .rejects.toThrow('Array must contain only numbers');
    });
  });
});
