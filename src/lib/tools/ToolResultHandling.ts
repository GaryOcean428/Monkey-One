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
        try {
          const result = await tool.execute(args);
          
          if (!handler.validate(result)) {
            throw new Error(`Invalid result type from tool ${tool.name}`);
          }

          return handler.transform ? handler.transform(result) : result;
        } catch (error) {
          if (error instanceof Error) {
            throw new ToolExecutionError(error.message, {
              toolName: tool.name,
              error: error.message
            });
          }
          throw error;
        }
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

  static withObjectResult<T extends object>(
    tool: Tool,
    validator: Record<keyof T, (value: unknown) => boolean>
  ): Tool {
    return this.withResultValidation(tool, {
      validate: (result): result is T => {
        if (typeof result !== 'object' || result === null) {
          return false;
        }

        return Object.entries(validator).every(([key, validateFn]) => {
          return validateFn((result as any)[key]);
        });
      }
    });
  }

  static withAsyncTransformation<T>(
    tool: Tool,
    transform: (result: unknown) => Promise<T>
  ): Tool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (args: Record<string, unknown>) => {
        try {
          const result = await tool.execute(args);
          return await transform(result);
        } catch (error) {
          if (error instanceof Error) {
            throw new ToolExecutionError('Transform error: ' + error.message, {
              toolName: tool.name,
              error: error.message
            });
          }
          throw error;
        }
      }
    };
  }

  static withErrorMapping(
    tool: Tool,
    errorMap: Record<string, string | RegExp>
  ): Tool {
    return {
      name: tool.name,
      description: tool.description,
      execute: async (args: Record<string, unknown>) => {
        try {
          return await tool.execute(args);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          
          for (const [pattern, replacement] of Object.entries(errorMap)) {
            if (typeof replacement === 'string' && message.includes(pattern)) {
              throw new ToolExecutionError(replacement, {
                toolName: tool.name,
                originalError: message
              });
            } else if (replacement instanceof RegExp && replacement.test(message)) {
              throw new ToolExecutionError('Please try again later', {
                toolName: tool.name,
                originalError: message
              });
            }
          }
          
          throw new ToolExecutionError('UNKNOWN_ERROR', {
            toolName: tool.name,
            originalError: message
          });
        }
      }
    };
  }
}
