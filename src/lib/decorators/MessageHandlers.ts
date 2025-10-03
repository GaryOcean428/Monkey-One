import { Message } from '../../types'

export function MessageHandler(messageType: typeof Message) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Register the handler with the AgentRuntime or MessageRouter
    // ...existing code...
  }
}

export class TaskMessage extends Message {
  // ...additional typing...
}

export class MessageContext {
  // ...context properties...
}
