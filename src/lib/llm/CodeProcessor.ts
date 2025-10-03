import { llmManager } from './providers'
import type { Message } from '../../types'

interface CodeSolution {
  code: string
  explanation: string
  confidence: number
  metadata: {
    model: string
    generationTime: number
    iterations: number
    mergedFrom?: string[]
    suggestionsApplied?: number
  }
}

interface ValidationResult {
  isValid: boolean
  issues: string[]
  suggestions: string[]
  score: number
}

export class CodeProcessor {
  private models: string[] = ['qwen', 'groq']
  private solutions: Map<string, CodeSolution> = new Map()

  async processCodingTask(task: string, context: Message[] = []): Promise<CodeSolution> {
    // Generate solutions in parallel from all models
    const solutionPromises = this.models.map(modelId =>
      this.generateSolution(modelId, task, context)
    )

    const solutions = await Promise.all(solutionPromises)

    // Cross-validate solutions
    const validationPromises = solutions.map(solution =>
      this.validateSolution(
        solution,
        solutions.filter(s => s !== solution)
      )
    )

    const validationResults = await Promise.all(validationPromises)

    // Combine and improve solutions based on validation results
    const improvedSolution = await this.combineAndImproveSolutions(solutions, validationResults)

    return improvedSolution
  }

  private async generateSolution(
    modelId: string,
    task: string,
    context: Message[]
  ): Promise<CodeSolution> {
    const startTime = Date.now()

    const prompt = `Generate a solution for the following coding task. 
    Provide the code and a detailed explanation.
    Task: ${task}`

    const response = await llmManager.sendMessage(prompt, context)

    return {
      code: this.extractCode(response),
      explanation: this.extractExplanation(response),
      confidence: 0.8,
      metadata: {
        model: modelId,
        generationTime: Date.now() - startTime,
        iterations: 1,
      },
    }
  }

  private async validateSolution(
    solution: CodeSolution,
    otherSolutions: CodeSolution[]
  ): Promise<ValidationResult> {
    const validationPrompt = `Validate the following code solution:
    ${solution.code}
    
    Consider:
    1. Correctness
    2. Efficiency
    3. Best practices
    4. Edge cases
    
    Compare with alternative solutions:
    ${otherSolutions.map(s => s.code).join('\n\n')}
    
    Provide a detailed analysis.`

    const response = await llmManager.sendMessage(validationPrompt)

    return this.parseValidationResponse(response)
  }

  private async combineAndImproveSolutions(
    solutions: CodeSolution[],
    validationResults: ValidationResult[]
  ): Promise<CodeSolution> {
    // Sort solutions by validation score
    const rankedSolutions = solutions
      .map((solution, index) => ({
        solution,
        validation: validationResults[index],
      }))
      .sort((a, b) => b.validation.score - a.validation.score)

    const bestSolution = rankedSolutions[0].solution

    // Collect all unique suggestions across all validations
    const allSuggestions = validationResults.flatMap(v => v.suggestions).filter(Boolean)

    // Deduplicate suggestions based on similarity
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions)

    if (uniqueSuggestions.length === 0) {
      return bestSolution
    }

    // Extract insights from top-performing solutions (not just the best)
    const topSolutions = rankedSolutions
      .slice(0, Math.min(3, rankedSolutions.length))
      .filter(rs => rs.validation.score >= 0.5) // Only include reasonably good solutions

    const alternativeApproaches = topSolutions
      .slice(1) // Skip the best solution
      .map(rs => `Alternative approach from ${rs.solution.metadata.model}:\n${rs.solution.code}`)
      .join('\n\n')

    // Generate improved version incorporating suggestions and alternative insights
    const improvementPrompt = `Improve the following code based on these suggestions and alternative approaches:
    
    Best solution code:
    ${bestSolution.code}
    
    Suggested improvements:
    ${uniqueSuggestions.join('\n')}
    
    ${alternativeApproaches ? `Alternative approaches to consider:\n${alternativeApproaches}\n` : ''}
    
    Provide the improved code that incorporates the best aspects from all sources, with explanations for changes.`

    const improvedResponse = await llmManager.sendMessage(improvementPrompt)

    return {
      ...bestSolution,
      code: this.extractCode(improvedResponse),
      explanation: this.extractExplanation(improvedResponse),
      metadata: {
        ...bestSolution.metadata,
        iterations: bestSolution.metadata.iterations + 1,
        mergedFrom: topSolutions.map(rs => rs.solution.metadata.model),
        suggestionsApplied: uniqueSuggestions.length,
      },
    }
  }

  private deduplicateSuggestions(suggestions: string[]): string[] {
    // Remove duplicate or very similar suggestions
    const unique: string[] = []
    const seen = new Set<string>()

    for (const suggestion of suggestions) {
      const normalized = suggestion.toLowerCase().trim()
      // Check for exact duplicates or very similar suggestions (>80% overlap)
      const isDuplicate = Array.from(seen).some(seenSuggestion => {
        const similarity = this.calculateStringSimilarity(normalized, seenSuggestion)
        return similarity > 0.8
      })

      if (!isDuplicate) {
        unique.push(suggestion)
        seen.add(normalized)
      }
    }

    return unique
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity based on word sets
    const words1 = new Set(str1.split(/\s+/))
    const words2 = new Set(str2.split(/\s+/))

    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])

    return union.size > 0 ? intersection.size / union.size : 0
  }

  private extractCode(response: string): string {
    // Extract code blocks between backticks or specific markers
    const codeRegex = /```(?:\w+)?\s*([\s\S]*?)```/g
    const matches = [...response.matchAll(codeRegex)]
    return matches.map(m => m[1].trim()).join('\n\n')
  }

  private extractExplanation(response: string): string {
    // Remove code blocks and clean up the remaining text
    return response.replace(/```[\s\S]*?```/g, '').trim()
  }

  private parseValidationResponse(response: string): ValidationResult {
    // Parse the validation response into structured format
    // This is a simplified implementation
    const hasIssues =
      response.toLowerCase().includes('issue') || response.toLowerCase().includes('problem')

    return {
      isValid: !hasIssues,
      issues: this.extractListItems(response, 'issue'),
      suggestions: this.extractListItems(response, 'suggest'),
      score: this.calculateValidationScore(response),
    }
  }

  private extractListItems(text: string, keyword: string): string[] {
    const lines = text.split('\n')
    return lines
      .filter(
        line =>
          line.toLowerCase().includes(keyword) && (line.startsWith('-') || line.startsWith('*'))
      )
      .map(line => line.replace(/^[-*]\s*/, '').trim())
  }

  private calculateValidationScore(response: string): number {
    // Calculate a score based on the validation response
    // This is a simplified scoring mechanism
    const positiveIndicators = ['correct', 'efficient', 'good', 'optimal', 'clean']
    const negativeIndicators = ['issue', 'problem', 'improve', 'incorrect', 'bug']

    const text = response.toLowerCase()
    const positiveCount = positiveIndicators.filter(word => text.includes(word)).length
    const negativeCount = negativeIndicators.filter(word => text.includes(word)).length

    return Math.max(
      0,
      Math.min(1, (positiveCount - negativeCount * 0.5) / positiveIndicators.length)
    )
  }
}
