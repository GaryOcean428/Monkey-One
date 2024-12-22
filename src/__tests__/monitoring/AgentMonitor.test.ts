import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AgentMonitor } from '@/lib/monitoring/AgentMonitor';
import { Agent, AgentStatus, AgentType, Message, MessageType } from '@/types';
import { RuntimeError } from '@/lib/errors/AgentErrors';

vi.mock('../../lib/memory');

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
    // Mock implementation
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

describe('AgentMonitor', () => {
  let monitor: AgentMonitor
  let mockAgent: Agent
  let mockMessage: Message

  beforeEach(() => {
    monitor = new AgentMonitor()
    mockAgent = new MockAgent(
      'test-agent',
      AgentType.BASE,
      AgentStatus.IDLE,
      ['test']
    )
    mockMessage = {
      id: 'msg-1',
      type: MessageType.COMMAND,
      sender: 'test-agent',
      recipient: 'other-agent',
      content: 'test content',
      timestamp: Date.now()
    }
  })

  describe('agent registration', () => {
    it('should register new agent', () => {
      monitor.registerAgent(mockAgent)
      const metrics = monitor.getAgentMetrics(mockAgent.id)
      
      expect(metrics).toBeDefined()
      expect(metrics.messageCount).toBe(0)
      expect(metrics.status).toBe(AgentStatus.IDLE)
    })

    it('should throw error when registering duplicate agent', () => {
      monitor.registerAgent(mockAgent)
      expect(() => monitor.registerAgent(mockAgent)).toThrow(RuntimeError)
    })

    it('should unregister agent', () => {
      monitor.registerAgent(mockAgent)
      monitor.unregisterAgent(mockAgent.id)
      expect(() => monitor.getAgentMetrics(mockAgent.id)).toThrow(RuntimeError)
    })
  })

  describe('message tracking', () => {
    beforeEach(() => {
      monitor.registerAgent(mockAgent)
    })

    it('should track command message', () => {
      monitor.trackMessage(mockMessage)
      const metrics = monitor.getAgentMetrics(mockAgent.id)
      
      expect(metrics.messageCount).toBe(1)
      expect(metrics.errorCount).toBe(0)
    })

    it('should track error message', () => {
      const errorMessage = { ...mockMessage, type: MessageType.ERROR }
      monitor.trackMessage(errorMessage)
      const metrics = monitor.getAgentMetrics(mockAgent.id)
      
      expect(metrics.messageCount).toBe(1)
      expect(metrics.errorCount).toBe(1)
    })

    it('should calculate response time', () => {
      // Send command
      monitor.trackMessage(mockMessage)

      // Simulate delay
      vi.advanceTimersByTime(100)

      // Send response
      const responseMessage: Message = {
        id: 'msg-2',
        type: MessageType.RESPONSE,
        sender: 'test-agent',
        recipient: 'other-agent',
        content: 'response',
        timestamp: Date.now(),
        metadata: {
          originalMessageId: mockMessage.id
        }
      }
      monitor.trackMessage(responseMessage)

      const metrics = monitor.getAgentMetrics(mockAgent.id)
      expect(metrics.averageResponseTime).toBeGreaterThan(0)
    })

    it('should throw error when tracking message from unregistered agent', () => {
      const unregisteredMessage = { ...mockMessage, sender: 'unknown-agent' }
      expect(() => monitor.trackMessage(unregisteredMessage)).toThrow(RuntimeError)
    })
  })

  describe('status management', () => {
    beforeEach(() => {
      monitor.registerAgent(mockAgent)
    })

    it('should update agent status', () => {
      monitor.updateAgentStatus(mockAgent.id, AgentStatus.BUSY)
      const metrics = monitor.getAgentMetrics(mockAgent.id)
      expect(metrics.status).toBe(AgentStatus.BUSY)
    })

    it('should throw error when updating status of unregistered agent', () => {
      expect(() => 
        monitor.updateAgentStatus('unknown-agent', AgentStatus.BUSY)
      ).toThrow(RuntimeError)
    })
  })

  describe('metrics and statistics', () => {
    beforeEach(() => {
      monitor.registerAgent(mockAgent)
      monitor.trackMessage(mockMessage)
    })

    it('should provide monitoring stats', () => {
      const stats = monitor.getMonitoringStats()
      
      expect(stats.totalMessages).toBe(1)
      expect(stats.totalErrors).toBe(0)
      expect(stats.agentMetrics[mockAgent.id]).toBeDefined()
    })

    it('should get active agents', () => {
      monitor.updateAgentStatus(mockAgent.id, AgentStatus.BUSY)
      const activeAgents = monitor.getActiveAgents()
      
      expect(activeAgents).toHaveLength(1)
      expect(activeAgents[0].id).toBe(mockAgent.id)
    })

    it('should get idle agents', () => {
      const idleAgents = monitor.getIdleAgents()
      expect(idleAgents).toHaveLength(1)
      expect(idleAgents[0].id).toBe(mockAgent.id)
    })

    it('should get errored agents', () => {
      monitor.updateAgentStatus(mockAgent.id, AgentStatus.ERROR)
      const erroredAgents = monitor.getErroredAgents()
      
      expect(erroredAgents).toHaveLength(1)
      expect(erroredAgents[0].id).toBe(mockAgent.id)
    })
  })

  describe('metrics clearing', () => {
    beforeEach(() => {
      monitor.registerAgent(mockAgent)
      monitor.trackMessage(mockMessage)
    })

    it('should clear metrics for specific agent', () => {
      monitor.clearMetrics(mockAgent.id)
      const metrics = monitor.getAgentMetrics(mockAgent.id)
      
      expect(metrics.messageCount).toBe(0)
      expect(metrics.errorCount).toBe(0)
      expect(metrics.averageResponseTime).toBe(0)
    })

    it('should clear all metrics', () => {
      monitor.clearAllMetrics()
      const stats = monitor.getMonitoringStats()
      
      expect(stats.totalMessages).toBe(0)
      expect(stats.totalErrors).toBe(0)
    })

    it('should throw error when clearing metrics for unregistered agent', () => {
      expect(() => monitor.clearMetrics('unknown-agent')).toThrow(RuntimeError)
    })
  })
})
