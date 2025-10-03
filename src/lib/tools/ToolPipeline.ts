import { Tool, ToolResult } from '../../types'

export class ToolPipeline {
  private tools: Map<string, Tool> = new Map()
  private timeoutMs = 5000

  registerTool(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} already registered`)
    }
    if (!tool.name || !tool.execute) {
      throw new Error('Invalid tool definition')
    }
    this.tools.set(tool.name, tool)
  }

  unregisterTool(name: string): void {
    if (!this.tools.has(name)) {
      throw new Error(`Tool ${name} not registered`)
    }
    this.tools.delete(name)
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool ${name} not found`)
    }

    try {
      const result = await Promise.race([
        tool.execute(args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Tool ${name} execution timed out`)), this.timeoutMs)
        ),
      ])

      return {
        status: 'success',
        result,
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys())
  }
}
