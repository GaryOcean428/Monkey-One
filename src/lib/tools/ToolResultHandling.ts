import { Tool } from '../../types';
import { ToolExecutionError } from '../errors/AgentErrors';

interface ResultHandler<T> {
  validate(result: unknown): result is T;
  transform?(result: T): unknown;
}

export class ToolResultHandling {
  static withResultValidation<T>(
    tool: Tool,
    handler: ResultHandler<T>
  ): Tool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (args: Record<string, unknown>) => {
        const result = await tool.execute(args);
        
        if (!handler.validate(result)) {
          throw new ToolExecutionError(
            `Invalid result from tool ${tool.name}`,
            {
              toolName: tool.name,
              expectedType: handler.constructor.name,
              actualType: typeof result
            }
          );
        }

        return handler.transform ? handler.transform(result) : result;
      }
    };
  }

  static withNumberResult(tool: Tool): Tool {
    return this.withResultValidation(tool, {
      validate: (result): result is number => typeof result === 'number'
    });
  }

  static withStringResult(tool: Tool): Tool {
    return this.withResultValidation(tool, {
      validate: (result): result is string => typeof result === 'string'
    });
  }

  static withArrayResult<T>(
    tool: Tool,
    elementValidator: (element: unknown) => element is T
  ): Tool {
    return this.withResultValidation(tool, {
      validate: (result): result is T[] => {
        return Array.isArray(result) && result.every(elementValidator);
      }
    });
  }

  static withObjectResult<T extends Record<string, unknown>>(
    tool: Tool,
    shape: Record<keyof T, (value: unknown) => boolean>
  ): Tool {
    return this.withResultValidation(tool, {
      validate: (result): result is T => {
        if (typeof result !== 'object' || result === null) {
          return false;
        }

        return Object.entries(shape).every(([key, validator]) => {
          return key in result && validator((result as Record<string, unknown>)[key]);
        });
      }
    });
  }

  static withAsyncTransform<T>(
    tool: Tool,
    transform: (result: T) => Promise<unknown>
  ): Tool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (args: Record<string, unknown>) => {
        try {
          const result = await tool.execute(args);
          return await transform(result as T);
        } catch (error) {
          throw new ToolExecutionError(
            `Error in async transform: ${error instanceof Error ? error.message : String(error)}`,
            {
              toolName: tool.name,
              errorType: 'TransformError',
              errorMessage: error instanceof Error ? error.message : String(error)
            }
          );
        }
      }
    };
  }

  static withErrorMapping(
    tool: Tool,
    errorMap: Record<string, string>
  ): Tool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (args: Record<string, unknown>) => {
        try {
          return await tool.execute(args);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const mappedMessage = Object.entries(errorMap).find(
            ([pattern]) => new RegExp(pattern).test(message)
          )?.[1] || message;

          throw new ToolExecutionError(
            mappedMessage,
            {
              toolName: tool.name,
              originalError: message,
              errorType: 'MappedError'
            }
          );
        }
      }
    };
  }
}
