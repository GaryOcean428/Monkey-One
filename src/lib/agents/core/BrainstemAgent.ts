import { BaseAgent } from '../BaseAgent';
import { AgentType } from '../../types/agent';
import { memoryManager } from '../../../lib/memory';

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
  private readonly UPDATE_INTERVAL = 1000; // 1 second
  private updateTimer?: NodeJS.Timer;

  constructor(id: string = 'brainstem-1', name: string = 'Brainstem Agent') {
    super(id, name, AgentType.BRAINSTEM);

    this.systemState = {
      vitalSigns: [],
      alertness: 0.5,
      stability: 1.0,
      resourceUtilization: 0.0
    };

    this.initializeBrainstem();
  }

  async processMessage(message: any): Promise<{ content: string }> {
    const currentAlertness = this.systemState.alertness;
    
    // Update alertness based on message urgency
    if (message.content.includes('urgent') || message.content.includes('alert')) {
      this.systemState.alertness = Math.min(1.0, currentAlertness + 0.3);
    }
    
    // Store in memory
    await memoryManager.add(`Brainstem processed: ${message.content}`, { 
      agent: 'brainstem',
      alertness: this.systemState.alertness 
    });
    
    return {
      content: `System operating at elevated alertness (${this.systemState.alertness.toFixed(2)}). Vital signs monitored.`
    };
  }

  private async initializeBrainstem(): Promise<void> {
    // Initialize vital signs monitoring
    this.updateTimer = setInterval(() => {
      this.monitorVitalSigns();
    }, this.UPDATE_INTERVAL);
  }

  private async monitorVitalSigns(): Promise<void> {
    // Monitor and update vital signs
    const currentTime = Date.now();
    this.systemState.vitalSigns = this.systemState.vitalSigns.filter(
      sign => currentTime - sign.timestamp < 5000 // Keep last 5 seconds
    );
  }

  async shutdown(): Promise<void> {
    clearInterval(this.updateTimer);
    await super.shutdown();
  }
}