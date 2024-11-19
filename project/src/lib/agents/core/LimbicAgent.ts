import { BaseAgent } from '../base';
import type { Message } from '@/types';
import { memoryManager } from '@/lib/memory';

interface EmotionalState {
  valence: number;  // -1 to 1 (negative to positive)
  arousal: number;  // 0 to 1 (calm to excited)
  dominance: number; // 0 to 1 (submissive to dominant)
}

interface EmotionalMemory {
  id: string;
  trigger: string;
  state: EmotionalState;
  context: string[];
  timestamp: number;
  intensity: number;
}

export class LimbicAgent extends BaseAgent {
  private currentState: EmotionalState;
  private emotionalMemories: Map<string, EmotionalMemory> = new Map();
  private readonly MEMORY_CAPACITY = 100;
  private readonly EMOTION_DECAY_RATE = 0.1;

  constructor(id: string, name: string) {
    super(id, name, 'limbic', [
      'emotional_processing',
      'motivation_regulation',
      'emotional_memory',
      'behavior_modulation'
    ]);

    this.currentState = {
      valence: 0,
      arousal: 0.5,
      dominance: 0.5
    };

    this.initializeLimbicSystem();
  }

  private async initializeLimbicSystem() {
    await this.loadEmotionalMemories();
    this.startEmotionalRegulation();
  }

  private async loadEmotionalMemories() {
    const memories = await memoryManager.search('emotional_memory');
    memories.forEach(memory => {
      const emotionalMemory = JSON.parse(memory.content) as EmotionalMemory;
      this.emotionalMemories.set(emotionalMemory.id, emotionalMemory);
    });
  }

  private startEmotionalRegulation() {
    setInterval(() => {
      this.regulateEmotions();
    }, 5000); // Regulate every 5 seconds
  }

  async processMessage(message: Message): Promise<Message> {
    try {
      // Analyze emotional content
      const emotionalContent = this.analyzeEmotionalContent(message);
      
      // Update emotional state
      this.updateEmotionalState(emotionalContent);

      // Create emotional memory
      const memory = await this.createEmotionalMemory(message, emotionalContent);

      // Generate emotionally appropriate response
      return this.generateEmotionalResponse(message, memory);
    } catch (error) {
      console.error('Error in LimbicAgent:', error);
      return this.createResponse(
        'I experienced an emotional processing error. Please be patient with me.'
      );
    }
  }

  private analyzeEmotionalContent(message: Message): EmotionalState {
    const content = message.content.toLowerCase();
    
    // Analyze valence
    const valence = this.calculateValence(content);
    
    // Analyze arousal
    const arousal = this.calculateArousal(content);
    
    // Analyze dominance
    const dominance = this.calculateDominance(content);

    return { valence, arousal, dominance };
  }

  private calculateValence(content: string): number {
    const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excellent'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'horrible'];
    
    let valence = 0;
    positiveWords.forEach(word => {
      if (content.includes(word)) valence += 0.2;
    });
    negativeWords.forEach(word => {
      if (content.includes(word)) valence -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, valence));
  }

  private calculateArousal(content: string): number {
    const highArousalWords = ['excited', 'angry', 'energetic', 'thrilled'];
    const lowArousalWords = ['calm', 'relaxed', 'peaceful', 'sleepy'];
    
    let arousal = 0.5; // Default moderate arousal
    highArousalWords.forEach(word => {
      if (content.includes(word)) arousal += 0.1;
    });
    lowArousalWords.forEach(word => {
      if (content.includes(word)) arousal -= 0.1;
    });
    
    return Math.max(0, Math.min(1, arousal));
  }

  private calculateDominance(content: string): number {
    const highDominanceWords = ['confident', 'strong', 'powerful', 'in control'];
    const lowDominanceWords = ['helpless', 'weak', 'vulnerable', 'afraid'];
    
    let dominance = 0.5; // Default moderate dominance
    highDominanceWords.forEach(word => {
      if (content.includes(word)) dominance += 0.1;
    });
    lowDominanceWords.forEach(word => {
      if (content.includes(word)) dominance -= 0.1;
    });
    
    return Math.max(0, Math.min(1, dominance));
  }

  private updateEmotionalState(newState: EmotionalState) {
    // Apply emotional inertia
    this.currentState = {
      valence: this.currentState.valence * 0.7 + newState.valence * 0.3,
      arousal: this.currentState.arousal * 0.7 + newState.arousal * 0.3,
      dominance: this.currentState.dominance * 0.7 + newState.dominance * 0.3
    };
  }

