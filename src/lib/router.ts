import { ModelConfig, models } from './models';
import { XAIMessage } from './types';

interface RouterConfig {
  model: ModelConfig;
  maxTokens: number;
  temperature: number;
  responseStrategy: string;
  routingExplanation: string;
  questionType?: string;
}

export class AdvancedRouter {
  private threshold: number;
  private models: {
    low: ModelConfig;
    mid: ModelConfig;
    high: ModelConfig;
    superior: ModelConfig;
  };

  constructor(threshold = 0.5) {
    this.threshold = threshold;
    this.models = {
      low: models['llama3-groq-8b'], // Efficient 8B model
      mid: models['llama-3.2-3b'], // Balanced 3B model
      high: models['llama-3.3-70b'], // High-performance 70B model
      superior: models['grok-2'], // Superior model for complex tasks
    };
  }

  public route(query: string, conversationHistory: XAIMessage[]): RouterConfig {
    const complexity = this.assessComplexity(query);
    const contextLength = this.calculateContextLength(conversationHistory);
    const taskType = this.identifyTaskType(query);
    const questionType = this.classifyQuestion(query);
    const techStack = this.identifyTechStack(query);
    const codeComplexity = this.assessCodeComplexity(query);

    // Handle simple queries
    if (taskType === 'casual') {
      return this.getCasualConfig();
    }

    let config: RouterConfig;
    // Prioritize superior model for complex technical tasks
    if (codeComplexity > 0.8 || (techStack.length >= 3 && complexity > 0.7)) {
      config = this.getSuperiorTierConfig(taskType);
    }
    // Use high-tier for moderately complex tasks or specific tech stacks
    else if (
      complexity < this.threshold * 1.5 || 
      contextLength < 8000 ||
      techStack.includes('typescript') ||
      techStack.includes('react')
    ) {
      config = this.getHighTierConfig(taskType);
    }
    // Use mid-tier for standard development queries
    else if (complexity < this.threshold && contextLength < 4000) {
      config = this.getMidTierConfig(taskType);
    }
    // Use low-tier for simple queries
    else {
      config = this.getLowTierConfig(taskType);
    }

    config.routingExplanation = 
      `Selected ${config.model.name} based on:\n` +
      `- Complexity: ${complexity.toFixed(2)}\n` +
      `- Context length: ${contextLength} chars\n` +
      `- Task type: ${taskType}\n` +
      `- Tech stack: ${techStack.join(', ') || 'none'}\n` +
      `- Code complexity: ${codeComplexity.toFixed(2)}`;
    
    config.questionType = questionType;
    config.responseStrategy = this.getResponseStrategy(questionType, taskType);

    return this.adjustParamsBasedOnHistory(config, conversationHistory);
  }

  private assessComplexity(query: string): number {
    const wordCount = query.split(/\s+/).length;
    const sentenceCount = (query.match(/\w+[.!?]/g) || []).length + 1;
    const avgWordLength = wordCount > 0 
      ? query.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount 
      : 0;

    const complexity = 
      (wordCount / 100) * 0.4 + 
      (sentenceCount / 10) * 0.3 + 
      (avgWordLength / 10) * 0.3;

    return Math.min(complexity, 1.0);
  }

  private calculateContextLength(conversationHistory: XAIMessage[]): number {
    return conversationHistory.reduce((sum, msg) => sum + msg.content.length, 0);
  }

  private identifyTaskType(query: string): string {
    const queryLower = query.toLowerCase();
    if (/\b(code|program|function|debug)\b/.test(queryLower)) return 'coding';
    if (/\b(analyze|compare|evaluate)\b/.test(queryLower)) return 'analysis';
    if (/\b(create|generate|write)\b/.test(queryLower)) return 'creative';
    if (/\b(hi|hello|hey|how are you)\b/.test(queryLower)) return 'casual';
    return 'general';
  }

  private classifyQuestion(query: string): string {
    const queryLower = query.toLowerCase();
    if (/\b(how|why|explain)\b/.test(queryLower)) return 'problem_solving';
    if (/\b(what|who|where|when)\b/.test(queryLower)) return 'factual';
    if (/^(is|are|can|do|does)\b/.test(queryLower)) return 'yes_no';
    if (/\b(compare|contrast|analyze)\b/.test(queryLower)) return 'analysis';
    if (/\b(hi|hello|hey|how are you)\b/.test(queryLower)) return 'casual';
    return 'open_ended';
  }

