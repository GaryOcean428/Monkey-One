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
            throw new ToolExecutionError(`Invalid result type from tool ${tool.name}`, {
              toolName: tool.name,
              expectedType: handler.constructor.name,
              actualType: typeof result
            });
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
        if (!Array.isArray(result)) {
          throw new ToolExecutionError('Result must be an array', {
            toolName: tool.name,
            actualType: typeof result
          });
        }
        if (!result.every(elementValidator)) {
          throw new ToolExecutionError('Array must contain only numbers', {
            toolName: tool.name,
            invalidElements: result.filter(x => !elementValidator(x))
          });
        }
        return true;
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
          throw new ToolExecutionError('Result must be an object', {
            toolName: tool.name,
            actualType: typeof result
          });
        }

        const validators = Object.entries(validator) as Array<[
          keyof T,
          (value: unknown) => boolean
        ]>;

        const invalidProps = validators.filter(([key, validateFn]) => {
          const value = (result as Record<keyof T, unknown>)[key];
          return !validateFn(value);
        });

        if (invalidProps.length > 0) {
          throw new ToolExecutionError('Invalid object properties', {
            toolName: tool.name,
            invalidProperties: invalidProps.map(([key]) => key)
          });
        }

        return true;
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

          throw new ToolExecutionError(message, {
            toolName: tool.name,
            originalError: message
          });
        }
      }
    };
  }
}
