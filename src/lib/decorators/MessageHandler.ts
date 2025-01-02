import 'reflect-metadata'
import { MessageType } from '../../types'

const MESSAGE_HANDLERS_KEY = Symbol('messageHandlers')

export interface MessageHandlerMetadata extends Record<string, unknown> {
  messageType: MessageType
  methodName: string | symbol
  target: object
}

export function MessageHandler(messageType: MessageType): MethodDecorator {
  return function (
    target: Record<string, unknown>,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<unknown>
  ): TypedPropertyDescriptor<unknown> {
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
      target: target,
    }

    const handlers = [...existingHandlers, newHandler]

    // Store on constructor to support inheritance
    Reflect.defineMetadata(MESSAGE_HANDLERS_KEY, handlers, target.constructor)

    // Create new descriptor if none exists
    if (!descriptor) {
      descriptor = {
        configurable: true,
        enumerable: false,
        writable: true,
        value: target[propertyKey as keyof typeof target],
      }
    }

    // Store original method
    const originalMethod = descriptor.value

    // Create new method that binds this context
    descriptor.value = function (...args: unknown[]) {
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

export function getMessageHandlers(target: object): MessageHandlerMetadata[] {
  // Get handlers from prototype chain
  const prototype = Object.getPrototypeOf(target)
  const inheritedHandlers = prototype ? getMessageHandlers(prototype) : []

  // Get handlers defined on this class
  const ownHandlers = Reflect.getMetadata(MESSAGE_HANDLERS_KEY, target.constructor) || []

  // Combine and deduplicate handlers
  const allHandlers = [...inheritedHandlers, ...ownHandlers]
  const uniqueHandlers = allHandlers.filter(
    (handler, index, self) => index === self.findIndex(h => h.messageType === handler.messageType)
  )

  return uniqueHandlers
}

export function hasMessageHandler(target: object, messageType: MessageType): boolean {
  return getMessageHandlers(target).some(handler => handler.messageType === messageType)
}

export function getMessageHandler(
  target: object,
  messageType: MessageType
): MessageHandlerMetadata | undefined {
  return getMessageHandlers(target).find(handler => handler.messageType === messageType)
}
