import type { Tool } from '../types';
import { memoryManager } from './memory';

class ToolManager {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  async execute(name: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found`);
    }
    return tool.execute(args);
  }
}

const toolManager = new ToolManager();

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

toolManager.register({
  name: 'executeCode',
  description: 'Execute JavaScript code safely',
  execute: async ({ code }) => {
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }
    
    // Create a safe execution environment
    const sandbox = {
      console: {
        log: (...args: unknown[]) => args.join(' '),
        error: (...args: unknown[]) => args.join(' ')
      }
    };

    try {
      const fn = new Function('sandbox', `with (sandbox) { ${code} }`);
      return fn(sandbox);
    } catch (error) {
      throw new Error(`Code execution failed: ${(error as Error).message}`);
    }
  }
});

export { toolManager as tools };