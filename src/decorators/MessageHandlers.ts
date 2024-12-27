import type { Message } from '../types';
import { MessageType } from '../types';

type Constructor<T> = {
    new (content?: string): T;
    name: string;
};

export function MessageHandler(messageType: Constructor<Message>) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        
        if (!originalMethod) {
            throw new Error('MessageHandler decorator can only be used on methods');
        }
        
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
