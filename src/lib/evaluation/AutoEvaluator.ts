import { Agent, Message } from '../../types'
import { memoryManager } from '../memory'

interface ScoringPoint {
  id: string
  description: string
  weight: number
  criteria: string
  evaluationCode?: string
}

interface EvaluationResult {
  score: number
  maxScore: number
  details: {
    pointId: string
    score: number
    reason: string
  }[]
}

export class AutoEvaluator {
  private static instance: AutoEvaluator
  private scoringPoints: Map<string, ScoringPoint> = new Map()

  private constructor() {}

  static getInstance(): AutoEvaluator {
    if (!AutoEvaluator.instance) {
      AutoEvaluator.instance = new AutoEvaluator()
    }
    return AutoEvaluator.instance
  }

  registerScoringPoint(point: ScoringPoint): void {
    this.scoringPoints.set(point.id, point)
  }

  async evaluateAgent(
    agent: Agent,
    messages: Message[],
    context: Record<string, unknown>
  ): Promise<EvaluationResult> {
    const results = {
      score: 0,
      maxScore: 0,
      details: [],
    }

    for (const point of this.scoringPoints.values()) {
      const isMatch = point.evaluationCode
        ? await this.evaluateWithCode(point.evaluationCode, messages, context)
        : await this.evaluateWithCriteria(point.criteria, messages, context)

      const pointScore = isMatch ? point.weight : 0
      results.score += pointScore
      results.maxScore += point.weight
      results.details.push({
        pointId: point.id,
        score: pointScore,
        reason: isMatch ? 'Criteria met' : 'Criteria not met',
      })
    }

    // Store evaluation result
    await memoryManager.add({
      type: 'agent_evaluation',
      content: JSON.stringify({
        agentId: agent.id,
        timestamp: Date.now(),
        results,
      }),
      tags: ['evaluation', agent.id],
    })

    return results
  }

  private async evaluateWithCode(
    code: string,
    messages: Message[],
    context: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // In a real implementation, we would use a sandboxed environment
      // to execute the evaluation code safely
      const fn = new Function('messages', 'context', code)
      return fn(messages, context)
    } catch (error) {
      console.error('Error evaluating with code:', error)
      return false
    }
  }

  private async evaluateWithCriteria(
    criteria: string,
    messages: Message[],
    context: Record<string, unknown>
  ): Promise<boolean> {
    // In a real implementation, we would use an LLM to evaluate
    // the criteria against the messages and context
    return false
  }
}
