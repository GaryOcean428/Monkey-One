import { FunctionTool } from './FunctionTool';
import { Tool } from '../../types';
import { ToolExecutionError } from '../errors/AgentErrors';
import { ToolResultHandling } from './ToolResultHandling';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power';

interface CalculatorArgs {
  operation: Operation;
  a: number;
  b: number;
}

interface CalculationResult extends Record<string, unknown> {
  operation: Operation;
  a: number;
  b: number;
  result: number;
  timestamp: string;
}

export class CalculatorTool {
  static create(): Tool {
    return ToolResultHandling.withObjectResult<CalculationResult>(
      FunctionTool.withValidation(
        async (args: Record<string, unknown>) => {
          // Type assertion after validation
          const params = args as unknown as CalculatorArgs;
          const { operation, a, b } = params;
          let result: number;
          
          try {
            switch (operation) {
              case 'add':
                result = a + b;
                break;
              case 'subtract':
                result = a - b;
                break;
              case 'multiply':
                result = a * b;
                break;
              case 'divide':
                if (b === 0) {
                  throw new Error('Division by zero');
                }
                result = a / b;
                break;
              case 'power':
                result = Math.pow(a, b);
                break;
              default:
                throw new Error(`Unknown operation: ${operation}`);
            }

            const calculationResult: CalculationResult = {
              operation,
              a,
              b,
              result,
              timestamp: new Date().toISOString()
            };

            return calculationResult;
          } catch (error) {
            throw new ToolExecutionError(
              `Calculation failed: ${error instanceof Error ? error.message : String(error)}`,
              {
                toolName: 'calculator',
                operation,
                values: { a, b },
                errorType: error instanceof Error ? error.constructor.name : typeof error
              }
            );
          }
        },
        {
          name: 'calculator',
          description: 'Performs basic arithmetic operations',
          required: ['operation', 'a', 'b'],
          validate: (args: Record<string, unknown>) => {
            const { operation, a, b } = args as Partial<CalculatorArgs>;
            
            if (!operation) {
              throw new Error('Operation is required');
            }

            const validOperations: Operation[] = ['add', 'subtract', 'multiply', 'divide', 'power'];
            if (!validOperations.includes(operation as Operation)) {
              throw new Error(`Invalid operation: ${operation}. Must be one of: ${validOperations.join(', ')}`);
            }

            if (typeof a !== 'number') {
              throw new Error('First operand must be a number');
            }

            if (typeof b !== 'number') {
              throw new Error('Second operand must be a number');
            }

            if (!Number.isFinite(a) || !Number.isFinite(b)) {
              throw new Error('Operands must be finite numbers');
            }
          }
        }
      ),
      {
        operation: (value): value is Operation => 
          typeof value === 'string' && 
          ['add', 'subtract', 'multiply', 'divide', 'power'].includes(value),
        a: (value): boolean => typeof value === 'number',
        b: (value): boolean => typeof value === 'number',
        result: (value): boolean => typeof value === 'number',
        timestamp: (value): boolean => typeof value === 'string'
      }
    );
  }
}
