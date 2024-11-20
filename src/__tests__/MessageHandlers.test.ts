import { MessageHandler } from '../decorators/MessageHandlers';
import type { Message } from '../types';
import { MessageType } from '../types';

// Create a concrete Message implementation
class TestMessage implements Message {
    id: string;
    type: MessageType;
    content: string;
    sender?: string;
    recipient?: string;
    timestamp: number;
    status?: string;
    role?: string;

    constructor(content?: string) {
        this.id = `test-${Date.now()}`;
        this.type = MessageType.COMMAND;
        this.content = content || '';
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
            type: MessageType.COMMAND,
            role: 'user' as const,
            content: 'invalid',
            timestamp: Date.now()
        };
        await expect(async () => {
            await handler.handle(invalidMessage as Message);
        }).rejects.toThrow('Invalid message type');
    });
});
