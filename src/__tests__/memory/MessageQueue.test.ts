import { MessageQueue, MessageQueueOptions } from '@/lib/memory/MessageQueue'
import { Message, MessageType } from '@/types'
import { ValidationError } from '@/lib/errors/AgentErrors'

describe('MessageQueue', () => {
  let queue: MessageQueue
  let defaultMessage: Message

  beforeEach(() => {
    queue = new MessageQueue()
    defaultMessage = {
      id: '1',
      type: MessageType.COMMAND,
      sender: 'sender',
      recipient: 'recipient',
      content: 'test content',
      timestamp: Date.now()
    }
  })

  describe('initialization', () => {
    it('should create queue with default options', () => {
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })

    it('should create queue with custom options', () => {
      const options: MessageQueueOptions = {
        maxSize: 5,
        retentionPeriod: 1000
      }
      queue = new MessageQueue(options)
      expect(queue.size()).toBe(0)
    })
  })

  describe('basic operations', () => {
    it('should enqueue and dequeue messages', () => {
      queue.enqueue(defaultMessage)
      expect(queue.size()).toBe(1)
      
      const message = queue.dequeue()
      expect(message).toEqual(defaultMessage)
      expect(queue.size()).toBe(0)
    })

    it('should peek at next message without removing it', () => {
      queue.enqueue(defaultMessage)
      const peekedMessage = queue.peek()
      
      expect(peekedMessage).toEqual(defaultMessage)
      expect(queue.size()).toBe(1)
    })

    it('should clear all messages', () => {
      queue.enqueue(defaultMessage)
      queue.enqueue({ ...defaultMessage, id: '2' })
      
      queue.clear()
      expect(queue.size()).toBe(0)
      expect(queue.isEmpty()).toBe(true)
    })
  })

  describe('validation', () => {
    it('should throw error for invalid message format', () => {
      const invalidMessage = { ...defaultMessage, id: '' }
      expect(() => queue.enqueue(invalidMessage)).toThrow(ValidationError)
    })

    it('should throw error when queue is full', () => {
      queue = new MessageQueue({ maxSize: 1 })
      queue.enqueue(defaultMessage)
      
      expect(() => queue.enqueue({ ...defaultMessage, id: '2' }))
        .toThrow(ValidationError)
    })

    it('should add timestamp if not provided', () => {
      const messageWithoutTimestamp: Message = {
        ...defaultMessage,
        timestamp: undefined
      }
      
      queue.enqueue(messageWithoutTimestamp)
      const message = queue.dequeue()
      
      expect(message?.timestamp).toBeDefined()
      expect(typeof message?.timestamp).toBe('number')
    })
  })

  describe('message retention', () => {
    it('should remove expired messages', () => {
      const retentionPeriod = 100 // 100ms
      queue = new MessageQueue({ retentionPeriod })
      
      const expiredMessage = {
        ...defaultMessage,
        timestamp: Date.now() - retentionPeriod - 1
      }
      queue.enqueue(expiredMessage)
      
      expect(queue.size()).toBe(0)
    })

    it('should keep messages within retention period', () => {
      const retentionPeriod = 1000 // 1s
      queue = new MessageQueue({ retentionPeriod })
      
      queue.enqueue(defaultMessage)
      expect(queue.size()).toBe(1)
    })
  })

  describe('search operations', () => {
    beforeEach(() => {
      queue.enqueue(defaultMessage)
      queue.enqueue({
        ...defaultMessage,
        id: '2',
        type: MessageType.RESPONSE
      })
    })

    it('should find message by id', () => {
      const message = queue.findById('2')
      expect(message?.id).toBe('2')
    })

    it('should find messages by type', () => {
      const messages = queue.findByType(MessageType.RESPONSE)
      expect(messages.length).toBe(1)
      expect(messages[0].id).toBe('2')
    })

    it('should find messages by sender', () => {
      const messages = queue.findBySender('sender')
      expect(messages.length).toBe(2)
    })

    it('should find messages by recipient', () => {
      const messages = queue.findByRecipient('recipient')
      expect(messages.length).toBe(2)
    })

    it('should remove message by id', () => {
      const removed = queue.removeById('1')
      expect(removed).toBe(true)
      expect(queue.size()).toBe(1)
    })
  })

  describe('statistics', () => {
    beforeEach(() => {
      queue.enqueue(defaultMessage)
      queue.enqueue({
        ...defaultMessage,
        id: '2',
        type: MessageType.RESPONSE,
        timestamp: Date.now() + 1000
      })
    })

    it('should provide queue statistics', () => {
      const stats = queue.getStats()
      
      expect(stats.totalMessages).toBe(2)
      expect(stats.messageTypes).toHaveProperty(MessageType.COMMAND)
      expect(stats.messageTypes).toHaveProperty(MessageType.RESPONSE)
      expect(stats.queueCapacity).toBe(1000)
      expect(stats.queueUtilization).toBe(0.2)
      expect(stats.oldestMessageAge).toBeGreaterThan(0)
      expect(stats.newestMessageAge).toBeLessThan(stats.oldestMessageAge)
    })
  })
})
