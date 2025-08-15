import { describe, it, expect, beforeEach } from 'vitest'
import { BaseAgent } from '../../lib/agents/BaseAgent'
import { AgentCapabilityType, AgentType } from '../../lib/types/agent'

class TestAgent extends BaseAgent {
  constructor() {
    super('test-agent', AgentType.BASE)
  }

  async handleMessage() {
    const startTime = Date.now()
    // Test implementation
    const endTime = Date.now()
    this.updateMetrics(true, endTime - startTime)
    return { success: true }
  }

  // For testing purposes
  getInternalCapabilities() {
    return this.capabilities
  }

  getInternalMetrics() {
    return this.metrics
  }
}

describe('BaseAgent', () => {
  let agent: TestAgent

  beforeEach(() => {
    agent = new TestAgent()
  })

  describe('capabilities', () => {
    it('should add and check capabilities', () => {
      const capability: AgentCapabilityType = {
        name: 'test',
        description: 'Test capability',
        version: '1.0.0',
        parameters: {
          param1: {
            type: 'string',
            description: 'Test parameter',
            required: true
          }
        }
      }
      
      agent.addCapability(capability)
      expect(agent.hasCapability(capability)).toBe(true)
      expect(agent.getInternalCapabilities()).toContainEqual(capability)
    })

    it('should remove capabilities', () => {
      const capability: AgentCapabilityType = {
        name: 'test',
        description: 'Test capability',
        version: '1.0.0',
        parameters: {
          param1: {
            type: 'string',
            description: 'Test parameter',
            required: true
          }
        }
      }
      
      agent.addCapability(capability)
      agent.removeCapability(capability)
      expect(agent.hasCapability(capability)).toBe(false)
      expect(agent.getInternalCapabilities()).not.toContainEqual(capability)
    })

    it('should list capabilities', () => {
      const capability: AgentCapabilityType = {
        name: 'test',
        description: 'Test capability',
        version: '1.0.0',
        parameters: {
          param1: {
            type: 'string',
            description: 'Test parameter',
            required: true
          }
        }
      }
      
      agent.addCapability(capability)
      expect(agent.getCapabilities()).toContainEqual(capability)
    })
  })

  describe('metrics', () => {
    it('should track execution metrics', async () => {
      const startTime = Date.now()
      await agent.handleMessage()
      const endTime = Date.now()
      
      const metrics = agent.getInternalMetrics()
      expect(metrics.lastExecutionTime).toBeGreaterThanOrEqual(0)
      expect(metrics.lastExecutionTime).toBeLessThanOrEqual(endTime - startTime)
      expect(metrics.totalRequests).toBe(1)
    })
  })
})
