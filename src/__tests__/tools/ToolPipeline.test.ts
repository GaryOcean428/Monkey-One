import { ToolPipeline, ToolOptions } from '../../lib/tools/ToolPipeline';
import { Tool } from '../../types';
import { ToolExecutionError } from '../../lib/errors/AgentErrors';
import { AgentMonitor } from '../../lib/monitoring/AgentMonitor';

// Move interfaces to top level
interface ToolExecution {
  toolName: string;
  args: Record<string, unknown>;
}

// Augment ToolPipeline type to include executeBatch
declare module '../../lib/tools/ToolPipeline' {
  interface ToolPipeline {
    executeBatch(executions: ToolExecution[], parallel: boolean): Promise<unknown[]>;  
  }
}

jest.mock('../../lib/monitoring/AgentMonitor');

describe('ToolPipeline', () => {
  let pipeline: ToolPipeline;
  let mockMonitor: jest.Mocked<AgentMonitor>;
  
  const DEFAULT_TIMEOUT = 30000; // Add default timeout constant

  beforeEach(() => {
    jest.useFakeTimers();
    mockMonitor = new AgentMonitor() as jest.Mocked<AgentMonitor>;
    pipeline = new ToolPipeline();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const createMockTool = (name: string, delay = 0): Tool => ({
    name,
    description: `Mock tool ${name}`,
    execute: jest.fn().mockImplementation(async (args) => {
      if (delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return { toolName: name, args };
    })
  });

  describe('tool registration', () => {
    it('should register tools successfully', () => {
      const tool = createMockTool('test');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });
      expect(pipeline.getRegisteredTools()).toContainEqual(tool);
    });

    it('should prevent duplicate tool registration', () => {
      const tool = createMockTool('test');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });
      expect(() => pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT })).toThrow(ToolExecutionError);
    });

    it('should validate tool definition', () => {
      const invalidTool = { description: 'invalid' } as unknown as Tool;
      expect(() => pipeline.registerTool(invalidTool, { timeout: DEFAULT_TIMEOUT })).toThrow(ToolExecutionError);
    });

    it('should unregister tools', () => {
      const tool = createMockTool('test');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });
      pipeline.unregisterTool('test');
      expect(pipeline.getRegisteredTools()).not.toContainEqual(tool);
    });
  });

  describe('tool execution', () => {
    it('should execute tools successfully', async () => {
      const tool = createMockTool('test');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });

      const result = await pipeline.executeTool('test', { param: 'value' });
      expect(result).toEqual({
        toolName: 'test',
        args: { param: 'value' }
      });
      expect(mockMonitor.startOperation).toHaveBeenCalledWith('tool.test');
      expect(mockMonitor.endOperation).toHaveBeenCalled();
    });

    it('should handle tool timeouts', async () => {
      const tool = createMockTool('slow', 31000); // Longer than default timeout
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });

      const execution = pipeline.executeTool('slow', {});
      jest.advanceTimersByTime(31000);

      await expect(execution).rejects.toThrow(ToolExecutionError);
      expect(mockMonitor.endOperation).toHaveBeenCalledWith('tool.slow', expect.objectContaining({
        success: false
      }));
    });

    it('should respect custom timeouts', async () => {
      const tool = createMockTool('quick', 500);
      pipeline.registerTool(tool, { timeout: 1000 });

      const execution = pipeline.executeTool('quick', {});
      jest.advanceTimersByTime(500);

      await expect(execution).resolves.toBeDefined();
    });

    it('should handle rate limiting', async () => {
      const tool = createMockTool('limited');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, rateLimit: 2 });

      await pipeline.executeTool('limited', {});
      await pipeline.executeTool('limited', {});

      // Third execution should fail
      await expect(pipeline.executeTool('limited', {}))
        .rejects.toThrow(/Rate limit exceeded/);
    });

    it('should reset rate limit after cooldown', async () => {
      const tool = createMockTool('limited');
      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, rateLimit: 1 });

      await pipeline.executeTool('limited', {});
      jest.advanceTimersByTime(61000); // > 1 minute

      // Should succeed after cooldown
      await expect(pipeline.executeTool('limited', {}))
        .resolves.toBeDefined();
    });
  });

  describe('caching', () => {
    it('should cache tool results', async () => {
      const tool = createMockTool('cached');
      const execute = jest.spyOn(tool, 'execute');

      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, cache: true });

      const args = { test: true };
      await pipeline.executeTool('cached', args);
      await pipeline.executeTool('cached', args);

      expect(execute).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache after time', async () => {
      const tool = createMockTool('cached');
      const execute = jest.spyOn(tool, 'execute');

      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, cache: true });

      const args = { test: true };
      await pipeline.executeTool('cached', args);
      jest.advanceTimersByTime(301000); // > 5 minutes
      await pipeline.executeTool('cached', args);

      expect(execute).toHaveBeenCalledTimes(2);
    });

    it('should use different cache keys for different args', async () => {
      const tool = createMockTool('cached');
      const execute = jest.spyOn(tool, 'execute');

      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, cache: true });

      await pipeline.executeTool('cached', { test: 1 });
      await pipeline.executeTool('cached', { test: 2 });

      expect(execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('parallel execution', () => {
    it('should execute tools in parallel', async () => {
      const tool1 = createMockTool('tool1', 100);
      const tool2 = createMockTool('tool2', 100);

      pipeline.registerTool(tool1, { timeout: DEFAULT_TIMEOUT });
      pipeline.registerTool(tool2, { timeout: DEFAULT_TIMEOUT });

      const executions = [
        { toolName: 'tool1', args: {} },
        { toolName: 'tool2', args: {} }
      ];

      const execution = pipeline.executeBatch(executions, true);
      jest.advanceTimersByTime(100);

      await expect(execution).resolves.toHaveLength(2);
      expect(mockMonitor.startOperation).toHaveBeenCalledTimes(2);
    });

    it('should handle errors in parallel execution', async () => {
      const tool1 = createMockTool('tool1');
      const tool2 = createMockTool('tool2');

      (tool2.execute as jest.Mock).mockRejectedValue(new Error('Failed'));

      pipeline.registerTool(tool1, { timeout: DEFAULT_TIMEOUT });
      pipeline.registerTool(tool2, { timeout: DEFAULT_TIMEOUT });

      const executions = [
        { toolName: 'tool1', args: {} },
        { toolName: 'tool2', args: {} }
      ];

      await expect(pipeline.executeBatch(executions, true))
        .rejects.toThrow('Failed');
    });
  });

  describe('dependencies', () => {
    it('should validate tool dependencies', async () => {
      const tool = createMockTool('dependent');
      pipeline.registerTool(tool, {
        timeout: DEFAULT_TIMEOUT,
        dependencies: ['missing-tool']
      });

      await expect(pipeline.executeTool('dependent', {}))
        .rejects.toThrow(/Missing dependency/);
    });

    it('should allow execution when dependencies are met', async () => {
      const dependency = createMockTool('dependency');
      const dependent = createMockTool('dependent');

      pipeline.registerTool(dependency, { timeout: DEFAULT_TIMEOUT });
      pipeline.registerTool(dependent, {
        timeout: DEFAULT_TIMEOUT,
        dependencies: ['dependency']
      });

      await expect(pipeline.executeTool('dependent', {}))
        .resolves.toBeDefined();
    });

    it('should handle unregistering dependencies', async () => {
      const dependency = createMockTool('dependency');
      const dependent = createMockTool('dependent');

      pipeline.registerTool(dependency, { timeout: DEFAULT_TIMEOUT });
      pipeline.registerTool(dependent, {
        timeout: DEFAULT_TIMEOUT,
        dependencies: ['dependency']
      });

      pipeline.unregisterTool('dependency');

      await expect(pipeline.executeTool('dependent', {}))
        .rejects.toThrow(/Missing dependency/);
    });
  });

  describe('error handling', () => {
    it('should retry failed executions', async () => {
      const tool = createMockTool('failing');
      let attempts = 0;

      (tool.execute as jest.Mock).mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Temporary failure');
        }
        return { success: true };
      });

      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT, retries: 2 });
      const result = await pipeline.executeTool('failing', {});

      expect(result).toEqual({ success: true });
      expect(attempts).toBe(2);
      expect(mockMonitor.endOperation).toHaveBeenCalledWith(
        'tool.failing',
        expect.objectContaining({ retries: 0 })
      );
    });

    it('should handle non-Error exceptions', async () => {
      const tool = createMockTool('failing');
      (tool.execute as jest.Mock).mockRejectedValue('string error');

      pipeline.registerTool(tool, { timeout: DEFAULT_TIMEOUT });

      await expect(pipeline.executeTool('failing', {}))
        .rejects.toThrow();
      expect(mockMonitor.endOperation).toHaveBeenCalledWith(
        'tool.failing',
        expect.objectContaining({
          success: false,
          error: expect.any(String)
        })
      );
    });
  });
});
