import { Tool, ToolValidationResult } from '../types'
import { monitoring } from '../monitoring/MonitoringSystem'

export class TestUtils {
  static async validateTool(tool: Tool): Promise<ToolValidationResult> {
    const startTime = Date.now()
    const results: ToolValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      performance: {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
      },
    }

    try {
      // Validate tool structure
      if (!tool.name) {
        results.errors.push('Tool must have a name')
      }
      if (!tool.description) {
        results.errors.push('Tool must have a description')
      }
      if (!tool.execute || typeof tool.execute !== 'function') {
        results.errors.push('Tool must have an execute function')
      }

      // Validate parameters
      if (tool.parameters) {
        for (const [name, param] of Object.entries(tool.parameters)) {
          if (!param.type) {
            results.errors.push(`Parameter ${name} must have a type`)
          }
          if (param.required && !param.description) {
            results.errors.push(`Required parameter ${name} must have a description`)
          }
        }
      }

      // Test execution if possible
      if (tool.execute && tool.testInput) {
        const execStartTime = process.hrtime()
        const execStartUsage = process.cpuUsage()

        try {
          await tool.execute(tool.testInput)
        } catch (error) {
          results.errors.push(`Execution failed: ${error.message}`)
        }

        const execEndUsage = process.cpuUsage(execStartUsage)
        const execEndTime = process.hrtime(execStartTime)

        results.performance = {
          executionTime: execEndTime[0] * 1000 + execEndTime[1] / 1000000,
          memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
          cpuUsage: (execEndUsage.user + execEndUsage.system) / 1000000,
        }

        // Performance warnings
        if (results.performance.executionTime > 1000) {
          results.warnings.push('Tool execution time exceeds 1 second')
        }
        if (results.performance.memoryUsage > 100) {
          results.warnings.push('Tool memory usage exceeds 100MB')
        }
      }

      // Security validation
      if (tool.permissions) {
        const restrictedPermissions = ['system', 'network', 'file']
        for (const permission of tool.permissions) {
          if (restrictedPermissions.includes(permission)) {
            results.warnings.push(`Tool requires sensitive permission: ${permission}`)
          }
        }
      }

      results.valid = results.errors.length === 0
    } catch (error) {
      results.valid = false
      results.errors.push(`Validation failed: ${error.message}`)
    }

    const duration = Date.now() - startTime
    monitoring.recordToolCreation(results.valid, duration)

    return results
  }

  static async benchmarkTool(
    tool: Tool,
    iterations: number = 10
  ): Promise<{
    averageExecutionTime: number
    maxExecutionTime: number
    minExecutionTime: number
    averageMemoryUsage: number
    successRate: number
  }> {
    const times: number[] = []
    const memoryUsages: number[] = []
    let successCount = 0

    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime()
      const startMemory = process.memoryUsage().heapUsed

      try {
        await tool.execute(tool.testInput)
        successCount++
      } catch (error) {
        console.error(`Iteration ${i} failed:`, error)
      }

      const endTime = process.hrtime(startTime)
      const endMemory = process.memoryUsage().heapUsed

      times.push(endTime[0] * 1000 + endTime[1] / 1000000)
      memoryUsages.push((endMemory - startMemory) / 1024 / 1024)
    }

    return {
      averageExecutionTime: times.reduce((a, b) => a + b, 0) / times.length,
      maxExecutionTime: Math.max(...times),
      minExecutionTime: Math.min(...times),
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
      successRate: successCount / iterations,
    }
  }
}

export const testUtils = new TestUtils()
