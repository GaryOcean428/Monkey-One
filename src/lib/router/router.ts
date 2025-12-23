import { LLMProvider } from '../types/core'

interface TaskType {
  type: 'system_design' | 'coding' | 'general'
  complexity: number
}

export class Router {
  private complexityThreshold = 0.5

  // Public route method for routing requests
  public route(query: string, context: unknown[]): { model: LLMProvider } {
    // Analyze query complexity
    const complexity = this.analyzeComplexity(query)
    const taskType = this.determineTaskType(query)
    
    const model = this.selectModel(taskType, complexity)
    return { model }
  }

  private analyzeComplexity(query: string): number {
    // Simple heuristic: longer queries with technical terms are more complex
    const technicalTerms = ['distributed', 'system', 'architecture', 'TypeScript', 'generic', 'constraint']
    const hasTechnicalTerms = technicalTerms.some(term => query.toLowerCase().includes(term.toLowerCase()))
    const length = query.length
    
    if (hasTechnicalTerms && length > 100) return 0.9
    if (hasTechnicalTerms) return 0.7
    if (length > 50) return 0.5
    return 0.2
  }

  private determineTaskType(query: string): 'system_design' | 'coding' | 'general' {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('design') || lowerQuery.includes('architecture') || lowerQuery.includes('distributed')) {
      return 'system_design'
    }
    if (lowerQuery.includes('typescript') || lowerQuery.includes('code') || lowerQuery.includes('implement')) {
      return 'coding'
    }
    return 'general'
  }

  private selectModel(taskType: 'system_design' | 'coding' | 'general', complexity: number): LLMProvider {
    if (complexity > 0.8 || taskType === 'system_design') {
      // Superior tier for very complex tasks
      return {
        id: 'o1-2024-12-01',
        name: 'O1',
        sendMessage: async () => 'Not implemented',
      }
    } else if (complexity > this.complexityThreshold || taskType === 'coding') {
      // High tier for complex tasks
      return {
        id: 'claude-3-5-sonnet-v2@20241022',
        name: 'Claude 3.5 Sonnet',
        sendMessage: async () => 'Not implemented',
      }
    } else if (complexity > 0.3) {
      // Mid tier for moderate tasks
      return {
        id: 'claude-3-5-haiku@20241022',
        name: 'Claude 3.5 Haiku',
        sendMessage: async () => 'Not implemented',
      }
    } else {
      // Low tier for simple tasks
      return {
        id: 'granite3.1-dense:2b',
        name: 'Granite 3.1 Dense 2B',
        sendMessage: async () => 'Not implemented',
      }
    }
  }
}

// Export alias for backward compatibility
export const AdvancedRouter = Router
