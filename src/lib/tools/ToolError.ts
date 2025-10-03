export class ToolError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: Record<string, unknown>,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ToolError'
    Object.setPrototypeOf(this, ToolError.prototype)
  }
}

export class ToolExecutionError extends ToolError {
  constructor(
    message: string,
    public metadata: {
      toolName: string
      parameterName?: string
      expectedType?: string
      actualType?: string
      errorType: string
    }
  ) {
    super(message, 'EXECUTION_ERROR', metadata)
    this.name = 'ToolExecutionError'
    Object.setPrototypeOf(this, ToolExecutionError.prototype)
  }
}

export class ToolTimeoutError extends ToolError {
  constructor(toolName: string, timeout: number) {
    super(`Tool execution timed out after ${timeout}ms`, 'TIMEOUT_ERROR', { toolName, timeout })
    this.name = 'ToolTimeoutError'
    Object.setPrototypeOf(this, ToolTimeoutError.prototype)
  }
}
