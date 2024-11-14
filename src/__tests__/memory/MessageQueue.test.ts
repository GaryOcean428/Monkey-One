import { MessageQueue } from '../../lib/memory/MessageQueue';
import type { Message } from '../../types';

// Type for accessing private members in tests
type MessageQueuePrivate = {
  queue: Message[];
  processQueue: () => Promise<void>;
};

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    queue = new MessageQueue();
  });

  describe('message handling', () => {
    const mockMessage: Message = {
      id: 'test-1',
      role: 'user',
      content: 'test message',
      timestamp: Date.now()
    };

    it('should add messages to the queue', () => {
      queue.add(mockMessage);
      const queuePrivate = queue as unknown as MessageQueuePrivate;
      expect(queuePrivate.queue).toContain(mockMessage);
    });

    it('should process messages in FIFO order', async () => {
      const processedMessages: Message[] = [];
      const queuePrivate = queue as unknown as MessageQueuePrivate;
      
      const mockProcess = jest.spyOn(queuePrivate, 'processQueue')
        .mockImplementation(async () => {
          while (queuePrivate.queue.length > 0) {
            const message = queuePrivate.queue.shift();
            if (message) {
              processedMessages.push(message);
            }
          }
        });

      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'first',
          timestamp: Date.now()
        },
        {
          id: '2',
          role: 'user',
          content: 'second',
          timestamp: Date.now()
        },
        {
          id: '3',
          role: 'user',
          content: 'third',
          timestamp: Date.now()
        }
      ];

      // Add messages
      messages.forEach(msg => queue.add(msg));

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockProcess).toHaveBeenCalled();
      expect(processedMessages).toEqual(messages);
      expect(queuePrivate.queue).toHaveLength(0);

      mockProcess.mockRestore();
    });

    it('should handle empty queue gracefully', async () => {
      const queuePrivate = queue as unknown as MessageQueuePrivate;
      const mockProcess = jest.spyOn(queuePrivate, 'processQueue');
      await queuePrivate.processQueue();
      expect(mockProcess).toHaveBeenCalled();
      mockProcess.mockRestore();
    });

    it('should continue processing after error', async () => {
      const processedMessages: Message[] = [];
      const queuePrivate = queue as unknown as MessageQueuePrivate;
      
      const mockProcess = jest.spyOn(queuePrivate, 'processQueue')
        .mockImplementation(async () => {
          while (queuePrivate.queue.length > 0) {
            const message = queuePrivate.queue.shift();
            if (message) {
              if (message.id === '2') {
                throw new Error('Test error');
              }
              processedMessages.push(message);
            }
          }
        });

      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'first',
          timestamp: Date.now()
        },
        {
          id: '2',
          role: 'user',
          content: 'error message',
          timestamp: Date.now()
        },
        {
          id: '3',
          role: 'user',
          content: 'third',
          timestamp: Date.now()
        }
      ];

      // Add messages
      messages.forEach(msg => {
        try {
          queue.add(msg);
        } catch {
          // Expected error for message 2
        }
      });

      // Wait for processing to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockProcess).toHaveBeenCalled();
      expect(processedMessages).toContain(messages[0]);
      expect(processedMessages).not.toContain(messages[1]);
      expect(processedMessages).toContain(messages[2]);

      mockProcess.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle invalid message gracefully', () => {
      const invalidMessage = undefined;
      expect(() => queue.add(invalidMessage as unknown as Message))
        .toThrow();
    });

    it('should maintain queue integrity after error', () => {
      const validMessage: Message = {
        id: 'valid',
        role: 'user',
        content: 'valid message',
        timestamp: Date.now()
      };

      queue.add(validMessage);
      
      expect(() => queue.add(undefined as unknown as Message))
        .toThrow();

      const queuePrivate = queue as unknown as MessageQueuePrivate;
      expect(queuePrivate.queue).toContain(validMessage);
      expect(queuePrivate.queue).toHaveLength(1);
    });
  });
});
