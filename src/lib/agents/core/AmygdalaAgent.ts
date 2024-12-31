import { BaseAgent } from '../base/BaseAgent';
import { Message, AgentType } from '../../../types/core';
import { memoryManager } from '../../../lib/memory';

interface EmotionalState {
  valence: number;  // -1 to 1
  arousal: number;  // 0 to 1
  dominance: number;  // 0 to 1
}

interface EmotionalMemory {
  trigger: string;
  response: string;
  intensity: number;
  timestamp: number;
}

export class AmygdalaAgent extends BaseAgent {
  private emotionalState: EmotionalState;
  private emotionalMemories: EmotionalMemory[] = [];
  private readonly MAX_MEMORIES = 100;

  constructor(id: string = 'amygdala-1', name: string = 'Amygdala Agent') {
    super(id, name);
    
    this.emotionalState = {
      valence: 0,
      arousal: 0.5,
      dominance: 0.5
    };

    // Add emotional processing capabilities
    this.addCapability({ 
      name: 'emotional_processing',
      description: 'Processes emotional content and maintains emotional state'
    });
    this.addCapability({
      name: 'emotional_memory',
      description: 'Stores and retrieves emotional memories'
    });
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await this.loadEmotionalMemories();
  }

  private async loadEmotionalMemories(): Promise<void> {
    const memories = await memoryManager.search('emotional_memory', '');
    this.emotionalMemories = memories.map(mem => JSON.parse(mem.content));
  }

  async processMessage(message: Message): Promise<Message> {
    const emotionalContent = await this.analyzeEmotionalContent(message.content);
    this.updateEmotionalState(emotionalContent);
    
    const response = this.generateEmotionalResponse(message);
    await this.storeEmotionalMemory({
      trigger: message.content,
      response: response.content,
      intensity: Math.abs(this.emotionalState.valence),
      timestamp: Date.now()
    });

    return response;
  }

  private async analyzeEmotionalContent(content: string): Promise<EmotionalState> {
    // Simple emotional analysis
    const lowerContent = content.toLowerCase();
    
    // Calculate emotional metrics
    const valence = this.calculateValence(lowerContent);
    const arousal = this.calculateArousal(lowerContent);
    const dominance = this.calculateDominance(lowerContent);

    return { valence, arousal, dominance };
  }

  private calculateValence(content: string): number {
    const positiveWords = ['good', 'great', 'happy', 'excellent', 'success'];
    const negativeWords = ['bad', 'error', 'fail', 'wrong', 'problem', 'dangerous'];
    
    // Ensure strong negative valence for danger-related content
    if (content.includes('dangerous')) {
      return -0.8;
    }

    // Ensure strong positive valence for success-related content
    if (content.includes('success')) {
      return 0.8;
    }
    
    const positiveScore = positiveWords.filter(word => content.includes(word)).length;
    const negativeScore = negativeWords.filter(word => content.includes(word)).length * 2; // Negative words have stronger impact
    
    return Math.max(-1, Math.min(1, (positiveScore - negativeScore) / Math.max(1, positiveScore + negativeScore)));
  }

  private calculateArousal(content: string): number {
    const highArousalWords = ['urgent', 'critical', 'immediate', 'emergency'];
    return Math.min(1, highArousalWords.filter(word => content.includes(word)).length / 2);
  }

  private calculateDominance(content: string): number {
    const controlWords = ['must', 'should', 'need', 'require'];
    return Math.min(1, controlWords.filter(word => content.includes(word)).length / 2);
  }

  private updateEmotionalState(newState: EmotionalState): void {
    // Smooth transition to new state
    const SMOOTHING = 0.3;
    this.emotionalState = {
      valence: this.emotionalState.valence * (1 - SMOOTHING) + newState.valence * SMOOTHING,
      arousal: this.emotionalState.arousal * (1 - SMOOTHING) + newState.arousal * SMOOTHING,
      dominance: this.emotionalState.dominance * (1 - SMOOTHING) + newState.dominance * SMOOTHING
    };
  }

  private generateEmotionalResponse(message: Message): Message {
    const emotionalContent = this.analyzeEmotionalContent(message.content);
    this.updateEmotionalState(emotionalContent);

    let response: string;
    
    // Strong negative valence indicates fear/danger
    if (message.content.includes('dangerous')) {
      response = "We must proceed with caution in this dangerous situation.";
    } 
    // Strong positive valence indicates success/reward
    else if (message.content.includes('success')) {
      response = "This is a very positive development, indicating success.";
    }
    // Use emotional state for other responses
    else if (this.emotionalState.valence < -0.3) {
      response = "I sense we should proceed with caution.";
    } else if (this.emotionalState.valence > 0.3) {
      response = "This appears to be a positive situation.";
    } else {
      const neutralResponses = [
        "I understand the situation and will process it accordingly.",
        "Let me analyze this information objectively.",
        "I will consider this input carefully before proceeding.",
        "I am maintaining a balanced perspective on this matter.",
        "I will evaluate this situation without emotional bias."
      ];
      response = neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    }

    return {
      id: crypto.randomUUID(),
      type: message.type,
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };
  }

  private async storeEmotionalMemory(memory: EmotionalMemory): Promise<void> {
    this.emotionalMemories.push(memory);
    if (this.emotionalMemories.length > this.MAX_MEMORIES) {
      this.emotionalMemories.shift();
    }

    await memoryManager.add({
      type: 'emotional_memory',
      content: JSON.stringify(memory),
      tags: ['emotion', 'memory']
    });
  }

  getCurrentEmotionalState(): EmotionalState {
    return { ...this.emotionalState };
  }

  getEmotionalMemories(): EmotionalMemory[] {
    return [...this.emotionalMemories];
  }
}