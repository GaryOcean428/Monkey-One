import type { Message, AgentMetrics, AgentStatus } from '../types/core'
import { logger } from '../../utils/logger'
import { Mutex } from 'async-mutex'
import { captureException } from '../../utils/sentry'
import { agentProcessingTime } from '../../utils/metrics'

export class AgentMonitor {
  private messageLog = new Map<string, Message[]>()
  private metrics = new Map<string, AgentMetrics>()
  private metricsLock = new Mutex()
  private static readonly MAX_MESSAGES = 1000
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
  private cleanupTimer: ReturnType<typeof setInterval>

  constructor() {
    this.cleanupTimer = setInterval(
      () => this.clearOldData(AgentMonitor.CLEANUP_INTERVAL),
      AgentMonitor.CLEANUP_INTERVAL
    )
  }

  async trackMessage(message: Message): Promise<void> {
    if (!message.id || !message.type || !message.content) {
      throw new Error('Invalid message: missing required fields')
    }

    const agentId = message.metadata?.sender as string ?? 'unknown'

    try {
      await this.metricsLock.acquire()
      if (!this.messageLog.has(agentId)) {
        this.messageLog.set(agentId, [])
      }

      const messages = this.messageLog.get(agentId)!
      messages.push(message)

      if (messages.length > AgentMonitor.MAX_MESSAGES) {
        messages.shift()
      }

      // Update metrics
      const metrics = await this.getAgentMetrics(agentId)
      metrics.messageCount++
      metrics.lastActive = Date.now()

      // Record processing time
      agentProcessingTime.observe(
        { agent_type: agentId, operation: 'message_processing' },
        Date.now() - message.timestamp
      )
    } catch (error) {
      logger.error(`Failed to track message for agent ${agentId}:`, error)
      captureException(error as Error, { agentId, messageId: message.id })
      throw error
    } finally {
      this.metricsLock.release()
    }
  }

  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    try {
      await this.metricsLock.acquire()
      if (!this.metrics.has(agentId)) {
        this.metrics.set(agentId, {
          messageCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
          status: 'available' as AgentStatus,
          lastActive: Date.now(),
          successRate: 1.0,
        })
      }
      return this.metrics.get(agentId)!
    } catch (error) {
      logger.error(`Failed to get metrics for agent ${agentId}:`, error)
      captureException(error as Error, { agentId })
      throw new Error(`Failed to get metrics for agent ${agentId}: ${error}`)
    } finally {
      this.metricsLock.release()
    }
  }

  private clearOldData(threshold: number): void {
    const now = Date.now()

    try {
      // Clear old messages
      for (const [agentId, messages] of this.messageLog.entries()) {
        this.messageLog.set(
          agentId,
          messages.filter(msg => msg.timestamp > now - threshold)
        )
      }

      // Clear old metrics
      for (const [agentId, metrics] of this.metrics.entries()) {
        if (metrics.lastActive < now - threshold) {
          this.metrics.delete(agentId)
        }
      }

      logger.debug('Cleared old monitoring data', { threshold })
    } catch (error) {
      logger.error('Failed to clear old data:', error)
      captureException(error as Error)
    }
  }

  // Legacy methods for backward compatibility with tests
  registerAgent(agent: unknown): void {
    // Stub for backward compatibility
    logger.debug('registerAgent called (legacy method)')
  }

  unregisterAgent(agentId: string): void {
    // Stub for backward compatibility
    this.metrics.delete(agentId)
    this.messageLog.delete(agentId)
  }

  updateAgentStatus(agentId: string, status: AgentStatus): void {
    // Stub for backward compatibility
    const metrics = this.metrics.get(agentId)
    if (metrics) {
      metrics.status = status
    }
  }

  getMonitoringStats(): unknown {
    // Stub for backward compatibility
    return {
      totalAgents: this.metrics.size,
      totalMessages: Array.from(this.messageLog.values()).reduce((sum, msgs) => sum + msgs.length, 0),
    }
  }

  getActiveAgents(): string[] {
    // Stub for backward compatibility
    return Array.from(this.metrics.entries())
      .filter(([_, m]) => m.status === 'active' || m.status === 'busy')
      .map(([id]) => id)
  }

  getIdleAgents(): string[] {
    // Stub for backward compatibility
    return Array.from(this.metrics.entries())
      .filter(([_, m]) => m.status === 'idle' || m.status === 'available')
      .map(([id]) => id)
  }

  getErroredAgents(): string[] {
    // Stub for backward compatibility
    return Array.from(this.metrics.entries())
      .filter(([_, m]) => m.status === 'error')
      .map(([id]) => id)
  }

  clearMetrics(agentId: string): void {
    // Stub for backward compatibility
    const metrics = this.metrics.get(agentId)
    if (metrics) {
      metrics.messageCount = 0
      metrics.errorCount = 0
      metrics.averageResponseTime = 0
    }
  }

  clearAllMetrics(): void {
    // Stub for backward compatibility
    this.metrics.clear()
    this.messageLog.clear()
  }

  dispose(): void {
    clearInterval(this.cleanupTimer)
    this.messageLog.clear()
    this.metrics.clear()
    logger.info('AgentMonitor disposed')
  }
}
