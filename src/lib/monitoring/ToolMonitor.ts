interface ToolExecution {
  tool: string
  args: Record<string, unknown>
  result: unknown
  timestamp: number
  duration: number
}

export class ToolMonitor {
  private executions: ToolExecution[] = []

  logExecution(tool: { name: string }, args: Record<string, unknown>, result: unknown) {
    this.executions.push({
      tool: tool.name,
      args,
      result,
      timestamp: Date.now(),
      duration: 0, // In a real implementation, we'd track actual duration
    })
  }

  getExecutions(): ToolExecution[] {
    return [...this.executions]
  }

  getToolStats(toolName: string) {
    const toolExecutions = this.executions.filter(e => e.tool === toolName)
    return {
      totalExecutions: toolExecutions.length,
      averageDuration:
        toolExecutions.reduce((acc, curr) => acc + curr.duration, 0) / toolExecutions.length,
      successRate:
        toolExecutions.filter(e => !('error' in e.result)).length / toolExecutions.length,
    }
  }

  clearHistory() {
    this.executions = []
  }
}
