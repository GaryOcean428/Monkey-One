import type { Message } from '../types';
import { MessageType } from '../types';

type Constructor<T> = {
    new (content?: string): T;
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
    type: MessageType.TASK;
    content: string;
}

export interface MessageContext {
    timestamp?: number;
    metadata?: Record<string, unknown>;
}
