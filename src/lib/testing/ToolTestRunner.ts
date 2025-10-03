import { Tool, TestSuite, TestResult } from '../types'
import { TestUtils } from './TestUtils'
import { monitoring } from '../monitoring/MonitoringSystem'

export class ToolTestRunner {
  private static instance: ToolTestRunner
  private testSuites: Map<string, TestSuite> = new Map()

  private constructor() {}

  static getInstance(): ToolTestRunner {
    if (!ToolTestRunner.instance) {
      ToolTestRunner.instance = new ToolTestRunner()
    }
    return ToolTestRunner.instance
  }

  async registerTestSuite(suite: TestSuite) {
    this.testSuites.set(suite.name, suite)
  }

  async runTests(tool: Tool): Promise<TestResult[]> {
    const results: TestResult[] = []
    const startTime = Date.now()

    try {
      // Run validation tests
      const validationResult = await TestUtils.validateTool(tool)
      results.push({
        name: 'Validation Test',
        passed: validationResult.valid,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        performance: validationResult.performance,
      })

      // Run benchmark tests
      const benchmarkResult = await TestUtils.benchmarkTool(tool)
      results.push({
        name: 'Benchmark Test',
        passed: benchmarkResult.successRate > 0.9,
        errors: benchmarkResult.successRate < 0.9 ? ['Success rate below 90%'] : [],
        warnings:
          benchmarkResult.averageExecutionTime > 1000 ? ['High average execution time'] : [],
        performance: {
          executionTime: benchmarkResult.averageExecutionTime,
          memoryUsage: benchmarkResult.averageMemoryUsage,
          successRate: benchmarkResult.successRate,
        },
      })

      // Run custom test suites
      for (const suite of this.testSuites.values()) {
        if (suite.shouldRun(tool)) {
          const suiteStartTime = Date.now()
          try {
            const suiteResults = await suite.runTests(tool)
            results.push({
              name: suite.name,
              passed: suiteResults.every(r => r.passed),
              errors: suiteResults.flatMap(r => r.errors),
              warnings: suiteResults.flatMap(r => r.warnings),
              performance: {
                executionTime: Date.now() - suiteStartTime,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
              },
            })
          } catch (error) {
            results.push({
              name: suite.name,
              passed: false,
              errors: [`Test suite failed: ${error.message}`],
              warnings: [],
              performance: {
                executionTime: Date.now() - suiteStartTime,
                memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
              },
            })
          }
        }
      }

      // Record metrics
      const duration = Date.now() - startTime
      const passed = results.every(r => r.passed)
      monitoring.recordToolCreation(passed, duration)

      return results
    } catch (error) {
      const duration = Date.now() - startTime
      monitoring.recordToolCreation(false, duration)
      throw error
    }
  }

  async createTestReport(results: TestResult[]): Promise<string> {
    const passed = results.filter(r => r.passed).length
    const total = results.length
    const successRate = (passed / total) * 100

    let report = `# Tool Test Report\n\n`
    report += `## Summary\n`
    report += `- Total Tests: ${total}\n`
    report += `- Passed: ${passed}\n`
    report += `- Failed: ${total - passed}\n`
    report += `- Success Rate: ${successRate.toFixed(2)}%\n\n`

    report += `## Test Results\n\n`
    for (const result of results) {
      report += `### ${result.name}\n`
      report += `Status: ${result.passed ? '✅ Passed' : '❌ Failed'}\n\n`

      if (result.errors.length > 0) {
        report += `Errors:\n`
        for (const error of result.errors) {
          report += `- ${error}\n`
        }
        report += '\n'
      }

      if (result.warnings.length > 0) {
        report += `Warnings:\n`
        for (const warning of result.warnings) {
          report += `- ${warning}\n`
        }
        report += '\n'
      }

      if (result.performance) {
        report += `Performance:\n`
        report += `- Execution Time: ${result.performance.executionTime.toFixed(2)}ms\n`
        report += `- Memory Usage: ${result.performance.memoryUsage.toFixed(2)}MB\n`
        if (result.performance.successRate) {
          report += `- Success Rate: ${(result.performance.successRate * 100).toFixed(2)}%\n`
        }
        report += '\n'
      }
    }

    return report
  }
}

export const toolTestRunner = ToolTestRunner.getInstance()
