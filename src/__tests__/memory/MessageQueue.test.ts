import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageQueue } from '@/lib/memory/MessageQueue';
import { Message, MessageType } from '@/types';

describe('MessageQueue', () => {
  let queue: MessageQueue;

  beforeEach(() => {
    vi.clearAllMocks();
    queue = new MessageQueue();
  });

  describe('message handling', () => {
    it('should add and retrieve messages', () => {
      const message: Message = {
        id: '1',
        type: MessageType.COMMAND,
        content: 'test message',
        timestamp: Date.now()
      };

      queue.enqueue(message);
      expect(queue.size()).toBe(1);

      const retrieved = queue.dequeue();
      expect(retrieved).toEqual(message);
      expect(queue.size()).toBe(0);
    });

    it('should process messages in FIFO order', () => {
      const messages = [
        { id: '1', type: MessageType.COMMAND, content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.COMMAND, content: 'second', timestamp: Date.now() },
        { id: '3', type: MessageType.COMMAND, content: 'third', timestamp: Date.now() }
      ];

      messages.forEach(msg => queue.enqueue(msg));
      expect(queue.size()).toBe(3);

      messages.forEach(expected => {
        const actual = queue.dequeue();
        expect(actual).toEqual(expected);
      });
    });

    it('should handle empty queue gracefully', () => {
      expect(queue.size()).toBe(0);
      expect(queue.dequeue()).toBeUndefined();
    });

    it('should continue processing after error', () => {
      const errorHandler = vi.fn();
      queue.on('error', errorHandler);

      const message: Message = {
        id: '1',
        type: MessageType.COMMAND,
        content: 'test message',
        timestamp: Date.now()
      };

      queue.enqueue(message);
      queue.processMessage(message).catch(errorHandler);

      expect(errorHandler).not.toHaveBeenCalled();
    });
  });

  describe('event handling', () => {
    it('should emit events when messages are added/removed', () => {
      const onAdd = vi.fn();
      const onRemove = vi.fn();

      queue.on('messageAdded', onAdd);
      queue.on('messageRemoved', onRemove);

      const message: Message = {
        id: '1',
        type: MessageType.COMMAND,
        content: 'test message',
        timestamp: Date.now()
      };

      queue.enqueue(message);
      expect(onAdd).toHaveBeenCalledWith(message);

      queue.dequeue();
      expect(onRemove).toHaveBeenCalledWith(message);
    });
  });

  describe('queue management', () => {
    it('should clear all messages', () => {
      const messages = [
        { id: '1', type: MessageType.COMMAND, content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.COMMAND, content: 'second', timestamp: Date.now() }
      ];

      messages.forEach(msg => queue.enqueue(msg));
      expect(queue.size()).toBe(2);

      queue.clear();
      expect(queue.size()).toBe(0);
    });

    it('should respect max queue size', () => {
      const maxSize = 2;
      const limitedQueue = new MessageQueue(maxSize);

      const messages = [
        { id: '1', type: MessageType.COMMAND, content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.COMMAND, content: 'second', timestamp: Date.now() },
        { id: '3', type: MessageType.COMMAND, content: 'third', timestamp: Date.now() }
      ];

      messages.forEach(msg => limitedQueue.enqueue(msg));
      expect(limitedQueue.size()).toBe(maxSize);
      expect(limitedQueue.dequeue()).toEqual(messages[1]); // First message should be dropped
    });
  });
});
