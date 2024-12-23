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

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async generateTool(spec: any): Promise<Tool> {
    // Implementation for tool generation
    throw new Error('Not implemented');
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

export type { Tool };