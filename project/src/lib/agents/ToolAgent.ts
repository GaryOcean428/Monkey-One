import type { Tool } from '../../types';
import { ModelClient } from '../clients/ModelClient';

export class ToolAgent {
  constructor(
    public readonly tools: Tool[],
    private modelClient: ModelClient
  ) {}

  async handleToolCall(call: { toolName: string; args: Record<string, unknown> }) {
    const tool = this.tools.find(t => t.name === call.toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${call.toolName}`);
    }

    try {
      const result = await tool.execute(call.args);
      return {
        status: 'success',
        result
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getToolByName(name: string): Tool | undefined {
    return this.tools.find(t => t.name === name);
  }

  getAllTools(): Tool[] {
    return [...this.tools];
  }
}