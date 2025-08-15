import { MessageHandler } from '../lib/decorators/MessageHandler';
import type { Message } from '../types';
import { MessageType } from '../types';
import { describe, it, expect, beforeEach } from 'vitest';

// Create concrete Message class for testing
class TestMessage implements Message {
    id: string;
    type: MessageType;
    content: string;
    timestamp: number;
    sender?: string;
    recipient?: string;
    role?: string;

    constructor(content: string = '') {
        this.id = `test-${Date.now()}`;
        this.type = MessageType.COMMAND;
        this.content = content;
        this.timestamp = Date.now();
    }
}

// Test handler class using the decorator
class TestMessageHandler {
    lastMessage?: Message;

    @MessageHandler(MessageType.COMMAND)
    async handleMessage(message: Message): Promise<string> {
        this.lastMessage = message;
        return `Processed: ${message.content}`;
    }
}

describe('MessageHandler Decorator', () => {
    let handler: TestMessageHandler;

    beforeEach(() => {
        handler = new TestMessageHandler();
    });

    it('should successfully process valid message type', async () => {
        const message = new TestMessage('test content');
        const result = await handler.handleMessage(message);
        expect(result).toBe('Processed: test content');
        expect(handler.lastMessage).toBe(message);
    });

    it('should reject invalid message type', async () => {
        const invalidMessage = {
            id: 'test',
            type: MessageType.COMMAND,
            content: 'test',
            timestamp: Date.now()
        } as Message;

        await expect(handler.handleMessage(invalidMessage)).rejects.toThrow('Invalid message type');
    });
});
