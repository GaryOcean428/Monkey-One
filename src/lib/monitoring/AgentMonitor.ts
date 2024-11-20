import type { Message, AgentMetrics } from '../../types';

export class AgentMonitor {
  private messageLog: Map<string, Message[]> = new Map();
  private metrics: Map<string, AgentMetrics> = new Map();

  trackMessage(message: Message): void {
    // Store message in log
    const agentId = message.metadata?.agentId || 'unknown';
    if (!this.messageLog.has(agentId)) {
      this.messageLog.set(agentId, []);
    }
    this.messageLog.get(agentId)?.push(message);
  }

  startOperation(name: string): void {
    console.log(`Starting operation: ${name}`);
  }

  endOperation(name: string, metrics: Record<string, unknown> = {}): void {
    console.log(`Ending operation: ${name}`, metrics);
  }

  getAgentMetrics(agentId: string): AgentMetrics {
    if (!this.metrics.has(agentId)) {
      // Initialize default metrics
      this.metrics.set(agentId, {
        totalMessages: 0,
        averageResponseTime: 0,
        successRate: 0,
        lastActive: Date.now(),
        status: 'active'
      });
    }
    return this.metrics.get(agentId)!;
  }
}