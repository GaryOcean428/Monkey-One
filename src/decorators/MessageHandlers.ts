import type { Message } from '../types';
import { MessageType } from '../types';

type Constructor<T> = {
    new (content?: string): T;
    name: string;
};

export function MessageHandler(messageType: Constructor<Message>) {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): PropertyDescriptor {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(message: Message, ...args: unknown[]) {
            if (!message || !(message instanceof messageType)) {
                throw new Error(`Invalid message type. Expected ${messageType.name}`);
            }
            return await originalMethod.call(this, message, ...args);
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
