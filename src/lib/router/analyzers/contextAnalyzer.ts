import { XAIMessage } from '../../types';
import { QuestionType, TaskType } from '../types';

export class ContextAnalyzer {
  /**
   * Identify task type from query
   * @param query User's input query
   * @returns Identified task type
   */
  public static identifyTaskType(query: string): TaskType {
    const queryLower = query.toLowerCase();
    if (/\b(code|program|function|debug)\b/.test(queryLower)) return 'coding';
    if (/\b(analyze|compare|evaluate)\b/.test(queryLower)) return 'analysis';
    if (/\b(create|generate|write)\b/.test(queryLower)) return 'creative';
    if (/\b(hi|hello|hey|how are you)\b/.test(queryLower)) return 'casual';
    return 'general';
  }

  /**
   * Classify question type
   * @param query User's input query
   * @returns Classified question type
   */
  public static classifyQuestion(query: string): QuestionType {
    const queryLower = query.toLowerCase();
    if (/\b(how|why|explain)\b/.test(queryLower)) return 'problem_solving';
    if (/\b(what|who|where|when)\b/.test(queryLower)) return 'factual';
    if (/^(is|are|can|do|does)\b/.test(queryLower)) return 'yes_no';
    if (/\b(compare|contrast|analyze)\b/.test(queryLower)) return 'analysis';
    if (/\b(hi|hello|hey|how are you)\b/.test(queryLower)) return 'casual';
    return 'open_ended';
  }

  /**
   * Calculate context length
   * @param history Conversation history
   * @returns Total context length in characters
   */
  public static calculateContextLength(history: XAIMessage[]): number {
    return history.reduce((sum, msg) => sum + msg.content.length, 0);
  }

  /**
   * Assess query complexity
   * @param query User's input query
   * @returns Complexity score between 0 and 1
   */
  public static assessComplexity(query: string): number {
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

  /**
   * Check for rapid exchanges
   * @param history Recent conversation history
   * @returns True if rapid exchanges detected
   */
  public static hasRapidExchanges(history: XAIMessage[]): boolean {
    return history.length >= 4 &&
      history.slice(-4).every(msg => msg.content.split(/\s+/).length < 10);
  }

  /**
   * Check for explanation requests
   * @param history Recent conversation history
   * @returns True if explanation requests detected
   */
  public static hasExplanationRequests(history: XAIMessage[]): boolean {
    return history
      .slice(-3)
      .some(msg => msg.content.toLowerCase().startsWith('please explain'));
  }
}
