import 'reflect-metadata'
import { MessageType } from '../../types'

const MESSAGE_HANDLERS_KEY = Symbol('messageHandlers')

export interface MessageHandlerMetadata {
  messageType: MessageType
  methodName: string | symbol
  target: object
}

export function MessageHandler(messageType: MessageType): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    // Validate message type
    if (!messageType || typeof messageType !== 'string') {
      throw new Error('Invalid message type')
    }

    // Get existing handlers or create new array
    const existingHandlers: MessageHandlerMetadata[] =
      Reflect.getMetadata(MESSAGE_HANDLERS_KEY, target.constructor) || []

    // Check for duplicate handlers
    const isDuplicate = existingHandlers.some(handler => handler.messageType === messageType)
    if (isDuplicate) {
      throw new Error(`Duplicate handler for message type: ${messageType}`)
    }

    // Add new handler
    const newHandler: MessageHandlerMetadata = {
      messageType,
      methodName: propertyKey,
      target,
    }

    const handlers = [...existingHandlers, newHandler]

    // Store on constructor to support inheritance
    Reflect.defineMetadata(MESSAGE_HANDLERS_KEY, handlers, target.constructor)

    return descriptor
  }
}

export function getMessageHandlers(target: object): MessageHandlerMetadata[] {
  // Get handlers from prototype chain
  const prototype = Object.getPrototypeOf(target)
  const inheritedHandlers = prototype ? getMessageHandlers(prototype) : []

  // Get handlers from current target
  const handlers: MessageHandlerMetadata[] = Reflect.getMetadata(MESSAGE_HANDLERS_KEY, target) || []

  // Combine and deduplicate handlers
  return [...new Set([...inheritedHandlers, ...handlers])]
}

export function hasMessageHandler(target: object, messageType: MessageType): boolean {
  return getMessageHandlers(target).some(handler => handler.messageType === messageType)
}

export function findMessageHandler(
  target: object,
  messageType: MessageType
): MessageHandlerMetadata | undefined {
  return getMessageHandlers(target).find(handler => handler.messageType === messageType)
}