  private getResponseStrategy(questionType: string, taskType: string): string {
    if (taskType === 'casual' || questionType === 'casual') {
      return 'casual_conversation';
    }

    const strategyMap: Record<string, string> = {
      problem_solving: 'chain_of_thought',
      factual: 'direct_answer',
      yes_no: 'boolean_with_explanation',
      analysis: 'comparative_analysis',
      open_ended: 'open_discussion',
    };

    return strategyMap[questionType] || 'default';
  }

  private getCasualConfig(): RouterConfig {
    return {
      model: this.models.low,
      maxTokens: 50,
      temperature: 0.7,
      responseStrategy: 'casual_conversation',
      routingExplanation: 'Simple greeting detected, using efficient model for quick response.',
    };
  }

  private getLowTierConfig(taskType: string): RouterConfig {
    return {
      model: this.models.low,
      maxTokens: 256,
      temperature: taskType === 'casual' ? 0.7 : 0.5,
      responseStrategy: 'default',
      routingExplanation: '',
    };
  }

  private getMidTierConfig(taskType: string): RouterConfig {
    const maxTokens = ['analysis', 'creative'].includes(taskType) ? 768 : 512;
    return {
      model: this.models.mid,
      maxTokens,
      temperature: 0.7,
      responseStrategy: 'default',
      routingExplanation: '',
    };
  }

  private getHighTierConfig(taskType: string): RouterConfig {
    return {
      model: this.models.high,
      maxTokens: 1024,
      temperature: ['coding', 'analysis'].includes(taskType) ? 0.7 : 0.9,
      responseStrategy: 'default',
      routingExplanation: '',
    };
  }

  private getSuperiorTierConfig(taskType: string): RouterConfig {
    return {
      model: this.models.superior,
      maxTokens: 4096,
      temperature: ['coding', 'analysis'].includes(taskType) ? 0.5 : 0.7,
      responseStrategy: 'default',
      routingExplanation: '',
    };
  }

  private adjustParamsBasedOnHistory(config: RouterConfig, conversationHistory: XAIMessage[]): RouterConfig {
    // For longer conversations, slightly increase temperature for more varied responses
    if (conversationHistory.length > 5) {
      config.temperature = Math.min(config.temperature * 1.1, 1.0);
    }

    // Check for explanation requests in recent messages
    const recentExplanationRequests = conversationHistory
      .slice(-3)
      .some(msg => msg.content.toLowerCase().startsWith('please explain'));
    if (recentExplanationRequests) {
      config.maxTokens = Math.min(Math.floor(config.maxTokens * 1.2), 4096);
    }

    // Check for rapid back-and-forth exchanges
    const recentShortMessages = conversationHistory.length >= 4 &&
      conversationHistory.slice(-4).every(msg => msg.content.split(/\s+/).length < 10);
    if (recentShortMessages) {
      config.maxTokens = Math.max(128, Math.floor(config.maxTokens * 0.8));
    }

    return config;
  }

  private identifyTechStack(query: string): string[] {
    const techKeywords = {
      typescript: /\b(typescript|ts|type[\s-]safe)\b/i,
      react: /\b(react|hook|component|jsx|tsx)\b/i,
      node: /\b(node|express|nest)\b/i,
      database: /\b(sql|postgres|supabase|prisma)\b/i,
      testing: /\b(test|jest|vitest|cypress)\b/i,
      deployment: /\b(docker|kubernetes|ci|cd|deploy)\b/i,
      security: /\b(auth|oauth|jwt|security)\b/i
    };

    return Object.entries(techKeywords)
      .filter(([_, pattern]) => pattern.test(query))
      .map(([tech]) => tech);
  }

  private assessCodeComplexity(query: string): number {
    const codeIndicators = {
      dataStructures: /\b(tree|graph|heap|stack|queue)\b/i,
      algorithms: /\b(sort|search|traverse|balance|optimize)\b/i,
      patterns: /\b(design pattern|singleton|factory|observer)\b/i,
      architecture: /\b(architecture|system design|scalable|microservice)\b/i,
      async: /\b(async|await|promise|callback|observable)\b/i,
      performance: /\b(performance|optimize|memory|cpu|complexity)\b/i,
      security: /\b(security|auth|encryption|token|vulnerable)\b/i
    };

    const matches = Object.values(codeIndicators)
      .filter(pattern => pattern.test(query))
      .length;

    return Math.min(matches / Object.keys(codeIndicators).length, 1);
  }
}
