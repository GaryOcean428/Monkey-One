import { BaseAgent } from '../base';
import type { Message } from '@/types';
import { memoryManager } from '@/lib/memory';

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
    setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Route determination
      const route = this.determineRoute(message);
      
      if (!route) {
        return this.createResponse('No suitable route found for message');
      }

      // Apply filtering
      if (!route.filter(message)) {
        return this.createResponse('Message filtered out by routing rules');
      }

      // Process and forward message
      const processedMessage = await this.processAndForward(message, route);
      
      // Update metrics
      this.updateRouteMetrics(route.sourceId, route.targetId);

      return processedMessage;
    } catch (error) {
      console.error('Error in ThalamusAgent:', error);
      return this.createResponse(
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
      await this.forwardToTarget(route.targetId, {
        ...message,
        content: processedContent,
        metadata: {
          ...message.metadata,
          routedBy: this.id,
          routeId: `${route.sourceId}-${route.targetId}`,
          processingTime: Date.now() - startTime
        }
      });

      return this.createResponse(
        `Message successfully routed from ${route.sourceId} to ${route.targetId}`
      );
    } catch (error) {
      this.updateErrorMetrics(route.sourceId, route.targetId);
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

  private updateRouteMetrics(sourceId: string, targetId: string) {
    const routeKey = `${sourceId}-${targetId}`;
    const currentMetrics = this.metrics.get(routeKey) || {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    };

    this.metrics.set(routeKey, {
      ...currentMetrics,
      throughput: currentMetrics.throughput + 1,
      lastUpdated: Date.now()
    });
  }

  private updateErrorMetrics(sourceId: string, targetId: string) {
    const routeKey = `${sourceId}-${targetId}`;
    const currentMetrics = this.metrics.get(routeKey) || {
      throughput: 0,
      latency: 0,
      errorRate: 0,
      lastUpdated: Date.now()
    };

    this.metrics.set(routeKey, {
      ...currentMetrics,
      errorRate: (currentMetrics.errorRate * currentMetrics.throughput + 1) / 
                (currentMetrics.throughput + 1),
      lastUpdated: Date.now()
    });
  }

  private updateMetrics() {
    this.metrics.forEach((metrics, routeKey) => {
      const timeSinceUpdate = (Date.now() - metrics.lastUpdated) / 1000;
      
      // Decay throughput over time
      metrics.throughput *= Math.exp(-timeSinceUpdate / 60);
      
      // Check for high load
      if (metrics.throughput > this.HIGH_LOAD_THRESHOLD) {
        this.handleHighLoad(routeKey);
      }
    });
  }

  private handleHighLoad(routeKey: string) {
    const [sourceId, targetId] = routeKey.split('-');
    const route = this.routes.get(routeKey);
    
    if (route) {
      // Temporarily reduce priority
      route.priority *= 0.8;
      
      // Schedule priority recovery
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
    return message.metadata?.type === 'sensory' ||
           message.content.includes('see') ||
           message.content.includes('hear') ||
           message.content.includes('feel');
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
}