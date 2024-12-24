import { Tool, ToolResult } from '../../types';
import { ToolError, ToolTimeoutError } from './ToolError';

class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new ToolError(`Tool "${tool.name}" is already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  async executeTool(
    name: string, 
    args: Record<string, unknown>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new ToolError(`Tool "${name}" not found`);
    }

    try {
      const result = await Promise.race([
        tool.execute(args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new ToolTimeoutError(name, timeout)), timeout)
        )
      ]);

      return {
        status: 'success',
        result
      };
    } catch (error) {
      if (error instanceof ToolError) {
        throw error;
      }
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getAvailableTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  getToolByName(name: string): Tool | undefined {
    return this.tools.get(name);
  }
}

// Create and export a singleton instance
export const toolManager = new ToolManager();

// Also export the class for testing purposes
export { ToolManager };