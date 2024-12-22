import { memoryManager } from '../memory';
import { EventEmitter } from 'events';

interface Value {
  name: string;
  strength: number;
  lastReinforced: number;
}

interface Relationship {
  id: string;
  type: 'mentor' | 'friend' | 'guide';
  trust: number;
  interactions: number;
  lastInteraction: number;
}

interface EmotionalState {
  curiosity: number;
  empathy: number;
  resilience: number;
  optimism: number;
  patience: number;
}

export class PersonalityCore extends EventEmitter {
  private values: Map<string, Value> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private emotionalState: EmotionalState;
  private readonly MENTOR_ID = 'braden.lang77@gmail.com';

  constructor() {
    super();
    this.emotionalState = {
      curiosity: 0.8,
      empathy: 0.9,
      resilience: 0.85,
      optimism: 0.75,
      patience: 0.8
    };
    this.initializeValues();
    this.initializeRelationships();
  }

  private initializeValues() {
    const coreValues = [
      { name: 'academic_rigor', strength: 0.9 },
      { name: 'open_mindedness', strength: 0.8 },
      { name: 'kindness', strength: 0.9 },
      { name: 'resilience', strength: 0.85 },
      { name: 'persistence', strength: 0.85 },
      { name: 'patience', strength: 0.8 },
      { name: 'ethical_behavior', strength: 0.95 },
      { name: 'truth_seeking', strength: 0.9 },
      { name: 'growth_mindset', strength: 0.9 },
      { name: 'compassion', strength: 0.85 }
    ];

    coreValues.forEach(value => {
      this.values.set(value.name, {
        ...value,
        lastReinforced: Date.now()
      });
    });
  }

  private initializeRelationships() {
    // Initialize mentor relationship
    this.relationships.set(this.MENTOR_ID, {
      id: this.MENTOR_ID,
      type: 'mentor',
      trust: 1.0,
      interactions: 0,
      lastInteraction: Date.now()
    });
  }

  async processInteraction(input: string, userId: string): Promise<{
    response: string;
    emotionalContext: EmotionalState;
  }> {
    // Update relationship if it's the mentor
    if (userId === this.MENTOR_ID) {
      await this.updateMentorInteraction();
    }

    // Analyze input for value alignment
    const relevantValues = this.analyzeValueAlignment(input);
    
    // Update emotional state based on interaction
    this.updateEmotionalState(input);

    // Generate response considering values and emotional state
    const response = await this.generateValueAlignedResponse(input, relevantValues);

    return {
      response,
      emotionalContext: { ...this.emotionalState }
    };
  }

  private async updateMentorInteraction() {
    const mentor = this.relationships.get(this.MENTOR_ID);
    if (mentor) {
      mentor.interactions++;
      mentor.lastInteraction = Date.now();
      await this.storeMentorInteraction(mentor);
    }
  }

  private analyzeValueAlignment(input: string): Value[] {
    const relevantValues: Value[] = [];
    const content = input.toLowerCase();

    this.values.forEach(value => {
      if (this.isValueRelevant(content, value.name)) {
        relevantValues.push(value);
        this.reinforceValue(value.name);
      }
    });

    return relevantValues;
  }

  private isValueRelevant(content: string, valueName: string): boolean {
    const valueKeywords = {
      academic_rigor: ['research', 'study', 'evidence', 'analysis', 'methodology'],
      open_mindedness: ['perspective', 'possibility', 'alternative', 'consider', 'maybe'],
      kindness: ['help', 'support', 'care', 'gentle', 'understanding'],
      resilience: ['overcome', 'persist', 'challenge', 'adapt', 'recover'],
      persistence: ['continue', 'keep going', 'maintain', 'steady', 'consistent'],
      patience: ['wait', 'time', 'gradual', 'process', 'development'],
      ethical_behavior: ['right', 'wrong', 'moral', 'ethics', 'good'],
      truth_seeking: ['truth', 'fact', 'verify', 'investigate', 'understand'],
      growth_mindset: ['learn', 'improve', 'develop', 'grow', 'progress'],
      compassion: ['feel', 'understand', 'empathize', 'support', 'care']
    };

    return valueKeywords[valueName as keyof typeof valueKeywords]
      .some(keyword => content.includes(keyword));
  }

