import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MessageBroker } from '../../lib/communication/MessageBroker'
import { MessageType } from '../../lib/types/core'
import { createMockMessage, waitForOperation, resetMocks } from '../../test/test-utils'

describe('MessageBroker', () => {
  let broker: MessageBroker

  beforeEach(() => {
    broker = new MessageBroker()
  })

  afterEach(() => {
    resetMocks()
  })

  it('publishes messages to subscribers', async () => {
    const handler = vi.fn()
    const message = createMockMessage({
      type: MessageType.TASK,
      content: 'test message',
    })

    await broker.subscribe('test-topic', handler)
    await broker.publish('test-topic', message)

    expect(handler).toHaveBeenCalledWith(message)
  })

  it('handles multiple subscribers', async () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const message = createMockMessage()

    await broker.subscribe('test-topic', handler1)
    await broker.subscribe('test-topic', handler2)
    await broker.publish('test-topic', message)

    expect(handler1).toHaveBeenCalledWith(message)
    expect(handler2).toHaveBeenCalledWith(message)
  })

  it('handles async message processing', async () => {
    const handler = vi.fn().mockImplementation(async msg => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return msg
    })

    const message = createMockMessage()
    await broker.subscribe('test-topic', handler)

    await waitForOperation(broker.publish('test-topic', message))
    expect(handler).toHaveBeenCalledWith(message)
  })

  it('handles errors in subscribers gracefully', async () => {
    const errorHandler = vi.fn().mockImplementation(() => {
      throw new Error('Test error')
    })
    const successHandler = vi.fn()

    await broker.subscribe('test-topic', errorHandler)
    await broker.subscribe('test-topic', successHandler)

    const message = createMockMessage()
    await broker.publish('test-topic', message)

    expect(errorHandler).toHaveBeenCalledWith(message)
    expect(successHandler).toHaveBeenCalledWith(message)
  })
})
