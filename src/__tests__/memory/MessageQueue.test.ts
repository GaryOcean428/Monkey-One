import { describe, it, expect, beforeEach } from 'vitest'
import { MessageQueue } from '../../lib/memory/MessageQueue'
import { MessageType } from '../../lib/types/core'
import { createMockMessage } from '../../test/test-utils'

describe('MessageQueue', () => {
  let queue: MessageQueue

  beforeEach(() => {
    queue = new MessageQueue()
  })

  it('adds message to queue', () => {
    const message = createMockMessage({
      type: MessageType.TASK,
      content: 'test message',
    })

    queue.enqueue(message)
    expect(queue.size()).toBe(1)
  })

  it('processes messages in order', () => {
    const messages = [
      createMockMessage({ id: '1', type: MessageType.TASK }),
      createMockMessage({ id: '2', type: MessageType.TASK }),
      createMockMessage({ id: '3', type: MessageType.TASK }),
    ]

    messages.forEach(msg => queue.enqueue(msg))

    expect(queue.dequeue()).toEqual(messages[0])
    expect(queue.dequeue()).toEqual(messages[1])
    expect(queue.dequeue()).toEqual(messages[2])
  })

  it('returns undefined when empty', () => {
    expect(queue.dequeue()).toBeUndefined()
  })

  it('clears queue', () => {
    const message = createMockMessage({
      type: MessageType.TASK,
    })

    queue.enqueue(message)
    expect(queue.size()).toBe(1)

    queue.clear()
    expect(queue.size()).toBe(0)
  })
})
