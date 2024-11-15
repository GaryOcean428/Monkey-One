import { Message, MessageType } from '@/types'
import { RuntimeError } from '../errors/AgentErrors'

export interface HandlerMetadata {
  type: MessageType
  method: string
  priority?: number
  validation?: (message: Message) => boolean | Promise<boolean>
  errorHandler?: (error: Error, message: Message) => void | Promise<void>
}

const HANDLER_METADATA_KEY = Symbol('messageHandlers')

export function MessageHandler(
  type: MessageType,
  options: {
    priority?: number
    validation?: (message: Message) => boolean | Promise<boolean>
    errorHandler?: (error: Error, message: Message) => void | Promise<void>
  } = {}
): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    if (typeof propertyKey !== 'string') {
      throw new RuntimeError(
        'MessageHandler decorator can only be applied to methods with string keys',
        { propertyKey }
      )
    }

    const existingHandlers: HandlerMetadata[] = Reflect.getMetadata(
      HANDLER_METADATA_KEY,
      target.constructor
    ) || []

    const newHandler: HandlerMetadata = {
      type,
      method: propertyKey,
      priority: options.priority ?? 0,
      validation: options.validation,
      errorHandler: options.errorHandler
    }

    // Check for duplicate handlers
    const duplicateHandler = existingHandlers.find(h => 
      h.type === type && h.method === propertyKey
    )
    if (duplicateHandler) {
      throw new RuntimeError(
        'Duplicate message handler registration',
        { type, method: propertyKey }
      )
    }

    // Add new handler and sort by priority
    existingHandlers.push(newHandler)
    existingHandlers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    Reflect.defineMetadata(
      HANDLER_METADATA_KEY,
      existingHandlers,
      target.constructor
    )

    // Wrap original method with validation and error handling
    const originalMethod = descriptor.value
    descriptor.value = async function(message: Message, ...args: unknown[]) {
      try {
        if (newHandler.validation) {
          const isValid = await newHandler.validation(message)
          if (!isValid) {
            throw new RuntimeError(
              'Message validation failed',
              { type, message }
            )
          }
        }

        return await originalMethod.call(this, message, ...args)
      } catch (error) {
        if (newHandler.errorHandler) {
          await newHandler.errorHandler(error as Error, message)
        }
        throw error
      }
    }

    return descriptor
  }
}

export function getMessageHandlers(target: Object): HandlerMetadata[] {
  return Reflect.getMetadata(HANDLER_METADATA_KEY, target) || []
}

export async function dispatchMessage(
  target: Object,
  message: Message,
  context?: unknown
): Promise<void> {
  const handlers = getMessageHandlers(target.constructor)
  const matchingHandlers = handlers.filter(h => h.type === message.type)

  if (!matchingHandlers.length) {
    throw new RuntimeError(
      'No handler found for message type',
      { type: message.type }
    )
  }

  for (const handler of matchingHandlers) {
    const method = (target as any)[handler.method]
    if (!method) {
      throw new RuntimeError(
        'Handler method not found',
        { method: handler.method }
      )
    }

    try {
      await method.call(target, message, context)
    } catch (error) {
      if (handler.errorHandler) {
        await handler.errorHandler(error as Error, message)
      } else {
        throw error
      }
    }
  }
}

export function clearMessageHandlers(target: Object): void {
  Reflect.deleteMetadata(HANDLER_METADATA_KEY, target)
}

// Helper decorators for common message types
export function CommandHandler(options: Omit<HandlerMetadata, 'type' | 'method'> = {}) {
  return MessageHandler(MessageType.COMMAND, options)
}

export function ResponseHandler(options: Omit<HandlerMetadata, 'type' | 'method'> = {}) {
  return MessageHandler(MessageType.RESPONSE, options)
}

export function ErrorHandler(options: Omit<HandlerMetadata, 'type' | 'method'> = {}) {
  return MessageHandler(MessageType.ERROR, options)
}

export function StatusHandler(options: Omit<HandlerMetadata, 'type' | 'method'> = {}) {
  return MessageHandler(MessageType.STATUS, options)
}

export function TaskHandler(options: Omit<HandlerMetadata, 'type' | 'method'> = {}) {
  return MessageHandler(MessageType.TASK, options)
}

// Utility decorator for handling multiple message types
export function MultiMessageHandler(
  types: MessageType[],
  options: Omit<HandlerMetadata, 'type' | 'method'> = {}
): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    types.forEach(type => {
      MessageHandler(type, options)(target, propertyKey, descriptor)
    })
    return descriptor
  }
}

// Decorator for prioritized message handling
export function PriorityHandler(
  type: MessageType,
  priority: number,
  options: Omit<HandlerMetadata, 'type' | 'method' | 'priority'> = {}
): MethodDecorator {
  return MessageHandler(type, { ...options, priority })
}

// Decorator for validated message handling
export function ValidatedHandler(
  type: MessageType,
  validation: (message: Message) => boolean | Promise<boolean>,
  options: Omit<HandlerMetadata, 'type' | 'method' | 'validation'> = {}
): MethodDecorator {
  return MessageHandler(type, { ...options, validation })
}

// Decorator for error-handled message handling
export function SafeHandler(
  type: MessageType,
  errorHandler: (error: Error, message: Message) => void | Promise<void>,
  options: Omit<HandlerMetadata, 'type' | 'method' | 'errorHandler'> = {}
): MethodDecorator {
  return MessageHandler(type, { ...options, errorHandler })
}
