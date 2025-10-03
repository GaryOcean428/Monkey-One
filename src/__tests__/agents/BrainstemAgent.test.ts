import { describe, it, expect, beforeEach } from 'vitest'
import { BrainstemAgent } from '../../lib/agents/core/BrainstemAgent'
import { Message, MessageType } from '../../types'
import { AgentType } from '../../lib/types/agent'

describe('BrainstemAgent', () => {
  let agent: BrainstemAgent

  beforeEach(() => {
    agent = new BrainstemAgent()
  })

  it('should initialize with correct base configuration', () => {
    expect(agent.getId()).toBe('brainstem-1')
    expect(agent.getName()).toBe('Brainstem Agent')
    expect(agent.getType()).toBe(AgentType.BRAINSTEM)
  })

  it('should process messages and update system state', async () => {
    const message: Message = {
      id: 'test-1',
      type: MessageType.TASK,
      content: 'urgent test message',
      timestamp: Date.now(),
    }

    const response = await agent.processMessage(message)
    expect(response.content).toContain('System operating at elevated alertness')
  })
})
