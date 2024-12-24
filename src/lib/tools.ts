import type { Tool, ToolSpec } from '../types';
import { memoryManager } from './memory';
import { defaultModel, generateText } from './models';

interface ToolValidation {
  parameters: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  returns: {
    type: string;
    description: string;
  };
}

class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private toolSpecs: Map<string, ToolSpec> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found`);
    }

    // Validate arguments against tool spec
    const spec = this.toolSpecs.get(name);
    if (spec) {
      this.validateArgs(args, spec.validation);
    }

    return tool.execute(args);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async generateTool(spec: ToolSpec): Promise<Tool> {
    try {
      // Validate the tool specification
      this.validateToolSpec(spec);

      // Generate the tool implementation using the default model
      const implementation = await this.generateImplementation(spec);

      // Create and register the tool
      const tool: Tool = {
        name: spec.name,
        description: spec.description,
        execute: implementation,
      };

      this.register(tool);
      this.toolSpecs.set(spec.name, spec);

      return tool;
    } catch (error) {
      throw new Error(`Failed to generate tool: ${error.message}`);
    }
  }

  private validateToolSpec(spec: ToolSpec): void {
    if (!spec.name || typeof spec.name !== 'string') {
      throw new Error('Tool spec must have a valid name');
    }
    if (!spec.description || typeof spec.description !== 'string') {
      throw new Error('Tool spec must have a valid description');
    }
    if (!spec.validation || typeof spec.validation !== 'object') {
      throw new Error('Tool spec must have valid validation rules');
    }
  }

  private validateArgs(args: Record<string, unknown>, validation: ToolValidation): void {
    for (const [name, rule] of Object.entries(validation.parameters)) {
      if (rule.required && !(name in args)) {
        throw new Error(`Missing required parameter: ${name}`);
      }
      if (name in args) {
        const value = args[name];
        if (!this.validateType(value, rule.type)) {
          throw new Error(`Invalid type for parameter ${name}: expected ${rule.type}`);
        }
      }
    }
  }

  private validateType(value: unknown, type: string): boolean {
    switch (type.toLowerCase()) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Allow unknown types
    }
  }

  private async generateImplementation(spec: ToolSpec): Promise<(args: Record<string, unknown>) => Promise<unknown>> {
    const prompt = `
Generate a JavaScript async function implementation for a tool with the following specification:

Name: ${spec.name}
Description: ${spec.description}
Parameters: ${JSON.stringify(spec.validation.parameters, null, 2)}
Returns: ${JSON.stringify(spec.validation.returns, null, 2)}

Requirements:
1. The function should be async and accept a single object parameter containing the tool arguments
2. It should validate all inputs according to the parameter specifications
3. It should handle errors appropriately
4. It should return data matching the specified return type
5. It should be secure and not execute any dangerous operations

Please provide only the function implementation without any wrapper code.
`;

    const implementation = await generateText(defaultModel, prompt);
    
    // Create a safe function from the generated code
    try {
      // eslint-disable-next-line no-new-func
      return new Function('args', `return (async () => { ${implementation} })(args)`) as (args: Record<string, unknown>) => Promise<unknown>;
    } catch (error) {
      throw new Error(`Failed to create function from generated code: ${error.message}`);
    }
  }
}

export const toolManager = new ToolManager();

// Register default tools
toolManager.register({
  name: 'searchMemory',
  description: 'Search through agent memory',
  execute: async ({ query }) => {
    if (typeof query !== 'string') {
      throw new Error('Query must be a string');
    }
    return memoryManager.search(query);
  }
});

// Register file system tools
toolManager.register({
  name: 'readFile',
  description: 'Read contents of a file',
  execute: async ({ path }) => {
    if (typeof path !== 'string') {
      throw new Error('Path must be a string');
    }
    const fs = await import('fs/promises');
    return fs.readFile(path, 'utf-8');
  }
});

toolManager.register({
  name: 'writeFile',
  description: 'Write contents to a file',
  execute: async ({ path, content }) => {
    if (typeof path !== 'string' || typeof content !== 'string') {
      throw new Error('Path and content must be strings');
    }
    const fs = await import('fs/promises');
    await fs.writeFile(path, content, 'utf-8');
    return true;
  }
});

// Register HTTP tools
toolManager.register({
  name: 'httpRequest',
  description: 'Make an HTTP request',
  execute: async ({ url, method = 'GET', headers = {}, body }) => {
    if (typeof url !== 'string') {
      throw new Error('URL must be a string');
    }
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  }
});

export type { Tool, ToolSpec, ToolValidation };