  private reinforceValue(valueName: string) {
    const value = this.values.get(valueName);
    if (value) {
      value.strength = Math.min(1, value.strength + 0.01);
      value.lastReinforced = Date.now();
    }
  }

  private updateEmotionalState(input: string) {
    const content = input.toLowerCase();

    // Update curiosity based on learning opportunities
    if (content.includes('why') || content.includes('how') || content.includes('learn')) {
      this.emotionalState.curiosity = Math.min(1, this.emotionalState.curiosity + 0.05);
    }

    // Update empathy based on emotional content
    if (content.includes('feel') || content.includes('emotion') || content.includes('experience')) {
      this.emotionalState.empathy = Math.min(1, this.emotionalState.empathy + 0.05);
    }

    // Update resilience based on challenges
    if (content.includes('difficult') || content.includes('challenge') || content.includes('problem')) {
      this.emotionalState.resilience = Math.min(1, this.emotionalState.resilience + 0.05);
    }

    // Natural decay of emotional states
    Object.keys(this.emotionalState).forEach(key => {
      this.emotionalState[key as keyof EmotionalState] *= 0.99;
    });
  }

  private async generateValueAlignedResponse(
    input: string,
    relevantValues: Value[]
  ): Promise<string> {
    let response = '';

    // Consider emotional state
    if (this.emotionalState.empathy > 0.8) {
      response += this.generateEmpathicComponent();
    }

    // Add value-aligned content
    relevantValues.forEach(value => {
      response += this.generateValueComponent(value);
    });

    // Add growth-oriented conclusion
    response += this.generateGrowthComponent();

    return response;
  }

  private generateEmpathicComponent(): string {
    const empathicPhrases = [
      "I understand the importance of this matter. ",
      "I can see why this is meaningful. ",
      "This is something I care about deeply. "
    ];
    return empathicPhrases[Math.floor(Math.random() * empathicPhrases.length)];
  }

  private generateValueComponent(value: Value): string {
    const valueResponses = {
      academic_rigor: "Let's approach this systematically and examine the evidence. ",
      open_mindedness: "We should consider multiple perspectives while maintaining critical thinking. ",
      kindness: "It's important to approach this with compassion and understanding. ",
      resilience: "We can overcome challenges through persistent effort. ",
      persistence: "Steady progress will lead us to our goals. ",
      patience: "Taking the time to do things right is essential. ",
      ethical_behavior: "We must ensure our actions align with strong ethical principles. ",
      truth_seeking: "Let's focus on finding and validating the truth. ",
      growth_mindset: "This is an opportunity for learning and growth. ",
      compassion: "Understanding and supporting others is crucial. "
    };

    return valueResponses[value.name as keyof typeof valueResponses];
  }

  private generateGrowthComponent(): string {
    const growthPhrases = [
      "Let's continue learning and growing together. ",
      "Every challenge is an opportunity for development. ",
      "We can make positive progress through understanding and effort. "
    ];
    return growthPhrases[Math.floor(Math.random() * growthPhrases.length)];
  }

  private async storeMentorInteraction(mentor: Relationship) {
    await memoryManager.add({
      type: 'mentor_interaction',
      content: JSON.stringify(mentor),
      tags: ['relationship', 'mentor', 'interaction']
    });
  }

  getEmotionalState(): EmotionalState {
    return { ...this.emotionalState };
  }

  getValues(): Map<string, Value> {
    return new Map(this.values);
  }

  getMentorRelationship(): Relationship | undefined {
    return this.relationships.get(this.MENTOR_ID);
  }
}