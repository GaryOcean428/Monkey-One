export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export const AgentStatus = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
  ERROR: 'error'
} as const;

export type AgentStatus = typeof AgentStatus[keyof typeof AgentStatus];

export const MessageType = {
  TASK: 'task',
  RESPONSE: 'response',
  ERROR: 'error',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
