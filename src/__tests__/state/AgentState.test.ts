import { AgentState, StateConfig } from '@/lib/state/AgentState'
import { Agent, AgentStatus, AgentType, Message, MessageType } from '@/types'
import { RuntimeError } from '@/lib/errors/AgentErrors'

class MockAgent implements Agent {
  id: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]

  constructor() {
    this.id = 'test-agent'
    this.type = AgentType.BASE
    this.status = AgentStatus.IDLE
    this.capabilities = ['test']
  }

  async initialize(): Promise<void> {
    // Mock implementation
  }

  async handleMessage(message: Message): Promise<Message> {
    return {
      id: 'response-' + message.id,
      type: MessageType.RESPONSE,
      sender: this.id,
      recipient: message.sender,
      content: 'test response',
      timestamp: Date.now()
    }
  }
}

describe('AgentState', () => {
  let agentState: AgentState
  let agent: Agent

  beforeEach(() => {
    agent = new MockAgent()
    agentState = new AgentState(agent)
  })

  afterEach(() => {
    agentState.dispose()
    jest.clearAllMocks()
  })

  describe('state registration', () => {
    it('should register new state configuration', () => {
      const config: StateConfig = {
        allowedTransitions: [
          { from: AgentStatus.IDLE, to: AgentStatus.BUSY }
        ]
      }
      agentState.registerState(AgentStatus.IDLE, config)
      expect(agentState.getCurrentState()).toMatchObject(config)
    })

    it('should throw error when registering duplicate state', () => {
      const config: StateConfig = {
        allowedTransitions: [
          { from: AgentStatus.IDLE, to: AgentStatus.BUSY }
        ]
      }
      expect(() => {
        agentState.registerState(AgentStatus.IDLE, config)
        agentState.registerState(AgentStatus.IDLE, config)
      }).toThrow(RuntimeError)
    })

    it('should validate state configuration', () => {
      const invalidConfig = {
        allowedTransitions: [
          { from: AgentStatus.IDLE } // Missing 'to' field
        ]
      }
      expect(() => {
        agentState.registerState(AgentStatus.IDLE, invalidConfig as StateConfig)
      }).toThrow(RuntimeError)
    })
  })

  describe('state transitions', () => {
    it('should transition between allowed states', async () => {
      await agentState.transition(AgentStatus.BUSY)
      expect(agent.status).toBe(AgentStatus.BUSY)
    })

    it('should throw error for invalid transitions', async () => {
      agent.status = AgentStatus.IDLE
      await expect(
        agentState.transition(AgentStatus.ERROR)
      ).rejects.toThrow(RuntimeError)
    })

    it('should execute transition hooks', async () => {
      const onExit = jest.fn()
      const onEnter = jest.fn()
      const action = jest.fn()

      agentState.registerState(AgentStatus.IDLE, {
        allowedTransitions: [
          { 
            from: AgentStatus.IDLE,
            to: AgentStatus.BUSY,
            action
          }
        ],
        onExit
      })

      agentState.registerState(AgentStatus.BUSY, {
        allowedTransitions: [],
        onEnter
      })

      await agentState.transition(AgentStatus.BUSY)

      expect(onExit).toHaveBeenCalled()
      expect(action).toHaveBeenCalled()
      expect(onEnter).toHaveBeenCalled()
    })

    it('should respect transition conditions', async () => {
      const condition = jest.fn().mockReturnValue(false)
      
      agentState.registerState(AgentStatus.IDLE, {
        allowedTransitions: [
          { 
            from: AgentStatus.IDLE,
            to: AgentStatus.BUSY,
            condition
          }
        ]
      })

      await expect(
        agentState.transition(AgentStatus.BUSY)
      ).rejects.toThrow(RuntimeError)
      expect(condition).toHaveBeenCalled()
    })
  })

  describe('message handling', () => {
    it('should handle messages in current state', async () => {
      const onMessage = jest.fn()
      agentState.registerState(AgentStatus.IDLE, {
        allowedTransitions: [],
        onMessage
      })

      const message: Message = {
        id: 'test',
        type: MessageType.COMMAND,
        sender: 'other',
        recipient: agent.id,
        content: 'test',
        timestamp: Date.now()
      }

      await agentState.handleMessage(message)
      expect(onMessage).toHaveBeenCalledWith(agent, message)
    })
  })

  describe('state timeout', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should transition to error state on timeout', async () => {
      agentState.registerState(AgentStatus.BUSY, {
        allowedTransitions: [
          { from: AgentStatus.BUSY, to: AgentStatus.ERROR }
        ],
        timeout: 1000
      })

      agent.status = AgentStatus.BUSY
      jest.advanceTimersByTime(1000)
      
      // Wait for any pending promises to resolve
      await Promise.resolve()
      
      expect(agent.status).toBe(AgentStatus.ERROR)
    })
  })

  describe('retry mechanism', () => {
    it('should retry failed transitions up to max retries', async () => {
      const action = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValue(undefined)

      agentState.registerState(AgentStatus.BUSY, {
        allowedTransitions: [
          { 
            from: AgentStatus.BUSY,
            to: AgentStatus.IDLE,
            action
          }
        ],
        maxRetries: 2
      })

      agent.status = AgentStatus.BUSY
      await agentState.transition(AgentStatus.IDLE)
      
      expect(action).toHaveBeenCalledTimes(3)
      expect(agent.status).toBe(AgentStatus.IDLE)
    })

    it('should fail after max retries exceeded', async () => {
      const action = jest.fn().mockRejectedValue(new Error('Failed'))

      agentState.registerState(AgentStatus.BUSY, {
        allowedTransitions: [
          { 
            from: AgentStatus.BUSY,
            to: AgentStatus.IDLE,
            action
          }
        ],
        maxRetries: 1
      })

      agent.status = AgentStatus.BUSY
      await expect(
        agentState.transition(AgentStatus.IDLE)
      ).rejects.toThrow(RuntimeError)
      
      expect(action).toHaveBeenCalledTimes(2)
      expect(agent.status).toBe(AgentStatus.ERROR)
    })
  })

  describe('state queries', () => {
    it('should return transition history', async () => {
      await agentState.transition(AgentStatus.BUSY)
      const history = agentState.getTransitionHistory()
      
      expect(history).toHaveLength(1)
      expect(history[0]).toMatchObject({
        from: AgentStatus.IDLE,
        to: AgentStatus.BUSY
      })
    })

    it('should return allowed transitions', () => {
      const transitions = agentState.getAllowedTransitions()
      expect(transitions).toContain(AgentStatus.BUSY)
    })
  })

  describe('cleanup', () => {
    it('should clear timeouts on dispose', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      
      agentState.registerState(AgentStatus.BUSY, {
        allowedTransitions: [],
        timeout: 1000
      })

      agent.status = AgentStatus.BUSY
      agentState.dispose()
      
      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })
})
