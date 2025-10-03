import { CodeIndicator } from '../types'

const CODE_INDICATORS: Record<CodeIndicator, RegExp> = {
  dataStructures: /\b(tree|graph|heap|stack|queue)\b/i,
  algorithms: /\b(sort|search|traverse|balance|optimize)\b/i,
  patterns: /\b(design pattern|singleton|factory|observer)\b/i,
  architecture: /\b(architecture|system design|scalable|microservice)\b/i,
  async: /\b(async|await|promise|callback|observable)\b/i,
  performance: /\b(performance|optimize|memory|cpu|complexity)\b/i,
  security: /\b(security|auth|encryption|token|vulnerable)\b/i,
}

export class CodeAnalyzer {
  /**
   * Analyze code complexity in query
   * @param query User's input query
   * @returns Complexity score between 0 and 1
   */
  public static analyzeComplexity(query: string): number {
    const matches = Object.values(CODE_INDICATORS).filter(pattern => pattern.test(query)).length

    return Math.min(matches / Object.keys(CODE_INDICATORS).length, 1)
  }

  /**
   * Get specific code indicators present in query
   * @param query User's input query
   * @returns Array of detected code indicators
   */
  public static getIndicators(query: string): CodeIndicator[] {
    return Object.entries(CODE_INDICATORS)
      .filter(([_, pattern]) => pattern.test(query))
      .map(([indicator]) => indicator as CodeIndicator)
  }

  /**
   * Check if query contains specific code indicator
   * @param query User's input query
   * @param indicator Code indicator to check for
   * @returns True if indicator is present
   */
  public static hasIndicator(query: string, indicator: CodeIndicator): boolean {
    return CODE_INDICATORS[indicator].test(query)
  }

  /**
   * Get complexity weight for specific indicator
   * @param indicator Code indicator
   * @returns Complexity weight
   */
  public static getIndicatorWeight(indicator: CodeIndicator): number {
    const weights: Record<CodeIndicator, number> = {
      dataStructures: 0.8,
      algorithms: 0.9,
      patterns: 0.7,
      architecture: 1.0,
      async: 0.6,
      performance: 0.8,
      security: 0.9,
    }

    return weights[indicator]
  }
}
