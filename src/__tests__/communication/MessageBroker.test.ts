import { MessageBroker } from '../../lib/communication/MessageBroker';
import { Message, MessageType } from '../../types';

type MessageHandlerFn = (message: Message) => Promise<void>;

describe('MessageBroker', () => {
  let broker: MessageBroker;
  let mockHandler: jest.Mock;

  beforeEach(() => {
    broker = new MessageBroker();
    mockHandler = jest.fn();
  });

  describe('publish/subscribe pattern', () => {
    const mockMessage: Message = {
      id: 'test-1',
      type: MessageType.TASK,
      role: 'user',
      content: 'test message',
      timestamp: Date.now()
    };

    it('should allow subscription to topics', async () => {
      await expect(broker.subscribe('test-topic', mockHandler))
        .resolves.not.toThrow();
    });

    it('should publish messages to subscribers', async () => {
      await broker.subscribe('test-topic', mockHandler);
      await broker.publish('test-topic', mockMessage);
      
      // Handler should be called with the message
      expect(mockHandler).toHaveBeenCalledWith(mockMessage);
    });

    it('should not deliver messages to wrong topics', async () => {
      await broker.subscribe('topic-1', mockHandler);
      await broker.publish('topic-2', mockMessage);
      
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', async () => {
      const mockHandler2 = jest.fn();
      
      await broker.subscribe('test-topic', mockHandler);
      await broker.subscribe('test-topic', mockHandler2);
      await broker.publish('test-topic', mockMessage);
      
      expect(mockHandler).toHaveBeenCalledWith(mockMessage);
      expect(mockHandler2).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe('direct messaging', () => {
    const mockDebateMessage = {
      id: 'debate-1',
      role: 'assistant',
      content: 'debate point',
      timestamp: Date.now(),
      metadata: {
        debateId: 'test-debate',
        roundNumber: 1
      }
    };

    it('should send debate messages', async () => {
      await expect(broker.sendMessage(mockDebateMessage))
        .resolves.not.toThrow();
    });

    // Additional tests would depend on the actual implementation
    // of message routing and delivery confirmation
  });

  describe('error handling', () => {
    it('should handle subscription errors gracefully', async () => {
      const invalidHandler: MessageHandlerFn = undefined as unknown as MessageHandlerFn;
      await expect(broker.subscribe('test-topic', invalidHandler))
        .rejects.toThrow();
    });

    it('should handle publication errors gracefully', async () => {
      const invalidMessage: Message = undefined as unknown as Message;
      await expect(broker.publish('test-topic', invalidMessage))
        .rejects.toThrow();
    });
  });
});
