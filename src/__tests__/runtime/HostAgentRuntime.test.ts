import { HostAgentRuntime, HostRuntimeConfig } from '@/lib/runtime/HostAgentRuntime'
import { Agent, AgentStatus, AgentType, LogLevel, Message, MessageType } from '@/types'
import { RuntimeError } from '@/lib/errors/AgentErrors'

class MockAgent implements Agent {
  id: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]

  constructor(id: string, type: AgentType, status: AgentStatus, capabilities: string[]) {
    this.id = id
    this.type = type
    this.status = status
    this.capabilities = capabilities
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
      content: 'mock response',
      timestamp: Date.now()
    }
  }
}

jest.mock('../agents/base', () => ({
  default: MockAgent
}))

describe('HostAgentRuntime', () => {
  let runtime: HostAgentRuntime
  let defaultConfig: HostRuntimeConfig

  beforeEach(() => {
    defaultConfig = {
      maxConcurrentAgents: 5,
      rateLimit: {
        requests: 100,
        windowMs: 60000
      },
      monitoring: {
        enablePerformance: true,
        enableErrorReporting: true,
        logLevel: LogLevel.INFO
      },
      enablePersistence: false,
      persistencePath: './test-state',
      autoRecover: false,
      shutdownTimeout: 1000
    }

    runtime = new HostAgentRuntime(defaultConfig)
  })

  describe('agent creation', () => {
    it('should create agent with specified type and capabilities', async () => {
      const agent = await runtime.createAgent(AgentType.BASE, ['test'])
      expect(agent).toBeDefined()
      expect(agent.type).toBe(AgentType.BASE)
      expect(agent.capabilities).toEqual(['test'])
    })

    it('should throw error for unsupported agent type', async () => {
      const invalidType = 'INVALID' as AgentType
      await expect(runtime.createAgent(invalidType, [])).rejects.toThrow(RuntimeError)
    })
  })

  describe('agent cloning', () => {
    let sourceAgent: Agent

    beforeEach(async () => {
      sourceAgent = await runtime.createAgent(AgentType.BASE, ['test'])
    })

    it('should clone agent with same capabilities', async () => {
      const clonedAgent = await runtime.cloneAgent(sourceAgent.id)
      expect(clonedAgent.type).toBe(sourceAgent.type)
      expect(clonedAgent.capabilities).toEqual(sourceAgent.capabilities)
      expect(clonedAgent.id).not.toBe(sourceAgent.id)
    })

    it('should clone agent with new capabilities', async () => {
      const newCapabilities = ['new-test']
      const clonedAgent = await runtime.cloneAgent(sourceAgent.id, newCapabilities)
      expect(clonedAgent.type).toBe(sourceAgent.type)
      expect(clonedAgent.capabilities).toEqual(newCapabilities)
    })

    it('should throw error when cloning non-existent agent', async () => {
      await expect(runtime.cloneAgent('non-existent')).rejects.toThrow(RuntimeError)
    })
  })

  describe('message broadcasting', () => {
    let agents: Agent[]

    beforeEach(async () => {
      agents = await Promise.all([
        runtime.createAgent(AgentType.BASE, ['test1']),
        runtime.createAgent(AgentType.BASE, ['test2']),
        runtime.createAgent(AgentType.BASE, ['test3'])
      ])
    })

    it('should broadcast message to all agents', async () => {
      const message: Omit<Message, 'recipient'> = {
        id: 'broadcast-1',
        type: MessageType.COMMAND,
        sender: 'test-sender',
        content: 'broadcast content',
        timestamp: Date.now()
      }

      const responses = await runtime.broadcast(message)
      expect(responses).toHaveLength(agents.length)
      responses.forEach(response => {
        expect(response.type).toBe(MessageType.RESPONSE)
      })
    })

    it('should broadcast message with filter', async () => {
      const message: Omit<Message, 'recipient'> = {
        id: 'broadcast-2',
        type: MessageType.COMMAND,
        sender: 'test-sender',
        content: 'filtered broadcast',
        timestamp: Date.now()
      }

      const filter = (agent: Agent) => agent.capabilities.includes('test1')
      const responses = await runtime.broadcast(message, filter)
      expect(responses).toHaveLength(1)
    })

    it('should handle broadcast failures gracefully', async () => {
      const failingAgent = agents[0]
      jest.spyOn(failingAgent, 'handleMessage').mockRejectedValue(new Error('Test error'))

      const message: Omit<Message, 'recipient'> = {
        id: 'broadcast-3',
        type: MessageType.COMMAND,
        sender: 'test-sender',
        content: 'error broadcast',
        timestamp: Date.now()
      }

      const responses = await runtime.broadcast(message)
      expect(responses).toHaveLength(agents.length - 1)
    })
  })

  describe('persistence', () => {
    beforeEach(() => {
      runtime = new HostAgentRuntime({
        ...defaultConfig,
        enablePersistence: true,
        autoRecover: true
      })
    })

    it('should persist state when creating agent', async () => {
      const persistSpy = jest.spyOn(console, 'log')
      await runtime.createAgent(AgentType.BASE, ['test'])
      expect(persistSpy).toHaveBeenCalledWith(
        'Persisting state:',
        expect.any(Object)
      )
    })

    it('should attempt to recover state on startup', () => {
      const recoverSpy = jest.spyOn(console, 'log')
      runtime = new HostAgentRuntime({
        ...defaultConfig,
        enablePersistence: true,
        autoRecover: true
      })
      expect(recoverSpy).toHaveBeenCalledWith('Recovering state...')
    })
  })

  describe('shutdown', () => {
    beforeEach(() => {
      runtime = new HostAgentRuntime({
        ...defaultConfig,
        shutdownTimeout: 100
      })
    })

    it('should shutdown gracefully within timeout', async () => {
      await runtime.createAgent(AgentType.BASE, ['test'])
      await expect(runtime.shutdown()).resolves.not.toThrow()
    })

    it('should force shutdown after timeout', async () => {
      const agent = await runtime.createAgent(AgentType.BASE, ['test'])
      jest.spyOn(agent, 'handleMessage').mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      await expect(runtime.shutdown()).resolves.not.toThrow()
    })
  })
})