  private async createEmotionalMemory(
    message: Message,
    emotionalContent: EmotionalState
  ): Promise<EmotionalMemory> {
    const memory: EmotionalMemory = {
      id: crypto.randomUUID(),
      trigger: message.content,
      state: emotionalContent,
      context: this.extractContext(message),
      timestamp: Date.now(),
      intensity: this.calculateIntensity(emotionalContent)
    };

    // Store memory
    await this.storeEmotionalMemory(memory);

    // Manage memory capacity
    if (this.emotionalMemories.size > this.MEMORY_CAPACITY) {
      this.forgetOldestMemory();
    }

    return memory;
  }

  private extractContext(message: Message): string[] {
    const context: string[] = [];
    
    // Add temporal context
    context.push(`time:${new Date().toISOString()}`);
    
    // Add emotional context
    context.push(`emotional_state:${JSON.stringify(this.currentState)}`);
    
    // Add message metadata
    if (message.metadata) {
      Object.entries(message.metadata).forEach(([key, value]) => {
        context.push(`${key}:${value}`);
      });
    }

    return context;
  }

  private calculateIntensity(state: EmotionalState): number {
    return Math.abs(state.valence) * state.arousal;
  }

  private async storeEmotionalMemory(memory: EmotionalMemory) {
    this.emotionalMemories.set(memory.id, memory);
    
    await memoryManager.add({
      type: 'emotional_memory',
      content: JSON.stringify(memory),
      tags: ['emotion', 'memory', ...memory.context]
    });
  }

  private forgetOldestMemory() {
    let oldestId = '';
    let oldestTimestamp = Infinity;

    this.emotionalMemories.forEach((memory, id) => {
      if (memory.timestamp < oldestTimestamp) {
        oldestTimestamp = memory.timestamp;
        oldestId = id;
      }
    });

    if (oldestId) {
      this.emotionalMemories.delete(oldestId);
    }
  }

  private regulateEmotions() {
    // Apply emotional decay
    this.currentState = {
      valence: this.currentState.valence * (1 - this.EMOTION_DECAY_RATE),
      arousal: 0.5 + (this.currentState.arousal - 0.5) * (1 - this.EMOTION_DECAY_RATE),
      dominance: 0.5 + (this.currentState.dominance - 0.5) * (1 - this.EMOTION_DECAY_RATE)
    };
  }

  private async generateEmotionalResponse(
    message: Message,
    memory: EmotionalMemory
  ): Promise<Message> {
    const similarMemories = this.findSimilarMemories(memory);
    const emotionalTone = this.determineEmotionalTone();
    
    const response = this.createResponse(
      this.formatEmotionalResponse(message.content, emotionalTone)
    );

    response.metadata = {
      ...response.metadata,
      emotionalState: this.currentState,
      similarMemories: similarMemories.length
    };

    return response;
  }

  private findSimilarMemories(memory: EmotionalMemory): EmotionalMemory[] {
    return Array.from(this.emotionalMemories.values())
      .filter(m => this.calculateEmotionalSimilarity(m.state, memory.state) > 0.8)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }

  private calculateEmotionalSimilarity(state1: EmotionalState, state2: EmotionalState): number {
    const valenceDiff = Math.abs(state1.valence - state2.valence);
    const arousalDiff = Math.abs(state1.arousal - state2.arousal);
    const dominanceDiff = Math.abs(state1.dominance - state2.dominance);
    
    return 1 - ((valenceDiff + arousalDiff + dominanceDiff) / 3);
  }

  private determineEmotionalTone(): string {
    if (this.currentState.valence > 0.5) {
      return this.currentState.arousal > 0.5 ? 'excited' : 'content';
    } else if (this.currentState.valence < -0.5) {
      return this.currentState.arousal > 0.5 ? 'agitated' : 'sad';
    } else {
      return 'neutral';
    }
  }

  private formatEmotionalResponse(content: string, tone: string): string {
    const responseTemplates = {
      excited: 'I\'m really enthusiastic about ',
      content: 'I\'m pleased to ',
      agitated: 'I\'m concerned about ',
      sad: 'I feel sorry that ',
      neutral: 'I understand that '
    };

    return `${responseTemplates[tone as keyof typeof responseTemplates]}${content}`;
  }

  getCurrentEmotionalState(): EmotionalState {
    return { ...this.currentState };
  }

  getEmotionalMemories(): EmotionalMemory[] {
    return Array.from(this.emotionalMemories.values());
  }
}