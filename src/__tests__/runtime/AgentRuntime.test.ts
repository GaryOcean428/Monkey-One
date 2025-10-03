import { expect, describe, it, beforeEach, vi } from 'vitest'
import { AgentRuntime } from '../../lib/runtime/AgentRuntime'
import { BaseAgent } from '../../lib/agents/base/BaseAgent'
import { Message, MessageType } from '../../lib/types/core'

describe('AgentRuntime', () => {
  let runtime: AgentRuntime
  let agent: BaseAgent

  beforeEach(() => {
    agent = new BaseAgent()
    runtime = new AgentRuntime(agent)
    vi.spyOn(agent, 'processMessage')
  })

  it('should initialize with an agent', () => {
    expect(runtime.getAgent()).toBe(agent)
  })

  it('should start message processing', () => {
    const spy = vi.spyOn(runtime as any, 'processQueue')
    runtime.startProcessing()
    expect(spy).toHaveBeenCalled()
  })

  it('should enqueue messages', () => {
    const message: Message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'test',
      timestamp: Date.now(),
    }
    runtime.enqueueMessage(message)
    expect(runtime['messageQueue'].size()).toBe(1)
  })

  it('should process messages through the agent', async () => {
    const message: Message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'test',
      timestamp: Date.now(),
    }
    runtime.enqueueMessage(message)
    await runtime['processQueue']()
    expect(agent.processMessage).toHaveBeenCalledWith(message)
  })

  it('should stop processing on shutdown', async () => {
    await runtime.shutdown()
    expect(runtime.isActive()).toBe(false)
  })

  it('should process remaining messages before shutdown', async () => {
    const message: Message = {
      id: '1',
      type: MessageType.TASK,
      role: 'user',
      content: 'test',
      timestamp: Date.now(),
    }
    runtime.enqueueMessage(message)
    await runtime.shutdown()
    expect(runtime['messageQueue'].size()).toBe(0)
  })
})
