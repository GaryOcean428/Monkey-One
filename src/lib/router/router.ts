import type { LLMProvider } from '../llm/providers';
import { llmManager } from '../llm/providers';
import { XAIMessage } from '../types';
import { RouterConfig, TaskType, QuestionType } from './types';

interface RouterOptions {
  useRag?: boolean;
  documents?: string[];
  maxTokens?: number;
  temperature?: number;
}

export class AdvancedRouter {
  private readonly defaultOptions: RouterOptions = {
    useRag: false,
    maxTokens: 1000,
    temperature: 0.7
  };

  private readonly techStackKeywords = [
    'typescript', 'javascript', 'python', 'react', 'node', 'express',
    'database', 'api', 'frontend', 'backend', 'fullstack'
  ];

  constructor(private complexityThreshold: number = 0.5) {}

  route(message: string, history: XAIMessage[]): RouterConfig {
    const taskType = this.identifyTaskType(message);
    const questionType = this.identifyQuestionType(message);
    const complexity = this.assessComplexity(message);
    const techStack = this.identifyTechStack(message);

    const config: RouterConfig = {
      model: this.selectModel(taskType, complexity),
      responseStrategy: this.selectStrategy(taskType, questionType),
      maxTokens: this.calculateMaxTokens(taskType, complexity),
      temperature: this.calculateTemperature(taskType, history),
      taskType,
      questionType,
      techStack
    };

    return config;
  }

  private selectModel(taskType: TaskType, complexity: number): LLMProvider {
    if (complexity > this.complexityThreshold || taskType === 'coding') {
      // Use high-tier model for complex tasks
      return {
        id: 'claude-3-5-sonnet-v2@20241022',
        name: 'Claude 3.5 Sonnet',
        sendMessage: async () => 'Not implemented'
      };
    } else if (taskType === 'system_design') {
      // Use superior tier for system design
      return {
        id: 'o1-2024-12-01',
        name: 'O1',
        sendMessage: async () => 'Not implemented'
      };
    } else if (complexity > 0.3) {
      // Mid tier for moderate tasks
      return {
        id: 'claude-3-5-haiku@20241022',
        name: 'Claude 3.5 Haiku',
        sendMessage: async () => 'Not implemented'
      };
    } else {
      // Low tier for simple tasks
      return {
        id: 'granite3.1-dense:2b',
        name: 'Granite 3.1 Dense 2B',
        sendMessage: async () => 'Not implemented'
      };
    }
  }

  private selectStrategy(taskType: TaskType, questionType: QuestionType): string {
    if (taskType === 'coding') {
      return 'code_generation';
    } else if (taskType === 'analysis') {
      return 'chain_of_thought';
    } else if (questionType === 'casual') {
      return 'casual_conversation';
    }
    return 'standard';
  }

  private calculateMaxTokens(taskType: TaskType, complexity: number): number {
    const baseTokens = 512;
    const complexityMultiplier = Math.max(1, complexity * 2);
    
    switch (taskType) {
      case 'coding':
      case 'system_design':
        return baseTokens * 4 * complexityMultiplier;
      case 'analysis':
        return baseTokens * 3 * complexityMultiplier;
      default:
        return baseTokens;
    }
  }

  private calculateTemperature(taskType: TaskType, history: XAIMessage[]): number {
    const baseTemp = taskType === 'coding' ? 0.7 : 0.8;
    const conversationLength = history.length;
    
    // Increase temperature slightly for longer conversations
    return Math.min(baseTemp + (conversationLength * 0.02), 1.0);
  }

  private identifyTaskType(message: string): TaskType {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('write') && lowercaseMessage.includes('function') ||
        lowercaseMessage.includes('implement') || lowercaseMessage.includes('code')) {
      return 'coding';
    } else if (lowercaseMessage.includes('design') || lowercaseMessage.includes('architecture')) {
      return 'system_design';
    } else if (lowercaseMessage.includes('compare') || lowercaseMessage.includes('analyze')) {
      return 'analysis';
    }
    
    return 'general';
  }

  private identifyQuestionType(message: string): QuestionType {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.startsWith('hi') || lowercaseMessage.startsWith('hello') ||
        lowercaseMessage.includes('how are you')) {
      return 'casual';
    } else if (this.techStackKeywords.some(keyword => lowercaseMessage.includes(keyword))) {
      return 'technical';
    }
    
    return 'general';
  }

  private identifyTechStack(message: string): string[] {
    const lowercaseMessage = message.toLowerCase();
    return this.techStackKeywords.filter(tech => lowercaseMessage.includes(tech));
  }

  private assessComplexity(message: string): number {
    const words = message.split(' ');
    const technicalTerms = this.techStackKeywords.filter(term => message.toLowerCase().includes(term));
    
    // Calculate complexity based on message length and technical term density
    const lengthScore = Math.min(words.length / 50, 1);
    const technicalScore = technicalTerms.length / this.techStackKeywords.length;
    
    return (lengthScore + technicalScore) / 2;
  }

  estimateCost(message: string, provider: LLMProvider): number {
    const tokensPerWord = 1.3;
    const estimatedTokens = Math.ceil(message.split(' ').length * tokensPerWord);
    const costPerToken = 0.00003; // Example cost per token
    return estimatedTokens * costPerToken;
  }
}
