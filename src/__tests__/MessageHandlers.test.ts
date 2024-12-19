import { MessageHandler } from '../decorators/MessageHandlers';
import type { Message } from '../types';
import { MessageType } from '../types';

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
    @MessageHandler(TestMessage)
    async handleMessage(message: Message): Promise<string> {
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
    });

    it('should reject invalid message type', async () => {
        const invalidMessage = {
            id: 'test',
            type: MessageType.COMMAND,
            content: 'test',
            timestamp: Date.now()
        };

        await expect(async () => {
            await handler.handleMessage(invalidMessage as Message);
        }).rejects.toThrow('Invalid message type');
    });

    it('should handle empty message content', async () => {
        const message = new TestMessage();
        const result = await handler.handleMessage(message);
        expect(result).toBe('Processed: ');
    });
});
