import type { Tool } from '../../types';
import { WebAutomationTool } from './WebAutomationTool';
import { DataProcessingTool } from './DataProcessingTool';
import { APIIntegrationTool } from './APIIntegrationTool';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private customTools: Map<string, Tool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    const defaultTools: Tool[] = [
      new WebAutomationTool(),
      new DataProcessingTool(),
      new APIIntegrationTool()
    ];

    for (const tool of defaultTools) {
      this.tools.set(tool.name, tool);
    }
  }

  registerCustomTool(tool: Tool): void {
    this.customTools.set(tool.name, tool);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    // First check custom tools
    const customTool = this.customTools.get(name);
    if (customTool) {
      return customTool.execute(args);
    }

    // Then check default tools
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found`);
    }

    return tool.execute(args);
  }

  getAvailableTools(): Tool[] {
    return [
      ...Array.from(this.tools.values()),
      ...Array.from(this.customTools.values())
    ];
  }

  getToolByName(name: string): Tool | undefined {
    return this.customTools.get(name) || this.tools.get(name);
  }
}

export const toolRegistry = new ToolRegistry();