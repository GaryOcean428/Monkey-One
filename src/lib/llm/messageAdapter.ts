import type { Message as AppMessage } from '../../types'
import type { Message as LLMMessage } from './providers'
import { v4 as uuidv4 } from 'uuid'

export function adaptToLLMMessage(message: AppMessage): LLMMessage {
  return {
    role: message.role === 'user' || message.role === 'assistant' ? message.role : 'user', // Default to user if role is undefined or not valid
    content: message.content,
  }
}

export function adaptToAppMessage(message: LLMMessage): AppMessage {
  return {
    id: uuidv4(),
    type: message.role === 'user' ? 'USER' : 'RESPONSE',
    content: message.content,
    role: message.role,
    timestamp: Date.now(),
  }
}

export function adaptMessagesForLLM(messages: AppMessage[]): LLMMessage[] {
  return messages.map(adaptToLLMMessage)
}
