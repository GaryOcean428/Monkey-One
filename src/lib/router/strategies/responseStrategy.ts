import { QuestionType, ResponseStrategy, TaskType } from '../types';

export class ResponseStrategySelector {
  private static readonly STRATEGY_MAP: Record<QuestionType, ResponseStrategy> = {
    problem_solving: 'chain_of_thought',
    factual: 'direct_answer',
    yes_no: 'boolean_with_explanation',
    analysis: 'comparative_analysis',
    casual: 'casual_conversation',
    open_ended: 'open_discussion',
  };

  private static readonly TOKEN_MULTIPLIERS: Record<ResponseStrategy, number> = {
    casual_conversation: 1.0,
    direct_answer: 1.2,
    chain_of_thought: 2.0,
    boolean_with_explanation: 1.5,
    comparative_analysis: 2.5,
    open_discussion: 1.8,
    code_generation: 3.0,
    debug_explanation: 2.5,
  };

  /**
   * Select appropriate response strategy
   * @param questionType Type of question
   * @param taskType Type of task
   * @returns Selected response strategy
   */
  public static selectStrategy(
    questionType: QuestionType,
    taskType: TaskType
  ): ResponseStrategy {
    if (taskType === 'casual' || questionType === 'casual') {
      return 'casual_conversation';
    }

    if (taskType === 'coding') {
      return questionType === 'problem_solving' 
        ? 'code_generation' 
        : 'debug_explanation';
    }

    return this.STRATEGY_MAP[questionType] || 'direct_answer';
  }

  /**
   * Get token multiplier for strategy
   * @param strategy Response strategy
   * @returns Token multiplier
   */
  public static getTokenMultiplier(strategy: ResponseStrategy): number {
    return this.TOKEN_MULTIPLIERS[strategy];
  }

  /**
   * Adjust strategy based on context
   * @param strategy Initial strategy
   * @param contextLength Context length
   * @param isRapidExchange Whether in rapid exchange
   * @returns Adjusted strategy
   */
  public static adjustStrategy(
    strategy: ResponseStrategy,
    contextLength: number,
    isRapidExchange: boolean
  ): ResponseStrategy {
    if (isRapidExchange && strategy !== 'casual_conversation') {
      return 'direct_answer';
    }

    if (contextLength > 4000 && strategy === 'chain_of_thought') {
      return 'direct_answer';
    }

    return strategy;
  }
}
