import { TestSuite, Tool, TestResult } from '../../types'
import { monitoring } from '../../monitoring/MonitoringSystem'

export class ToolCreationTestSuite implements TestSuite {
  name = 'Tool Creation Tests'

  shouldRun(tool: Tool): boolean {
    return true // Run for all tools
  }

  async runTests(tool: Tool): Promise<TestResult[]> {
    const results: TestResult[] = []

    // Test 1: Parameter Validation
    results.push(await this.testParameterValidation(tool))

    // Test 2: Error Handling
    results.push(await this.testErrorHandling(tool))

    // Test 3: Performance Under Load
    results.push(await this.testPerformanceUnderLoad(tool))

    // Test 4: Memory Management
    results.push(await this.testMemoryManagement(tool))

    // Test 5: Concurrent Execution
    results.push(await this.testConcurrentExecution(tool))

    return results
  }

  private async testParameterValidation(tool: Tool): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test required parameters
      if (tool.parameters) {
        const requiredParams = Object.entries(tool.parameters).filter(
          ([_, param]) => param.required
        )

        // Test missing required parameters
        const missingParams = requiredParams.map(([name]) => name)
        if (missingParams.length > 0) {
          const result = await tool.execute({})
          errors.push(
            `Tool should fail when required parameters are missing: ${missingParams.join(', ')}`
          )
        }

        // Test invalid parameter types
        for (const [name, param] of Object.entries(tool.parameters)) {
          const invalidValue = this.getInvalidValueForType(param.type)
          const testInput = { [name]: invalidValue }
          try {
            await tool.execute(testInput)
            errors.push(`Tool should validate parameter type for ${name}`)
          } catch (error) {
            // Expected error
          }
        }
      }
    } catch (error) {
      errors.push(`Parameter validation test failed: ${error.message}`)
    }

    return {
      name: 'Parameter Validation',
      passed: errors.length === 0,
      errors,
      warnings,
      performance: {
        executionTime: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    }
  }

  private async testErrorHandling(tool: Tool): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Test error cases
      const errorCases = [
        { case: 'null input', input: null },
        { case: 'undefined input', input: undefined },
        { case: 'empty object', input: {} },
        { case: 'invalid JSON', input: '{invalid}' },
        { case: 'array instead of object', input: [] },
      ]

      for (const errorCase of errorCases) {
        try {
          await tool.execute(errorCase.input)
          errors.push(`Tool should handle ${errorCase.case} gracefully`)
        } catch (error) {
          if (!error.message) {
            errors.push(`Tool should provide error message for ${errorCase.case}`)
          }
        }
      }
    } catch (error) {
      errors.push(`Error handling test failed: ${error.message}`)
    }

    return {
      name: 'Error Handling',
      passed: errors.length === 0,
      errors,
      warnings,
      performance: {
        executionTime: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    }
  }

  private async testPerformanceUnderLoad(tool: Tool): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const iterations = 100
      const maxExecutionTime = 1000 // 1 second
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const iterationStart = Date.now()
        await tool.execute(tool.testInput)
        times.push(Date.now() - iterationStart)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const maxTime = Math.max(...times)

      if (avgTime > maxExecutionTime) {
        warnings.push(`Average execution time (${avgTime}ms) exceeds ${maxExecutionTime}ms`)
      }

      if (maxTime > maxExecutionTime * 2) {
        warnings.push(`Maximum execution time (${maxTime}ms) is more than twice the limit`)
      }
    } catch (error) {
      errors.push(`Performance test failed: ${error.message}`)
    }

    return {
      name: 'Performance Under Load',
      passed: errors.length === 0,
      errors,
      warnings,
      performance: {
        executionTime: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    }
  }

  private async testMemoryManagement(tool: Tool): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const iterations = 50
      const maxMemoryIncrease = 50 // MB
      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024

      for (let i = 0; i < iterations; i++) {
        await tool.execute(tool.testInput)

        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024
      const memoryIncrease = finalMemory - initialMemory

      if (memoryIncrease > maxMemoryIncrease) {
        warnings.push(
          `Memory usage increased by ${memoryIncrease.toFixed(2)}MB after ${iterations} iterations`
        )
      }
    } catch (error) {
      errors.push(`Memory management test failed: ${error.message}`)
    }

    return {
      name: 'Memory Management',
      passed: errors.length === 0,
      errors,
      warnings,
      performance: {
        executionTime: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    }
  }

  private async testConcurrentExecution(tool: Tool): Promise<TestResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const concurrentExecutions = 10
      const executions = Array(concurrentExecutions)
        .fill(null)
        .map(() => tool.execute(tool.testInput))

      const results = await Promise.allSettled(executions)
      const failures = results.filter(r => r.status === 'rejected')

      if (failures.length > 0) {
        errors.push(
          `${failures.length} out of ${concurrentExecutions} concurrent executions failed`
        )
      }
    } catch (error) {
      errors.push(`Concurrent execution test failed: ${error.message}`)
    }

    return {
      name: 'Concurrent Execution',
      passed: errors.length === 0,
      errors,
      warnings,
      performance: {
        executionTime: Date.now() - startTime,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    }
  }

  private getInvalidValueForType(type: string): any {
    switch (type) {
      case 'string':
        return 123
      case 'number':
        return 'not a number'
      case 'boolean':
        return 'not a boolean'
      case 'object':
        return 'not an object'
      case 'array':
        return {}
      default:
        return null
    }
  }
}

export const toolCreationTests = new ToolCreationTestSuite()
