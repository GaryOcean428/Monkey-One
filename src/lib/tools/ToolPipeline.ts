import type { Tool } from '../../types';

export interface ToolOptions {
  timeout: number;
  rateLimit?: number;
  cache?: boolean;
  dependencies?: string[];
  retries?: number;
}

export class ToolPipeline {
  private tools: Tool[] = [];

  registerTool(tool: Tool, options: ToolOptions) {
    // Check for duplicate tools
    if (!this.tools.some(existingTool => existingTool.name === tool.name)) {
      this.tools.push(tool);
    }
  }

  unregisterTool(toolName: string) {
    this.tools = this.tools.filter(tool => tool.name !== toolName);
  }

  async executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.find(t => t.name === toolName);
    
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    return tool.execute(args);
  }

  getRegisteredTools(): Tool[] {
    return [...this.tools];
  }
}
