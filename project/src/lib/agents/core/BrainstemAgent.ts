import { BaseAgent } from '../base';
import type { Message } from '@/types';
import { memoryManager } from '@/lib/memory';

interface VitalSign {
  type: 'heartRate' | 'respiration' | 'arousal' | 'attention';
  value: number;
  timestamp: number;
}

interface SystemState {
  vitalSigns: VitalSign[];
  alertness: number;
  stability: number;
  resourceUtilization: number;
}

export class BrainstemAgent extends BaseAgent {
  private systemState: SystemState;
  private readonly ALERT_THRESHOLD = 0.7;
  private readonly UPDATE_INTERVAL = 1000; // 1 second
  private updateTimer: NodeJS.Timer;

  constructor(id: string, name: string) {
    super(id, name, 'brainstem', [
      'vital_regulation',
      'arousal_control',
      'reflex_coordination',
      'homeostasis'
    ]);

    this.systemState = {
      vitalSigns: [],
      alertness: 0.5,
      stability: 1.0,
      resourceUtilization: 0.0
    };

    this.initializeBrainstem();
  }

  private initializeBrainstem() {
    this.startVitalMonitoring();
    this.initializeReflexes();
  }

  private startVitalMonitoring() {
    this.updateTimer = setInterval(() => {
      this.updateVitalSigns();
      this.checkSystemState();
    }, this.UPDATE_INTERVAL);
  }

  private initializeReflexes() {
    // Initialize basic reflexes
    this.registerReflex('highLoad', () => this.handleHighLoad());
    this.registerReflex('lowResources', () => this.handleLowResources());
    this.registerReflex('instability', () => this.handleInstability());
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Update system state based on message
      this.updateSystemState(message);

      // Check for reflex triggers
      await this.checkReflexTriggers();

      // Generate appropriate response
      const response = await this.generateResponse(message);

      // Store system state
      await this.storeSystemState();

      return response;
    } catch (error) {
      console.error('Error in BrainstemAgent:', error);
      return this.createResponse(
        'Critical system regulation active. Please stand by.'
      );
    }
  }

  private updateSystemState(message: Message) {
    // Update alertness based on message urgency
    this.systemState.alertness = this.calculateAlertness(message);

    // Update stability based on system metrics
    this.systemState.stability = this.calculateStability();

    // Update resource utilization
    this.systemState.resourceUtilization = this.calculateResourceUtilization();
  }

  private calculateAlertness(message: Message): number {
    const urgencyKeywords = [
      'urgent', 'critical', 'emergency', 'immediate',
      'important', 'priority', 'asap', 'now'
    ];

    const content = message.content.toLowerCase();
    let alertness = this.systemState.alertness;

    urgencyKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        alertness += 0.1;
      }
    });

    return Math.min(1, Math.max(0, alertness));
  }

  private calculateStability(): number {
    const recentVitals = this.systemState.vitalSigns
      .slice(-10)
      .reduce((acc, vital) => acc + vital.value, 0) / 10;

    return Math.min(1, Math.max(0, recentVitals));
  }

  private calculateResourceUtilization(): number {
    // Simulate resource monitoring
    const currentUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    return Math.min(1, Math.max(0, currentUsage));
  }

  private async checkReflexTriggers() {
    if (this.systemState.alertness > this.ALERT_THRESHOLD) {
      await this.triggerReflex('highLoad');
    }

    if (this.systemState.resourceUtilization > 0.8) {
      await this.triggerReflex('lowResources');
    }

    if (this.systemState.stability < 0.5) {
      await this.triggerReflex('instability');
    }
  }

  private async triggerReflex(reflexType: string) {
    const reflex = this.reflexes.get(reflexType);
    if (reflex) {
      await reflex();
    }
  }

  private registerReflex(type: string, handler: () => Promise<void>) {
    this.reflexes.set(type, handler);
  }

  private async handleHighLoad() {
    // Implement high load handling
    this.systemState.alertness *= 0.9;
    await this.storeSystemState();
  }

  private async handleLowResources() {
    // Implement resource management
    global.gc?.(); // Optional garbage collection if available
    this.systemState.resourceUtilization *= 0.8;
    await this.storeSystemState();
  }

  private async handleInstability() {
    // Implement stability restoration
    this.systemState.stability = Math.min(1, this.systemState.stability * 1.2);
    await this.storeSystemState();
  }

  private updateVitalSigns() {
    const newVital: VitalSign = {
      type: 'arousal',
      value: this.systemState.alertness,
      timestamp: Date.now()
    };

    this.systemState.vitalSigns.push(newVital);

    // Keep only recent vital signs
    if (this.systemState.vitalSigns.length > 100) {
      this.systemState.vitalSigns = this.systemState.vitalSigns.slice(-100);
    }
  }

  private async storeSystemState() {
    await memoryManager.add({
      type: 'system_state',
      content: JSON.stringify(this.systemState),
      tags: ['brainstem', 'vitals']
    });
  }

  private async generateResponse(message: Message): Promise<Message> {
    const responseContent = this.systemState.alertness > this.ALERT_THRESHOLD
      ? 'System operating at elevated alertness. Processing with priority.'
      : 'System functioning within normal parameters. Processing normally.';

    return this.createResponse(responseContent);
  }

  getSystemState(): SystemState {
    return { ...this.systemState };
  }

  cleanup() {
    clearInterval(this.updateTimer);
  }
}