import type { Tool } from '../../types';

export class CalculatorTool implements Tool {
  name = 'calculator';
  description = 'Performs basic mathematical calculations';

  async execute(args: Record<string, unknown>): Promise<number> {
    const { operation, numbers } = args;

    if (!Array.isArray(numbers) || numbers.length < 2) {
      throw new Error('Calculator requires at least two numbers');
    }

    switch (operation) {
      case 'add':
        return numbers.reduce((a, b) => Number(a) + Number(b), 0);
      case 'subtract':
        return numbers.reduce((a, b) => Number(a) - Number(b));
      case 'multiply':
        return numbers.reduce((a, b) => Number(a) * Number(b), 1);
      case 'divide':
        if (numbers.includes(0)) {
          throw new Error('Division by zero is not allowed');
        }
        return numbers.reduce((a, b) => Number(a) / Number(b));
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}