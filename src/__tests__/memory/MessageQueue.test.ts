import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MessageQueue } from '@/lib/memory/MessageQueue';
import { Message, MessageType } from '@/types';

describe('MessageQueue', () => {
  let queue: MessageQueue<Message>;

  beforeEach(() => {
    queue = new MessageQueue<Message>();
  });

  describe('message handling', () => {
    it('should add and retrieve messages', () => {
      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
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
        { id: '1', type: MessageType.TASK, role: 'user', content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.TASK, role: 'user', content: 'second', timestamp: Date.now() },
        { id: '3', type: MessageType.TASK, role: 'user', content: 'third', timestamp: Date.now() }
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
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const successListener = vi.fn();

      queue.on(errorListener);
      queue.on(successListener);

      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      };

      queue.enqueue(message);
      expect(errorListener).toHaveBeenCalledWith(message);
      expect(successListener).toHaveBeenCalledWith(message);
    });
  });

  describe('event handling', () => {
    it('should emit events when messages are added/removed', () => {
      const addListener = vi.fn();
      const removeListener = vi.fn();

      queue.on(addListener);
      queue.on(removeListener);

      const message: Message = {
        id: 'test',
        type: MessageType.TASK,
        role: 'user',
        content: 'test message',
        timestamp: Date.now()
      };

      queue.enqueue(message);
      expect(addListener).toHaveBeenCalledWith(message);

      queue.dequeue();
      expect(removeListener).toHaveBeenCalledWith(message);
    });
  });

  describe('queue management', () => {
    it('should clear all messages', () => {
      const messages = [
        { id: '1', type: MessageType.TASK, role: 'user', content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.TASK, role: 'user', content: 'second', timestamp: Date.now() }
      ];

      messages.forEach(msg => queue.enqueue(msg));
      expect(queue.size()).toBe(2);

      queue.clear();
      expect(queue.size()).toBe(0);
    });

    it('should respect max queue size', () => {
      const limitedQueue = new MessageQueue<Message>(2);
      const messages = [
        { id: '1', type: MessageType.TASK, role: 'user', content: 'first', timestamp: Date.now() },
        { id: '2', type: MessageType.TASK, role: 'user', content: 'second', timestamp: Date.now() }
      ];

      messages.forEach(msg => limitedQueue.enqueue(msg));
      expect(() => limitedQueue.enqueue({
        id: '3',
        type: MessageType.TASK,
        role: 'user',
        content: 'third',
        timestamp: Date.now()
      })).toThrow('Queue size limit (2) reached');
    });
  });
});
