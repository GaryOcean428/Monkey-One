import { Subject } from 'rxjs'
import PQueue from 'p-queue'
import { BaseAgent } from './base'
import { AgentTask, TaskResult } from '../../types'
import { memoryManager } from '../memory'

interface SwarmConfig {
  maxConcurrent: number
  taskTimeout: number
  consensusThreshold: number
}

export class SwarmCoordinator {
  private agents: Map<string, BaseAgent> = new Map()
  private taskQueue: PQueue
  private taskResults = new Subject<TaskResult>()
  private consensusMap = new Map<string, TaskResult[]>()

  constructor(private config: SwarmConfig) {
    this.taskQueue = new PQueue({ concurrency: config.maxConcurrent })

    // Monitor task results for consensus
    this.taskResults.subscribe(result => {
      this.processTaskResult(result)
    })
  }

  registerAgent(agent: BaseAgent) {
    this.agents.set(agent.id, agent)
  }

  async executeTask(task: AgentTask, requiredAgents: string[]): Promise<TaskResult> {
    const selectedAgents = this.selectAgents(requiredAgents)

    // Create parallel task executions
    const executions = selectedAgents.map(agent =>
      this.taskQueue.add(async () => {
        const result = await agent.processTask(task)
        this.taskResults.next({
          taskId: task.id,
          agentId: agent.id,
          result: result,
          timestamp: Date.now(),
        })
        return result
      })
    )

    // Wait for consensus or timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Task execution timeout'))
      }, this.config.taskTimeout)

      this.taskResults.subscribe(result => {
        if (this.hasConsensus(task.id)) {
          clearTimeout(timeout)
          resolve(this.getFinalResult(task.id))
        }
      })
    })
  }

  private selectAgents(requiredTypes: string[]): BaseAgent[] {
    return Array.from(this.agents.values()).filter(agent =>
      requiredTypes.some(type => agent.capabilities.includes(type))
    )
  }

  private processTaskResult(result: TaskResult) {
    const results = this.consensusMap.get(result.taskId) || []
    results.push(result)
    this.consensusMap.set(result.taskId, results)
  }

  private hasConsensus(taskId: string): boolean {
    const results = this.consensusMap.get(taskId) || []
    if (results.length < 2) return false

    // Compare results and check if enough agents agree
    const agreements = results.reduce((acc, curr) => {
      const matching = results.filter(
        r => JSON.stringify(r.result) === JSON.stringify(curr.result)
      ).length
      acc.set(JSON.stringify(curr.result), matching)
      return acc
    }, new Map<string, number>())

    return Array.from(agreements.values()).some(
      count => count / results.length >= this.config.consensusThreshold
    )
  }

  private getFinalResult(taskId: string): TaskResult {
    const results = this.consensusMap.get(taskId) || []

    // Get most common result
    const resultCounts = results.reduce((acc, curr) => {
      const key = JSON.stringify(curr.result)
      acc.set(key, (acc.get(key) || 0) + 1)
      return acc
    }, new Map<string, number>())

    const [mostCommonResult] = Array.from(resultCounts.entries()).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )

    return JSON.parse(mostCommonResult)
  }
}
