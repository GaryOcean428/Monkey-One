import { ModelConfig } from '../models';
import { XAIMessage } from '../types';

export type TaskType = 'coding' | 'analysis' | 'creative' | 'casual' | 'general';
export type QuestionType = 'problem_solving' | 'factual' | 'yes_no' | 'analysis' | 'casual' | 'open_ended';
export type ResponseStrategy = 
  | 'casual_conversation'
  | 'direct_answer'
  | 'chain_of_thought'
  | 'boolean_with_explanation'
  | 'comparative_analysis'
  | 'open_discussion'
  | 'code_generation'
  | 'debug_explanation';

export type TechStack = 
  | 'typescript'
  | 'react'
  | 'node'
  | 'database'
  | 'testing'
  | 'deployment'
  | 'security';

export type CodeIndicator = 
  | 'dataStructures'
  | 'algorithms'
  | 'patterns'
  | 'architecture'
  | 'async'
  | 'performance'
  | 'security';

export interface RouterConfig {
  model: ModelConfig;
  maxTokens: number;
  temperature: number;
  responseStrategy: ResponseStrategy;
  routingExplanation: string;
  questionType?: QuestionType;
}

export interface TokenEstimate {
  promptTokens: number;
  expectedResponseTokens: number;
  totalTokens: number;
}

export interface RouterContext {
  complexity: number;
  contextLength: number;
  taskType: TaskType;
  questionType: QuestionType;
  techStack: TechStack[];
  codeComplexity: number;
}

export interface ModelTiers {
  default: ModelConfig; // granite3.1-dense:2b
  mid: ModelConfig;    // claude-3-5-haiku
  high: ModelConfig;   // claude-3-5-sonnet
}
