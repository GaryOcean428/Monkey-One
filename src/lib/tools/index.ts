import { Tool } from '../../types';
import { ToolExecutionError } from '../errors/AgentErrors';
import { FunctionTool } from './FunctionTool';
import { CalculatorTool } from './CalculatorTool';
import { ToolPipeline } from './ToolPipeline';
import { ToolResultHandling } from './ToolResultHandling';
import { BrowserTool } from './web/BrowserTool';
import { HTTPTool } from './web/HTTPTool';

/**
 * Core tool utilities for creating and managing tools
 */
export { FunctionTool } from './FunctionTool';
export { CalculatorTool } from './CalculatorTool';
export { ToolPipeline } from './ToolPipeline';
export { ToolResultHandling } from './ToolResultHandling';

/**
 * Web-related tools for browser automation and HTTP requests
 */
export { BrowserTool } from './web/BrowserTool';
export { HTTPTool } from './web/HTTPTool';

/**
 * Pre-configured tool instances for common use cases
 */
export const tools = {
  // Core tools
  calculator: CalculatorTool.create(),

  // Web tools
  browser: BrowserTool.create(),
  http: HTTPTool.create(),
} as const;

/**
 * Tool factory functions for creating customized tool instances
 */
export const toolFactories = {
  // Core tools
  calculator: CalculatorTool.create,

  // Web tools
  browser: BrowserTool.create,
  http: HTTPTool.create,
} as const;

/**
 * Common tool pipelines for typical use cases
 */
export const pipelines = {
  // Web interaction pipeline combining browser and HTTP tools
  web: new ToolPipeline()
    .add('browser', tools.browser)
    .add('http', tools.http),

  // Basic calculation pipeline
  calculation: new ToolPipeline()
    .add('calculator', tools.calculator),
} as const;

/**
 * Re-export tool types for convenience
 */
export type { Tool } from '../../types';

/**
 * Tool error types
 */
export { ToolExecutionError } from '../errors/AgentErrors';

/**
 * Tool categories for organization
 */
export const categories = {
  core: ['calculator'] as const,
  web: ['browser', 'http'] as const,
} as const;

/**
 * Tool metadata for discovery and documentation
 */
export const metadata = {
  calculator: {
    category: 'core',
    description: 'Performs basic arithmetic operations',
    examples: [
      { operation: 'add', a: 1, b: 2 },
      { operation: 'multiply', a: 3, b: 4 }
    ]
  },
  browser: {
    category: 'web',
    description: 'Controls a web browser for web interaction',
    examples: [
      { action: { type: 'launch', url: 'https://example.com' } },
      { action: { type: 'click', selector: '#button' } }
    ]
  },
  http: {
    category: 'web',
    description: 'Makes HTTP requests to web APIs',
    examples: [
      { request: { method: 'GET', url: 'https://api.example.com' } },
      { request: { method: 'POST', url: 'https://api.example.com', body: { data: 'test' } } }
    ]
  }
} as const;
