import { BaseAgent } from '../base';
import { Message, MessageType } from '../../../types';
import { memoryManager } from '../../memory';

interface SignalRoute {
  sourceId: string;
  targetId: string;
  priority: number;
  filter: (message: Message) => boolean;
}

interface SignalMetrics {
  throughput: number;
  latency: number;
  errorRate: number;
  lastUpdated: number;
}

export class ThalamusAgent extends BaseAgent {
  private routes: Map<string, SignalRoute> = new Map();
  private metrics: Map<string, SignalMetrics> = new Map();
  private readonly DEFAULT_PRIORITY = 0.5;
  private readonly HIGH_LOAD_THRESHOLD = 0.8;
  private readonly METRICS_UPDATE_INTERVAL = 5000; // 5 seconds
  private metricsTimer: NodeJS.Timeout;

  constructor(id: string, name: string) {
    super(id, name, 'thalamus', [
      'signal_routing',
      'information_filtering',
      'attention_regulation',
      'sensory_integration'
    ]);
    this.initializeThalamus();
  }

  private initializeThalamus() {
    this.setupDefaultRoutes();
    this.startMetricsCollection();
  }

  private setupDefaultRoutes() {
    // Set up default routing paths
    this.addRoute({
      sourceId: 'sensory_input',
      targetId: 'cortex',
      priority: 0.8,
      filter: (message) => this.isSensoryInput(message)
    });

    this.addRoute({
      sourceId: 'emotional_input',
      targetId: 'limbic',
      priority: 0.7,
      filter: (message) => this.isEmotionalContent(message)
    });
  }

  private startMetricsCollection() {
    this.metricsTimer = setInterval(() => {
      this.updateMetrics();
    }, this.METRICS_UPDATE_INTERVAL);
  }

  async processMessage(message: Message): Promise<Message> {
    const startTime = Date.now();
    try {
      // Route determination
      const route = this.determineRoute(message);
      
      if (!route) {
        return super.createResponse('No suitable route found for message');
      }

      // Apply filtering
      if (!route.filter(message)) {
        return super.createResponse('Message filtered out by routing rules');
      }

      // Process and forward message
      const processedMessage = await this.processAndForward(message, route);
      
      // Update metrics including latency
      const latency = Date.now() - startTime;
      this.updateRouteMetrics(route.sourceId, route.targetId, latency);

      return processedMessage;
    } catch (error) {
      console.error('Error in ThalamusAgent:', error);
      const latency = Date.now() - startTime;
      this.updateErrorMetrics(message, latency);
      return super.createResponse(
        'Error processing message routing'
      );
    }
  }

  private determineRoute(message: Message): SignalRoute | null {
    let bestRoute: SignalRoute | null = null;
    let highestPriority = -1;

    this.routes.forEach(route => {
      if (route.filter(message) && route.priority > highestPriority) {
        highestPriority = route.priority;
        bestRoute = route;
      }
    });

    return bestRoute;
  }

  private async processAndForward(message: Message, route: SignalRoute): Promise<Message> {
    const startTime = Date.now();

    try {
      // Apply signal processing
      const processedContent = this.processSignal(message.content);

      // Forward to target
      const forwardedMessage: Message = {
        id: crypto.randomUUID(),
        type: MessageType.TASK,
        content: processedContent,
        sender: this.id,
        recipient: route.targetId,
        timestamp: Date.now(),
        status: 'sent',
        role: 'system'
      };

      await this.forwardToTarget(route.targetId, forwardedMessage);

      return super.createResponse(
        `Message successfully routed from ${route.sourceId} to ${route.targetId}`,
        {
          routeInfo: `${route.sourceId}-${route.targetId}`,
          processingTime: Date.now() - startTime
        }
      );
    } catch (error) {
      const latency = Date.now() - startTime;
      this.updateErrorMetrics(message, latency);
      throw error;
    }
  }

  private processSignal(content: string): string {
    // Apply signal processing rules
    return content.trim();
  }

  private async forwardToTarget(targetId: string, message: Message) {
    await memoryManager.add({
      type: 'routed_message',
      content: JSON.stringify(message),
      tags: ['routing', targetId]
    });
  }

  private updateMetric(routeKey: string, latency: number, isError: boolean = false) {
    const currentMetrics = this.metrics.get(routeKey) || {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    };

    const newThroughput = currentMetrics.throughput + 1;
    const newLatency = (currentMetrics.latency * currentMetrics.throughput + latency) / newThroughput;
    const newErrorRate = isError
      ? (currentMetrics.errorRate * currentMetrics.throughput + 1) / newThroughput
      : currentMetrics.errorRate;

    this.metrics.set(routeKey, {
      throughput: newThroughput,
      latency: newLatency,
      errorRate: newErrorRate,
      lastUpdated: Date.now()
    });
  }

  private updateRouteMetrics(sourceId: string, targetId: string, latency: number) {
    this.updateMetric(`${sourceId}-${targetId}`, latency);
  }

  private updateErrorMetrics(message: Message, latency: number) {
    const route = this.determineRoute(message);
    if (route) {
      this.updateMetric(`${route.sourceId}-${route.targetId}`, latency, true);
    }
  }

  private updateMetrics() {
    this.metrics.forEach((metrics, routeKey) => {
      const timeSinceUpdate = (Date.now() - metrics.lastUpdated) / 1000;
      
      // Decay metrics over time
      const decayFactor = Math.exp(-timeSinceUpdate / 60);
      metrics.throughput *= decayFactor;
      metrics.errorRate *= decayFactor;
      
      // Check for high load
      if (metrics.throughput > this.HIGH_LOAD_THRESHOLD) {
        this.handleHighLoad(routeKey);
      }

      // Update timestamp
      metrics.lastUpdated = Date.now();
    });
  }

  /**
   * Handle high load condition by temporarily reducing the priority of the route.
   * 
   * @param routeKey the key of the route to be updated
   */
  private handleHighLoad(routeKey: string) {
    const [sourceId, targetId] = routeKey.split('-');
    const route = this.routes.get(routeKey);
    
    if (route) {
      // Temporarily reduce priority to prevent overload
      route.priority *= 0.8;
      
      // Schedule priority recovery after 30 seconds
      setTimeout(() => {
        if (route.priority < this.DEFAULT_PRIORITY) {
          route.priority = this.DEFAULT_PRIORITY;
        }
      }, 30000);
    }
  }

  addRoute(route: SignalRoute) {
    const routeKey = `${route.sourceId}-${route.targetId}`;
    this.routes.set(routeKey, route);
    this.metrics.set(routeKey, {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    });
  }

  removeRoute(sourceId: string, targetId: string) {
    const routeKey = `${sourceId}-${targetId}`;
    this.routes.delete(routeKey);
    this.metrics.delete(routeKey);
  }

  private isSensoryInput(message: Message): boolean {
    return message.type === MessageType.TASK &&
           (message.content.includes('see') ||
            message.content.includes('hear') ||
            message.content.includes('feel'));
  }

  private isEmotionalContent(message: Message): boolean {
    const emotionalKeywords = [
      'happy', 'sad', 'angry', 'afraid',
      'excited', 'worried', 'love', 'hate'
    ];
    
    return emotionalKeywords.some(keyword => 
      message.content.toLowerCase().includes(keyword)
    );
  }

  getRouteMetrics(sourceId: string, targetId: string): SignalMetrics | null {
    return this.metrics.get(`${sourceId}-${targetId}`) || null;
  }

  cleanup(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
  }
}
