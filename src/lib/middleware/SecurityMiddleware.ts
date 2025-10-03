import type { Message } from '../types/core'

export class SecurityMiddleware {
  private allowedRoles: string[] = ['user', 'assistant', 'system']
  private maxMessageLength: number = 10000

  validateMessage(message: Message): boolean {
    // Check role
    if (!this.allowedRoles.includes(message.role)) {
      console.warn(`Invalid message role: ${message.role}`)
      return false
    }

    // Check message length
    if (message.content.length > this.maxMessageLength) {
      console.warn(`Message exceeds maximum length of ${this.maxMessageLength}`)
      return false
    }

    // Additional security checks can be added here
    return true
  }

  sanitizeMessage(message: Message): Message {
    // Implement message sanitization
    return {
      ...message,
      content: this.sanitizeText(message.content),
    }
  }

  private sanitizeText(text: string): string {
    // Basic sanitization: remove potentially harmful scripts or HTML
    return text
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onerror=/gi, '')
  }
}
