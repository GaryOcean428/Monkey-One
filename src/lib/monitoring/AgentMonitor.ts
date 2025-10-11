import { Mutex } from 'async-mutex';
import type { AgentStatus, Message } from '../../types';
import { logger } from '../../utils/logger';
import { agentProcessingTime } from '../../utils/metrics';
import { captureException } from '../../utils/sentry';

interface AgentMonitoringMetrics {
  messageCount: number;
  errorCount: number;
  averageResponseTime: number;
  status: AgentStatus;
  lastActive: number;
  successRate: number;
}

export class AgentMonitor {
  private messageLog = new Map<string, Message[]>();
  private metrics = new Map<string, AgentMonitoringMetrics>();
  private metricsLock = new Mutex();
  private static readonly MAX_MESSAGES = 1000;
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(
      () => this.clearOldData(AgentMonitor.CLEANUP_INTERVAL),
      AgentMonitor.CLEANUP_INTERVAL
    );
  }

  async trackMessage(message: Message): Promise<void> {
    if (!message.id || !message.content) {
      throw new Error('Invalid message: missing required fields');
    }

    const agentId = message.sender ?? 'unknown';

    try {
      await this.metricsLock.acquire();
      if (!this.messageLog.has(agentId)) {
        this.messageLog.set(agentId, []);
      }

      const messages = this.messageLog.get(agentId)!;
      messages.push(message);

      if (messages.length > AgentMonitor.MAX_MESSAGES) {
        messages.shift();
      }

      // Update metrics
      const metrics = await this.getAgentMetrics(agentId);
      metrics.messageCount++;
      metrics.lastActive = Date.now();

      // Record processing time
      if (agentProcessingTime && message.timestamp != null) {
        const timestamp =
          typeof message.timestamp === 'number'
            ? message.timestamp
            : message.timestamp.valueOf();
        agentProcessingTime.observe(
          { agent_type: agentId, operation: 'message_processing' },
          Date.now() - timestamp
        );
      }
    } catch (error) {
      logger.error(`Failed to track message for agent ${agentId}:`, error);
      captureException(error as Error, { agentId, messageId: message.id });
      throw error;
    } finally {
      this.metricsLock.release();
    }
  }

  async getAgentMetrics(agentId: string): Promise<AgentMonitoringMetrics> {
    try {
      await this.metricsLock.acquire();
      if (!this.metrics.has(agentId)) {
        this.metrics.set(agentId, {
          messageCount: 0,
          errorCount: 0,
          averageResponseTime: 0,
          status: AgentStatus.AVAILABLE,
          lastActive: Date.now(),
          successRate: 1.0
        });
      }
      return this.metrics.get(agentId)!;
    } catch (error) {
      logger.error(`Failed to get metrics for agent ${agentId}:`, error);
      captureException(error as Error, { agentId });
      throw new Error(`Failed to get metrics for agent ${agentId}: ${error}`);
    } finally {
      this.metricsLock.release();
    }
  }

  private clearOldData(threshold: number): void {
    const now = Date.now();

    try {
      // Clear old messages
      for (const [agentId, messages] of this.messageLog.entries()) {
        this.messageLog.set(
          agentId,
          messages.filter(msg => {
            if (msg.timestamp == null) {
              return true;
            }
            const timestamp = typeof msg.timestamp === 'number'
              ? msg.timestamp
              : msg.timestamp.valueOf();
            return timestamp > now - threshold;
          })
        );
      }

      // Clear old metrics
      for (const [agentId, metrics] of this.metrics.entries()) {
        if (metrics.lastActive < now - threshold) {
          this.metrics.delete(agentId);
        }
      }

      logger.debug('Cleared old monitoring data', { threshold });
    } catch (error) {
      logger.error('Failed to clear old data:', error);
      captureException(error as Error);
    }
  }

  dispose(): void {
    clearInterval(this.cleanupTimer);
    this.messageLog.clear();
    this.metrics.clear();
    logger.info('AgentMonitor disposed');
  }
}
