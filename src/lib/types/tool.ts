export interface ToolEvent {
  type: string
  payload: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface ToolResponse {
  status: 'success' | 'error'
  data: Record<string, unknown>
  error?: string
  metadata?: Record<string, unknown>
}
