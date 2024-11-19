import type { Message } from '../types';

type Constructor<T> = {
    new (...args: unknown[]): T;
    name: string;
};

export function MessageHandler(messageType: Constructor<Message>) {
    return function (
        _target: object,
        _propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(message: Message, ...args: unknown[]) {
            if (!(message instanceof messageType)) {
                throw new Error(`Invalid message type. Expected ${messageType.name}`);
            }
            return originalMethod.apply(this, [message, ...args]);
        };
        
        return descriptor;
    };
}

export interface TaskMessage extends Message {
    type: 'task';
    content: string;
}

export interface MessageContext {
    timestamp?: number;
    metadata?: Record<string, unknown>;
}