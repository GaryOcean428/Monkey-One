import { TechStack } from '../types'

const TECH_PATTERNS: Record<TechStack, RegExp> = {
  typescript: /\b(typescript|ts|type[\s-]safe)\b/i,
  react: /\b(react|hook|component|jsx|tsx)\b/i,
  node: /\b(node|express|nest)\b/i,
  database: /\b(sql|postgres|supabase|prisma)\b/i,
  testing: /\b(test|jest|vitest|cypress)\b/i,
  deployment: /\b(docker|kubernetes|ci|cd|deploy)\b/i,
  security: /\b(auth|oauth|jwt|security)\b/i,
}

export class TechStackAnalyzer {
  /**
   * Analyze query for tech stack references
   * @param query User's input query
   * @returns Array of detected tech stacks
   */
  public static analyze(query: string): TechStack[] {
    return Object.entries(TECH_PATTERNS)
      .filter(([_, pattern]) => pattern.test(query))
      .map(([tech]) => tech as TechStack)
  }

  /**
   * Check if query contains specific tech stack
   * @param query User's input query
   * @param stack Tech stack to check for
   * @returns True if tech stack is present
   */
  public static hasTechStack(query: string, stack: TechStack): boolean {
    return TECH_PATTERNS[stack].test(query)
  }

  /**
   * Get complexity multiplier based on tech stacks
   * @param stacks Detected tech stacks
   * @returns Complexity multiplier
   */
  public static getComplexityMultiplier(stacks: TechStack[]): number {
    const baseMultiplier = 1.0
    const stackMultipliers: Record<TechStack, number> = {
      typescript: 1.2,
      react: 1.15,
      node: 1.1,
      database: 1.25,
      testing: 1.1,
      deployment: 1.2,
      security: 1.3,
    }

    return stacks.reduce(
      (multiplier, stack) => multiplier * stackMultipliers[stack],
      baseMultiplier
    )
  }
}
