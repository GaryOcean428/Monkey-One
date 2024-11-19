import { AgentRegistry, AgentMetadata } from '@/lib/registry/AgentRegistry'
import { Agent, AgentStatus, AgentType, Message, MessageType } from '@/types'
import { RuntimeError } from '@/lib/errors/AgentErrors'

class TestAgent implements Agent {
  id: string
  type: AgentType
  status: AgentStatus
  capabilities: string[]

  constructor(capabilities: string[]) {
    this.id = 'test-' + Math.random().toString(36).substr(2, 9)
    this.type = AgentType.BASE
    this.status = AgentStatus.IDLE
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
      content: 'test response',
      timestamp: Date.now()
    }
  }
}

describe('AgentRegistry', () => {
  let registry: AgentRegistry
  let validMetadata: AgentMetadata

  beforeEach(() => {
    registry = AgentRegistry.getInstance()
    registry.reset()

    validMetadata = {
      type: AgentType.BASE,
      description: 'Test Agent',
      capabilities: ['test'],
      version: '1.0.0',
      author: 'Test Author',
      dependencies: []
    }
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AgentRegistry.getInstance()
      const instance2 = AgentRegistry.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('agent registration', () => {
    it('should register agent type successfully', () => {
      registry.registerAgentType(TestAgent, validMetadata)
      const types = registry.getAllAgentTypes()
      expect(types).toContain(AgentType.BASE)
    })

    it('should throw error when registering duplicate agent type', () => {
      registry.registerAgentType(TestAgent, validMetadata)
      expect(() => 
        registry.registerAgentType(TestAgent, validMetadata)
      ).toThrow(RuntimeError)
    })

    it('should throw error for invalid metadata', () => {
      const invalidMetadata = { ...validMetadata, capabilities: [] }
      expect(() => 
        registry.registerAgentType(TestAgent, invalidMetadata)
      ).toThrow(RuntimeError)
    })

    it('should throw error for invalid version format', () => {
      const invalidMetadata = { ...validMetadata, version: 'invalid' }
      expect(() => 
        registry.registerAgentType(TestAgent, invalidMetadata)
      ).toThrow(RuntimeError)
    })
  })

  describe('agent retrieval', () => {
    beforeEach(() => {
      registry.registerAgentType(TestAgent, validMetadata)
    })

    it('should get agent constructor', () => {
      const constructor = registry.getAgentConstructor(AgentType.BASE)
      expect(constructor).toBe(TestAgent)
    })

    it('should get agent metadata', () => {
      const metadata = registry.getAgentMetadata(AgentType.BASE)
      expect(metadata).toEqual(validMetadata)
    })

    it('should throw error for unregistered agent type', () => {
      expect(() => 
        registry.getAgentConstructor(AgentType.CODER)
      ).toThrow(RuntimeError)
    })
  })

  describe('capability validation', () => {
    beforeEach(() => {
      registry.registerAgentType(TestAgent, validMetadata)
    })

    it('should validate valid capabilities', () => {
      const isValid = registry.validateCapabilities(AgentType.BASE, ['test'])
      expect(isValid).toBe(true)
    })

    it('should invalidate unsupported capabilities', () => {
      const isValid = registry.validateCapabilities(AgentType.BASE, ['unsupported'])
      expect(isValid).toBe(false)
    })

    it('should get agents by capability', () => {
      const agents = registry.getAgentsByCapability('test')
      expect(agents).toContain(AgentType.BASE)
    })
  })

  describe('dependency management', () => {
    beforeEach(() => {
      registry.registerAgentType(TestAgent, validMetadata)
    })

    it('should check dependencies successfully', () => {
      const hasDeps = registry.checkDependencies(AgentType.BASE)
      expect(hasDeps).toBe(true)
    })

    it('should get agents by dependency', () => {
      const dependentMetadata: AgentMetadata = {
        ...validMetadata,
        type: AgentType.CODER,
        dependencies: ['test']
      }
      registry.registerAgentType(TestAgent, dependentMetadata)

      const agents = registry.getAgentsByDependency('test')
      expect(agents).toContain(AgentType.CODER)
    })
  })

  describe('agent creation', () => {
    beforeEach(() => {
      registry.registerAgentType(TestAgent, validMetadata)
    })

    it('should create agent instance', () => {
      const agent = registry.createAgent(AgentType.BASE, ['test'])
      expect(agent).toBeInstanceOf(TestAgent)
      expect(agent.capabilities).toEqual(['test'])
    })

    it('should throw error for invalid capabilities', () => {
      expect(() => 
        registry.createAgent(AgentType.BASE, ['invalid'])
      ).toThrow(RuntimeError)
    })

    it('should throw error for unmet dependencies', () => {
      const dependentMetadata: AgentMetadata = {
        ...validMetadata,
        type: AgentType.CODER,
        dependencies: ['missing']
      }
      registry.registerAgentType(TestAgent, dependentMetadata)

      expect(() => 
        registry.createAgent(AgentType.CODER, ['test'])
      ).toThrow(RuntimeError)
    })
  })

  describe('registry management', () => {
    beforeEach(() => {
      registry.registerAgentType(TestAgent, validMetadata)
    })

    it('should unregister agent type', () => {
      registry.unregisterAgentType(AgentType.BASE)
      expect(() => 
        registry.getAgentConstructor(AgentType.BASE)
      ).toThrow(RuntimeError)
    })

    it('should reset registry', () => {
      registry.reset()
      expect(registry.getAllAgentTypes()).toHaveLength(0)
    })

    it('should throw error when unregistering non-existent type', () => {
      expect(() => 
        registry.unregisterAgentType(AgentType.CODER)
      ).toThrow(RuntimeError)
    })
  })
})
