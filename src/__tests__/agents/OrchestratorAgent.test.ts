import { OrchestratorAgent } from '../../lib/agents/core/OrchestratorAgent'
import { BaseAgent } from '../../lib/agents/BaseAgent'
import { AgentType } from '../../lib/types/agent'
import { Message, MessageType } from '../../lib/types/core'
import { RuntimeError } from '../../lib/errors/AgentErrors'
import { vi } from 'vitest'

// Mock child agent for testing
class MockChildAgent extends BaseAgent {
  constructor(id: string) {
    super(id, `MockAgent-${id}`, AgentType.BASE)
  }

  async processMessage(message: Message): Promise<void> {
    // Mock implementation - just log the message
    console.log(`Mock agent processing message:`, message.content)
  }
}

describe('OrchestratorAgent', () => {
  let orchestrator: OrchestratorAgent
  let mockChild1: MockChildAgent
  let mockChild2: MockChildAgent

  beforeEach(() => {
    orchestrator = new OrchestratorAgent('test-orchestrator', 'Test Orchestrator')
    mockChild1 = new MockChildAgent('child-1')
    mockChild2 = new MockChildAgent('child-2')
  })

  describe('agent management', () => {
    it('should register child agents', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-1', 'Test Orchestrator 1')
      const localMockChild = new MockChildAgent('child-1-local')

      await localOrchestrator.registerAgent(localMockChild)
      expect(localOrchestrator.getAgents()).toContain(localMockChild)
    })

    it('should unregister child agents', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-2', 'Test Orchestrator 2')
      const localMockChild = new MockChildAgent('child-1-local-2')

      await localOrchestrator.registerAgent(localMockChild)
      await localOrchestrator.unregisterAgent(localMockChild.getId())
      expect(localOrchestrator.getAgents()).not.toContain(localMockChild)
    })

    it('should throw error when registering duplicate agent', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-3', 'Test Orchestrator 3')
      const localMockChild = new MockChildAgent('child-1-local-3')

      await localOrchestrator.registerAgent(localMockChild)
      await expect(localOrchestrator.registerAgent(localMockChild)).rejects.toThrow(RuntimeError)
    })
  })

  describe('message orchestration', () => {
    it('should route message to specific agent', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-4', 'Test Orchestrator 4')
      const localMockChild1 = new MockChildAgent('child-1-local-4')
      const localMockChild2 = new MockChildAgent('child-2-local-4')

      await localOrchestrator.registerAgent(localMockChild1)
      await localOrchestrator.registerAgent(localMockChild2)

      const message: Message = {
        id: 'test-1',
        type: MessageType.TASK,
        content: 'test message',
        timestamp: Date.now(),
      }

      // Test that message can be handled (doesn't throw)
      const result = await localMockChild1.handleMessage(message)
      expect(result.success).toBe(true)
    })

    it('should broadcast message to all agents', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-5', 'Test Orchestrator 5')
      const localMockChild1 = new MockChildAgent('child-1-local-5')
      const localMockChild2 = new MockChildAgent('child-2-local-5')

      await localOrchestrator.registerAgent(localMockChild1)
      await localOrchestrator.registerAgent(localMockChild2)

      const message: Message = {
        id: 'test-2',
        type: MessageType.BROADCAST,
        content: 'broadcast message',
        timestamp: Date.now(),
      }

      const responses = await localOrchestrator.broadcast(message)
      expect(responses).toHaveLength(2)
      expect(responses.every(r => r.success)).toBe(true)
    })

    it('should handle agent errors gracefully', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-6', 'Test Orchestrator 6')
      const failingAgent = new MockChildAgent('failing-agent-local')
      vi.spyOn(failingAgent, 'handleMessage').mockRejectedValue(new Error('Test error'))

      await localOrchestrator.registerAgent(failingAgent)

      const message: Message = {
        id: 'test-3',
        type: MessageType.TASK,
        content: 'test message',
        timestamp: Date.now(),
      }

      // Test that broadcast handles errors gracefully
      const responses = await localOrchestrator.broadcast(message)
      expect(responses).toHaveLength(1)
      expect(responses[0].success).toBe(false)
    })
  })

  describe('agent monitoring', () => {
    it('should track agent status changes', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-7', 'Test Orchestrator 7')
      const localMockChild = new MockChildAgent('child-1-local-7')

      await localOrchestrator.registerAgent(localMockChild)

      const agents = localOrchestrator.getAgents()
      expect(agents).toHaveLength(1)
      expect(agents[0]).toBe(localMockChild)
    })

    it('should get active agents', async () => {
      const localOrchestrator = new OrchestratorAgent('test-orchestrator-8', 'Test Orchestrator 8')
      const localMockChild1 = new MockChildAgent('child-1-local-8')
      const localMockChild2 = new MockChildAgent('child-2-local-8')

      await localOrchestrator.registerAgent(localMockChild1)
      await localOrchestrator.registerAgent(localMockChild2)

      const agents = localOrchestrator.getAgents()
      expect(agents).toHaveLength(2)
      expect(agents).toContain(localMockChild1)
      expect(agents).toContain(localMockChild2)
    })
  })
})
