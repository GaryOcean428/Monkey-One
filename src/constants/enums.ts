export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel]

// Re-export the primary enums from core types to avoid conflicts
export { AgentStatus, MessageType } from '../lib/types/core'
