export interface MessagePayload {
  type: string
  content: unknown
  metadata?: Record<string, unknown>
}

export interface MessageResponse {
  status: 'success' | 'error'
  data: unknown
  error?: string
  metadata?: Record<string, unknown>
}
