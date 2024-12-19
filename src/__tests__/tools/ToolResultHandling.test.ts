import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolResultHandling } from '../../lib/tools/ToolResultHandling';
import { Tool } from '../../types';
import { ToolExecutionError } from '../../lib/errors/AgentErrors';

const createMockTool = (result: unknown): Tool => ({
  name: 'mock',
  description: 'mock tool',
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
        (element): element is number => typeof element === 'number'
      );
      
      const result = await validatedTool.execute({});
      expect(result).toEqual([1, 2, 3]);
    });

    it('should reject arrays with invalid elements', async () => {
      const tool = createMockTool([1, '2', 3]);
      const validatedTool = ToolResultHandling.withArrayResult(
        tool,
        (element): element is number => typeof element === 'number'
      );
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });

    it('should reject non-array results', async () => {
      const tool = createMockTool(42);
      const validatedTool = ToolResultHandling.withArrayResult(
        tool,
        (element): element is number => typeof element === 'number'
      );
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });
  });

  describe('object validation', () => {
    interface TestObject {
      id: number;
      name: string;
    }

    const objectValidator = {
      id: (value: unknown): boolean => typeof value === 'number',
      name: (value: unknown): boolean => typeof value === 'string'
    };

    it('should validate objects with correct shape', async () => {
      const tool = createMockTool({ id: 1, name: 'test' });
      const validatedTool = ToolResultHandling.withObjectResult<TestObject>(
        tool,
        objectValidator
      );
      
      const result = await validatedTool.execute({});
      expect(result).toEqual({ id: 1, name: 'test' });
    });

    it('should reject objects with missing properties', async () => {
      const tool = createMockTool({ id: 1 });
      const validatedTool = ToolResultHandling.withObjectResult<TestObject>(
        tool,
        objectValidator
      );
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });

    it('should reject objects with invalid property types', async () => {
      const tool = createMockTool({ id: '1', name: 'test' });
      const validatedTool = ToolResultHandling.withObjectResult<TestObject>(
        tool,
        objectValidator
      );
      
      await expect(validatedTool.execute({}))
        .rejects.toThrow(ToolExecutionError);
    });
  });

  describe('async transformation', () => {
    it('should transform results asynchronously', async () => {
      const tool = createMockTool(42);
      const transformedTool = ToolResultHandling.withAsyncTransform(
        tool,
        async (result: number) => result * 2
      );
      
      const result = await transformedTool.execute({});
      expect(result).toBe(84);
    });

    it('should handle transformation errors', async () => {
      const tool = createMockTool(42);
      const transformedTool = ToolResultHandling.withAsyncTransform(
        tool,
        async () => {
          throw new Error('Transform error');
        }
      );
      
      await expect(transformedTool.execute({}))
        .rejects.toThrow(/Transform error/);
    });
  });

  describe('error mapping', () => {
    it('should map known errors', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('RATE_LIMIT_EXCEEDED'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'RATE_LIMIT_EXCEEDED': 'Please try again later'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('Please try again later');
    });

    it('should pass through unknown errors', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('UNKNOWN_ERROR'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'RATE_LIMIT_EXCEEDED': 'Please try again later'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('UNKNOWN_ERROR');
    });

    it('should handle regex patterns in error mapping', async () => {
      const tool = createMockTool(null);
      vi.spyOn(tool, 'execute').mockRejectedValue(new Error('Error code: 429'));
      
      const mappedTool = ToolResultHandling.withErrorMapping(tool, {
        'Error code: \\d+': 'An error occurred'
      });
      
      await expect(mappedTool.execute({}))
        .rejects.toThrow('An error occurred');
    });
  });

  describe('composition', () => {
    it('should support chaining multiple handlers', async () => {
      const tool = createMockTool([1, 2, 3]);
      const enhancedTool = ToolResultHandling.withAsyncTransform(
        ToolResultHandling.withArrayResult(
          tool,
          (element): element is number => typeof element === 'number'
        ),
        async (numbers: number[]) => numbers.map(n => n * 2)
      );
      
      const result = await enhancedTool.execute({});
      expect(result).toEqual([2, 4, 6]);
    });

    it('should maintain error context through the chain', async () => {
      const tool = createMockTool(['1', 2, 3]);
      const enhancedTool = ToolResultHandling.withErrorMapping(
        ToolResultHandling.withArrayResult(
          tool,
          (element): element is number => typeof element === 'number'
        ),
        {
          'Invalid result': 'Array must contain only numbers'
        }
      );
      
      await expect(enhancedTool.execute({}))
        .rejects.toThrow('Array must contain only numbers');
    });
  });
});
