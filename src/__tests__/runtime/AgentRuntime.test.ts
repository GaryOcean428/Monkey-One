import { AgentRuntime } from '@/lib/runtime/AgentRuntime'
import { Agent, AgentStatus, AgentType, Message, MessageType, RuntimeConfig, Tool, LogLevel } from '@/types'
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

describe('AgentRuntime', () => {
  let runtime: AgentRuntime
  let mockAgent: Agent
  let mockTool: Tool
  let defaultConfig: RuntimeConfig

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
      }
    }

    runtime = new AgentRuntime(defaultConfig)
    mockAgent = new MockAgent(
      'test-agent',
      AgentType.BASE,
      AgentStatus.IDLE,
      ['test']
    )
    mockTool = {
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A tool for testing',
      execute: jest.fn().mockResolvedValue('tool result'),
      validate: jest.fn().mockReturnValue(true)
    }
  })

  describe('agent management', () => {
    it('should register agent successfully', async () => {
      await runtime.registerAgent(mockAgent)
      const agent = runtime.getAgent(mockAgent.id)
      expect(agent).toBe(mockAgent)
    })

    it('should throw error when registering duplicate agent', async () => {
      await runtime.registerAgent(mockAgent)
      await expect(runtime.registerAgent(mockAgent)).rejects.toThrow(RuntimeError)
    })

    it('should throw error when max concurrent agents reached', async () => {
      const config: RuntimeConfig = { ...defaultConfig, maxConcurrentAgents: 1 }
      runtime = new AgentRuntime(config)

      await runtime.registerAgent(mockAgent)
      const anotherAgent = new MockAgent(
        'another-agent',
        AgentType.BASE,
        AgentStatus.BUSY,
        ['test']
      )

      await expect(runtime.registerAgent(anotherAgent)).rejects.toThrow(RuntimeError)
    })

    it('should unregister agent successfully', async () => {
      await runtime.registerAgent(mockAgent)
      runtime.unregisterAgent(mockAgent.id)
      expect(runtime.getAgent(mockAgent.id)).toBeUndefined()
    })
  })

  describe('tool management', () => {
    it('should register tool successfully', () => {
      runtime.registerTool(mockTool)
      const tool = runtime.getTool(mockTool.id)
      expect(tool).toBe(mockTool)
    })

    it('should throw error when registering duplicate tool', () => {
      runtime.registerTool(mockTool)
      expect(() => runtime.registerTool(mockTool)).toThrow(RuntimeError)
    })

    it('should execute tool successfully', async () => {
      runtime.registerTool(mockTool)
      const result = await runtime.executeTool(mockTool.id, { test: true })
      expect(result).toBe('tool result')
      expect(mockTool.validate).toHaveBeenCalledWith({ test: true })
      expect(mockTool.execute).toHaveBeenCalledWith({ test: true })
    })

    it('should throw error when executing unregistered tool', async () => {
      await expect(runtime.executeTool('unknown-tool', {})).rejects.toThrow(RuntimeError)
    })
  })

  describe('message handling', () => {
    let message: Message

    beforeEach(async () => {
      await runtime.registerAgent(mockAgent)
      const recipient = new MockAgent(
        'recipient-agent',
        AgentType.BASE,
        AgentStatus.IDLE,
        ['test']
      )
      await runtime.registerAgent(recipient)

      message = {
        id: 'test-message',
        type: MessageType.COMMAND,
        sender: mockAgent.id,
        recipient: recipient.id,
        content: 'test content',
        timestamp: Date.now()
      }
    })

    it('should send message successfully', async () => {
      const response = await runtime.sendMessage(message)
      expect(response.type).toBe(MessageType.RESPONSE)
      expect(response.sender).toBe(message.recipient)
      expect(response.recipient).toBe(message.sender)
    })

    it('should throw error when sending message to unregistered agent', async () => {
      const invalidMessage = { ...message, recipient: 'unknown-agent' }
      await expect(runtime.sendMessage(invalidMessage)).rejects.toThrow(RuntimeError)
    })

    it('should handle rate limiting', async () => {
      const config: RuntimeConfig = {
        ...defaultConfig,
        rateLimit: { requests: 1, windowMs: 1000 }
      }
      runtime = new AgentRuntime(config)
      await runtime.registerAgent(mockAgent)
      await runtime.registerAgent(new MockAgent(
        'recipient-agent',
        AgentType.BASE,
        AgentStatus.IDLE,
        ['test']
      ))

      await runtime.sendMessage(message)
      await expect(runtime.sendMessage(message)).rejects.toThrow(RuntimeError)
    })
  })

  describe('agent queries', () => {
    beforeEach(async () => {
      await runtime.registerAgent(mockAgent)
    })

    it('should get agents by type', () => {
      const agents = runtime.getAgentsByType(AgentType.BASE)
      expect(agents).toHaveLength(1)
      expect(agents[0]).toBe(mockAgent)
    })

    it('should get agents by capability', () => {
      const agents = runtime.getAgentsByCapability('test')
      expect(agents).toHaveLength(1)
      expect(agents[0]).toBe(mockAgent)
    })

    it('should get active agents', () => {
      mockAgent.status = AgentStatus.BUSY
      const agents = runtime.getActiveAgents()
      expect(agents).toHaveLength(1)
      expect(agents[0]).toBe(mockAgent)
    })

    it('should get idle agents', () => {
      const agents = runtime.getIdleAgents()
      expect(agents).toHaveLength(1)
      expect(agents[0]).toBe(mockAgent)
    })
  })

  describe('shutdown', () => {
    it('should shutdown runtime gracefully', async () => {
      await runtime.registerAgent(mockAgent)
      await runtime.shutdown()
      expect(runtime.getAgent(mockAgent.id)).toBeUndefined()
    })

    it('should continue shutdown despite errors', async () => {
      const errorAgent = new MockAgent(
        'error-agent',
        AgentType.BASE,
        AgentStatus.ERROR,
        ['test']
      )
      await runtime.registerAgent(errorAgent)
      await runtime.shutdown()
      expect(runtime.getAgent(errorAgent.id)).toBeUndefined()
    })
  })
})
