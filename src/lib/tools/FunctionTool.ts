import { Tool, ToolArgs } from './types';
import { AgentExecutionError } from '../errors/AgentErrors';

type ToolFunction = (args: ToolArgs) => Promise<unknown>;

interface FunctionToolOptions {
  name: string;
  description: string;
  validate?: (args: ToolArgs) => void | Promise<void>;
  transform?: (result: unknown) => unknown;
}

export class FunctionTool implements Tool {
  readonly name: string;
  readonly description: string;
  private fn: ToolFunction;
  private validate?: (args: ToolArgs) => void | Promise<void>;
  private transform?: (result: unknown) => unknown;

  constructor(fn: ToolFunction, options: FunctionToolOptions) {
    this.name = options.name;
    this.description = options.description;
    this.fn = fn;
    this.validate = options.validate;
    this.transform = options.transform;
  }

  async execute(args: ToolArgs): Promise<unknown> {
    try {
      // Validate arguments if validator provided
      if (this.validate) {
        await this.validate(args);
      }

      // Execute function
      const result = await this.fn(args);
      
      // Return transformed result if transformer provided
      if (this.transform) {
        return this.transform(result);
      }
      return result;
    } catch (error) {
      throw new AgentExecutionError(
        `Error executing tool ${this.name}: ${error instanceof Error ? error.message : String(error)}`,
        {
          toolName: this.name,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      );
    }
  }

  static create(fn: ToolFunction, options: FunctionToolOptions): Tool {
    return new FunctionTool(fn, options);
  }

  // Helper method to create a tool from a synchronous function
  static fromSync(
    fn: (args: ToolArgs) => unknown,
    options: FunctionToolOptions
  ): Tool {
    return new FunctionTool(
      async (args) => fn(args),
      options
    );
  }

  // Helper method to create a tool with parameter validation
  static withValidation(
    fn: ToolFunction,
    options: FunctionToolOptions & {
      required?: string[];
      types?: Record<string, string>;
    }
  ): Tool {
    const validator = async (args: ToolArgs): Promise<void> => {
      // Check required parameters
      if (options.required) {
        for (const param of options.required) {
          if (!(param in args)) {
            throw new AgentExecutionError(
              `Missing required parameter: ${param}`,
              { 
                toolName: options.name,
                parameterName: param,
                errorType: 'ValidationError'
              }
            );
          }
        }
      }

      // Check parameter types
      if (options.types) {
        for (const [param, type] of Object.entries(options.types)) {
          if (param in args && typeof args[param] !== type) {
            throw new AgentExecutionError(
              `Invalid type for parameter ${param}: expected ${type}, got ${typeof args[param]}`,
              {
                toolName: options.name,
                parameterName: param,
                expectedType: type,
                actualType: typeof args[param],
                errorType: 'TypeError'
              }
            );
          }
        }
      }

      // Run custom validation if provided
      if (options.validate) {
        try {
          await options.validate(args);
        } catch (error) {
          throw new AgentExecutionError(
            `Validation error: ${error instanceof Error ? error.message : String(error)}`,
            {
              toolName: options.name,
              errorType: 'ValidationError',
              errorMessage: error instanceof Error ? error.message : String(error)
            }
          );
        }
      }
    };

    return new FunctionTool(fn, {
      ...options,
      validate: validator
    });
  }
} // Add missing closing brace for class
