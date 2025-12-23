// Chat-specific message type for UI components
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status: 'sending' | 'sent' | 'error'
  metadata?: Record<string, unknown>
}

// For backward compatibility, export as Message
export type Message = ChatMessage

export interface MessageThread {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}
