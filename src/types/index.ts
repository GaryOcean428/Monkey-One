// Re-export core enums and types
export { MessageType, AgentType, AgentStatus } from '../lib/types/core'

// Re-export core Message type as SystemMessage to avoid conflicts
export type { Message as SystemMessage } from '../lib/types/core'

export type {
  Agent,
  AgentCapabilityType as AgentCapability,
  AgentCapabilityType,
} from '../lib/types/core'

// Export UI-specific message types
export type { ChatMessage, Message, MessageThread } from './message'

// Export additional types
export type { Task, Action, Integration } from './chat'
export type { Settings } from './settings'
export { BaseAgent } from './base'
export { OrchestratorAgent } from './orchestrator'
export { WebSurferAgent } from './web-surfer'
export { FileSurferAgent } from './file-surfer'
export { CoderAgent } from './coder'
