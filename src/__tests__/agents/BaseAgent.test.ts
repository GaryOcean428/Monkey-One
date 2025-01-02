import { expect, describe, it, beforeEach, vi } from 'vitest'
import { BaseAgent } from '../../lib/agents/base/BaseAgent'
import { AgentType, AgentStatus, AgentCapability } from '../../lib/types/core'

describe('BaseAgent', () => {
  let agent: BaseAgent
  const mockCapability: AgentCapability = {
    name: 'test',
    description: 'Test capability',
    version: '1.0.0',
    parameters: {
      type: 'object',
      properties: {
        test: { type: 'string' },
      },
    },
  }

  beforeEach(() => {
    agent = new BaseAgent('test-agent', 'Test Agent')
    vi.clearAllMocks()
  })

  it('initializes with correct properties', () => {
    expect(agent.id).toBe('test-agent')
    expect(agent.name).toBe('Test Agent')
    expect(agent.type).toBe(AgentType.SPECIALIST)
    expect(agent.status).toBe(AgentStatus.AVAILABLE)
    expect(agent.capabilities.size).toBe(0)
    expect(agent.getMetrics()).toEqual({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastResponseTime: 0,
      uptime: expect.any(Number),
      memoryUsage: expect.any(Object),
    })
  })

  it('handles capabilities correctly', () => {
    agent.addCapability(mockCapability)
    expect(agent.hasCapability('test')).toBe(true)
    expect(agent.getCapabilities()).toContainEqual(mockCapability)

    agent.removeCapability('test')
    expect(agent.hasCapability('test')).toBe(false)
    expect(agent.getCapabilities()).toEqual([])
  })

  it('updates status correctly', () => {
    agent.setStatus(AgentStatus.BUSY)
    expect(agent.status).toBe(AgentStatus.BUSY)

    agent.setStatus(AgentStatus.ERROR)
    expect(agent.status).toBe(AgentStatus.ERROR)

    agent.setStatus(AgentStatus.AVAILABLE)
    expect(agent.status).toBe(AgentStatus.AVAILABLE)
  })

  it('tracks metrics correctly', async () => {
    const _startTime = Date.now()

    // Simulate successful request
    await agent.handleRequest('test', { test: 'data' })
    let metrics = agent.getMetrics()
    expect(metrics.totalRequests).toBe(1)
    expect(metrics.successfulRequests).toBe(1)
    expect(metrics.failedRequests).toBe(0)
    expect(metrics.lastResponseTime).toBeGreaterThan(0)
    expect(metrics.uptime).toBeGreaterThanOrEqual(0)

    // Simulate failed request
    try {
      await agent.handleRequest('invalid', {})
    } catch (error) {
      // Expected error
    }
    metrics = agent.getMetrics()
    expect(metrics.totalRequests).toBe(2)
    expect(metrics.successfulRequests).toBe(1)
    expect(metrics.failedRequests).toBe(1)
  })

  it('handles concurrent requests correctly', async () => {
    agent.addCapability(mockCapability)

    const requests = Array(5)
      .fill(null)
      .map(() => agent.handleRequest('test', { test: 'concurrent' }))

    await Promise.all(requests)

    const metrics = agent.getMetrics()
    expect(metrics.totalRequests).toBe(5)
    expect(agent.status).toBe(AgentStatus.AVAILABLE)
  })

  it('handles memory cleanup correctly', () => {
    const mockCleanup = vi.fn()
    agent.onMemoryCleanup(mockCleanup)

    // Trigger memory cleanup
    agent.cleanupMemory()

    expect(mockCleanup).toHaveBeenCalled()
  })

  it('validates capability parameters', () => {
    agent.addCapability(mockCapability)

    expect(() => agent.validateParameters('test', { test: 123 })).toThrow()

    expect(() => agent.validateParameters('test', { test: 'valid' })).not.toThrow()
  })
})
