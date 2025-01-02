declare module '../tools/CalculatorTool' {
  export class CalculatorTool {
    schema: { name: string }
  }
}

declare module '../monitoring/ToolMonitor' {
  export interface ToolExecutionLog {
    toolName: string
    timestamp: number
    args: Record<string, unknown>
    result: unknown
  }

  export class ToolMonitor {
    logExecution(
      tool: { schema: { name: string } },
      args: Record<string, unknown>,
      result: unknown
    ): void
  }
}

declare module './ToolAgent' {
  export interface ToolCall {
    toolName: string
    args: Record<string, unknown>
  }

  export class ToolAgent {
    tools: Array<{ schema: { name: string } }>
    handleToolCall(call: ToolCall): Promise<unknown>
  }
}

declare module '../patterns/AgentMixture' {
  export class AgentMixture {
    constructor(config: {
      agents: Array<{ schema: { name: string } }>
      aggregator: (results: Array<unknown>) => unknown
    })
  }
}

declare module '../patterns/DebateCoordinator' {
  export class DebateCoordinator {
    constructor(
      config: {
        agents: Array<{ schema: { name: string } }>
        moderator: { schema: { name: string } }
        config: { maxRounds: number }
      },
      aggregator: (results: Array<unknown>) => unknown,
      options: { timeout: number }
    )
  }
}
