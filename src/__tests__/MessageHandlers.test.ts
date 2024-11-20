import { MessageHandler } from '../decorators/MessageHandlers';
import type { Message } from '../types';

// Create a concrete Message implementation
class TestMessage implements Message {
    id: string;
    type: 'command' | 'response' | 'error';
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: {
        agentId?: string;
        agentName?: string;
        status?: 'completed' | 'failed';
    };

    constructor(content: string = '') {
        this.id = `test-${Date.now()}`;
        this.type = 'command';
        this.role = 'user';
        this.content = content;
        this.timestamp = Date.now();
    }
}

class TestHandler {
    @MessageHandler(TestMessage)
    async handle(message: Message): Promise<string> {
        return message.content;
    }
}

describe('MessageHandler Decorator', () => {
    let handler: TestHandler;

    beforeEach(() => {
        handler = new TestHandler();
    });

    it('should handle messages of the correct type', async () => {
        const message = new TestMessage('test message');
        const result = await handler.handle(message);
        expect(result).toBe('test message');
    });

    it('should throw error for invalid message type', async () => {
        const invalidMessage = {
            id: 'test',
            role: 'user' as const,
            content: 'invalid',
            timestamp: Date.now()
        };
        await expect(async () => {
            await handler.handle(invalidMessage as Message);
        }).rejects.toThrow('Invalid message type');
    });
});
