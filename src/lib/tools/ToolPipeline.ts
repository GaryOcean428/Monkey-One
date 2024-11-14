import { Tool } from '../../types';
import { ToolExecutionError, ErrorDetails } from '../errors/AgentErrors';

export class ToolPipeline implements Tool {
  readonly name: string;
  readonly description: string;
  private tools: Map<string, Tool>;
  private monitor?: Tool;

  constructor(monitor?: Tool) {
    this.name = 'pipeline';
    this.description = 'Executes a pipeline of tools in sequence';
    this.tools = new Map();
    this.monitor = monitor;
  }

  registerTool(nameOrTool: string | Tool, tool?: Tool): this {
    if (typeof nameOrTool === 'string' && tool) {
      // Called as registerTool(name, tool)
      this.tools.set(nameOrTool, tool);
    } else if (typeof nameOrTool === 'object') {
      // Called as registerTool(tool)
      this.tools.set(nameOrTool.name, nameOrTool);
    } else {
      throw new Error('Invalid arguments for registerTool');
    }
    return this;
  }

  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  getRegisteredTools(): ReadonlyMap<string, Tool> {
    return this.tools;
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      const details: ErrorDetails = {
        toolName: this.name,
        requestedTool: name,
        availableTools: Array.from(this.tools.keys()).join(', '),
        errorType: 'NotFoundError'
      };
      throw new ToolExecutionError(`Tool not found: ${name}`, details);
    }

    try {
      if (this.monitor) {
        await this.monitor.execute({
          event: 'tool_start',
          tool: name,
          args
        });
      }

      const result = await tool.execute(args);

      if (this.monitor) {
        await this.monitor.execute({
          event: 'tool_end',
          tool: name,
          result
        });
      }

      return result;
    } catch (error) {
      if (this.monitor) {
        await this.monitor.execute({
          event: 'tool_error',
          tool: name,
          error: error instanceof Error ? error.message : String(error)
        });
      }

      const details: ErrorDetails = {
        toolName: this.name,
        executedTool: name,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      };
      throw new ToolExecutionError(
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        details
      );
    }
  }

  async executeMany(executions: Array<{ toolName: string; args: Record<string, unknown> }>, stopOnError = false): Promise<unknown[]> {
    const results: unknown[] = [];
    const errors: Error[] = [];
    
    for (const { toolName, args } of executions) {
      try {
        const result = await this.executeTool(toolName, args);
        results.push(result);
      } catch (error) {
        if (stopOnError) {
          const details: ErrorDetails = {
            toolName: this.name,
            executedTool: toolName,
            completedExecutions: String(results.length),
            totalExecutions: String(executions.length),
            errorType: error instanceof Error ? error.constructor.name : typeof error
          };
          throw new ToolExecutionError(
            `Pipeline execution failed: ${error instanceof Error ? error.message : String(error)}`,
            details
          );
        }
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    if (errors.length > 0 && !stopOnError) {
      const details: ErrorDetails = {
        toolName: this.name,
        completedExecutions: String(results.length),
        totalExecutions: String(executions.length),
        errors: errors.map(e => e.message).join('; '),
        errorType: 'BatchExecutionError'
      };
      throw new ToolExecutionError('Pipeline execution completed with errors', details);
    }

    return results;
  }

  async execute(args: Record<string, unknown>): Promise<unknown> {
    if (Array.isArray(args.executions)) {
      return this.executeMany(
        args.executions as Array<{ toolName: string; args: Record<string, unknown> }>,
        args.stopOnError as boolean
      );
    }

    const toolName = args.tool as string;
    const toolArgs = args.args as Record<string, unknown>;

    if (!toolName) {
      const details: ErrorDetails = {
        toolName: this.name,
        errorType: 'ValidationError'
      };
      throw new ToolExecutionError('Tool name is required', details);
    }

    return this.executeTool(toolName, toolArgs);
  }

  // Alias for registerTool to maintain compatibility with both APIs
  add(nameOrTool: string | Tool, tool?: Tool): this {
    return this.registerTool(nameOrTool, tool);
  }
}
