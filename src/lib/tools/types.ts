export interface ToolArgs {
  [key: string]: unknown
}

export interface Tool {
  name: string
  description: string
  execute(args: ToolArgs): Promise<unknown>
}

// Add specific tool arg types
export interface APIToolArgs extends ToolArgs {
  endpoint: string
  method: string
  headers?: Record<string, string>
  body?: unknown
  auth?: {
    type: 'basic' | 'bearer' | 'oauth2'
    credentials: Record<string, string>
  }
}

export interface WebAutomationArgs extends ToolArgs {
  action: 'login' | 'fillForm' | 'extract'
  url: string
  data: Record<string, string>
  selectors?: Record<string, string>
}

export interface DataProcessingArgs extends ToolArgs {
  action: 'filter' | 'transform' | 'validate'
  data: unknown
  config: Record<string, unknown>
}
