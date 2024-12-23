import type { Message, AgentMetrics } from '../../types';
import { Logger } from '../../utils/logger';
import { Mutex } from 'async-mutex';
import { captureException } from '../../utils/sentry';
import { agentProcessingTime } from '../../utils/metrics';

/**
 * AgentMonitor tracks and analyzes agent behavior, performance, and message handling.
 * It provides metrics and monitoring capabilities for the agent system.
 */
export class AgentMonitor {
  private static readonly MAX_MESSAGES = 1000;
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  private messageLog = new Map<string, Message[]>();
  private metrics = new Map<string, AgentMetrics>();
  private metricsLock = new Mutex();
  private logger: Logger;
  private cleanupTimer: ReturnType<typeof setInterval>;

  /**
   * Creates a new instance of AgentMonitor.
   * @param logger - Logger instance for monitoring events
   */
  constructor(logger: Logger) {
    this.logger = logger;
    // Setup periodic cleanup
    this.cleanupTimer = setInterval(
      () => this.clearOldData(AgentMonitor.CLEANUP_INTERVAL), 
      AgentMonitor.CLEANUP_INTERVAL
    );
  }

  /**
   * Tracks a message by storing it in the message log for the sender.
   * @param message - The message to track
   * @throws Error if message is missing required fields
   */
  async trackMessage(message: Message): Promise<void> {
    // Validate required fields
    if (!message.id || !message.role || !message.content) {
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

      // Implement message queue size limit
      if (messages.length > AgentMonitor.MAX_MESSAGES) {
        messages.shift(); // Remove oldest message when limit reached
      }

      // Record metrics
      agentProcessingTime.observe(
        { agent_type: agentId, operation: 'message_processing' },
        Date.now() - message.timestamp
      );
    } catch (error) {
      this.logger.error(`Failed to track message for agent ${agentId}:`, error);
      captureException(error as Error, { agentId, messageId: message.id });
      throw error;
    } finally {
      this.metricsLock.release();
    }
  }

  /**
   * Logs the start of an operation for monitoring purposes.
   * @param name - Name of the operation being started
   */
  startOperation(name: string): void {
    this.logger.info(`Starting operation: ${name}`);
  }

  /**
   * Logs the end of an operation with optional metrics.
   * @param name - Name of the operation being completed
   * @param metrics - Optional metrics about the operation
   */
  endOperation(name: string, metrics: Record<string, unknown> = {}): void {
    this.logger.info(`Ending operation: ${name}`, { metrics });
  }

  /**
   * Gets metrics for an agent, initializing default values if needed.
   * @param agentId - ID of the agent to get metrics for
   * @returns Promise resolving to agent metrics
   * @throws Error if unable to get metrics
   */
  async getAgentMetrics(agentId: string): Promise<AgentMetrics> {
    try {
      await this.metricsLock.acquire();
      if (!this.metrics.has(agentId)) {
        this.metrics.set(agentId, {
          totalMessages: 0,
          averageResponseTime: 0,
          successRate: 0,
          lastActive: Date.now(),
          status: 'active'
        });
      }
      return this.metrics.get(agentId)!;
    } catch (error) {
      this.logger.error(`Failed to get metrics for agent ${agentId}:`, error);
      captureException(error as Error, { agentId });
      throw new Error(`Failed to get metrics for agent ${agentId}: ${error}`);
    } finally {
      this.metricsLock.release();
    }
  }

  /**
   * Safely converts a timestamp to a number.
   * @param timestamp - Timestamp to convert
   * @returns Timestamp as number in milliseconds
   */
  private getTimestampNumber(timestamp: number | Date | undefined): number {
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    return Date.now(); // fallback to current time if undefined
  }

  /**
   * Clears old data based on the provided time threshold.
   * @param threshold - Time threshold in milliseconds
   */
  private clearOldData(threshold: number): void {
    const now = Date.now();
    
    try {
      // Clear old messages
      for (const [agentId, messages] of this.messageLog.entries()) {
        this.messageLog.set(
          agentId, 
          messages.filter(msg => this.getTimestampNumber(msg.timestamp) > now - threshold)
        );
      }

      // Clear old metrics
      for (const [agentId, metrics] of this.metrics.entries()) {
        if (metrics.lastActive < now - threshold) {
          this.metrics.delete(agentId);
        }
      }

      this.logger.debug('Cleared old monitoring data', { threshold });
    } catch (error) {
      this.logger.error('Failed to clear old data:', error);
      captureException(error as Error);
    }
  }

  /**
   * Cleanup resources when monitor is no longer needed.
   */
  dispose(): void {
    clearInterval(this.cleanupTimer);
    this.messageLog.clear();
    this.metrics.clear();
    this.logger.info('AgentMonitor disposed');
  }
}
