import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ToolTestRunner } from '../../lib/testing/ToolTestRunner'
import { TestUtils } from '../../lib/testing/TestUtils'
import { monitoring } from '../../lib/monitoring/MonitoringSystem'
import type { Tool, TestResult } from '../../types'

describe('ToolTestRunner', () => {
  let toolTestRunner: ToolTestRunner
  const mockTool: Tool = {
    name: 'test-tool',
    description: 'Test tool',
    execute: vi.fn(),
  }

  beforeEach(() => {
    toolTestRunner = ToolTestRunner.getInstance()
    vi.spyOn(monitoring, 'recordToolCreation').mockImplementation(() => {})
    vi.spyOn(TestUtils, 'validateTool').mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      performance: { executionTime: 100 },
    })
    vi.spyOn(TestUtils, 'benchmarkTool').mockResolvedValue({
      successRate: 0.95,
      averageExecutionTime: 50,
      averageMemoryUsage: 1000,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ToolTestRunner.getInstance()
      const instance2 = ToolTestRunner.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('registerTestSuite', () => {
    it('should register a test suite successfully', async () => {
      const suite = {
        name: 'test-suite',
        shouldRun: vi.fn().mockReturnValue(true),
        runTests: vi.fn().mockResolvedValue([]),
      }

      await toolTestRunner.registerTestSuite(suite)
      const results = await toolTestRunner.runTests(mockTool)
      expect(suite.shouldRun).toHaveBeenCalledWith(mockTool)
    })
  })

  describe('runTests', () => {
    it('should run validation tests', async () => {
      const results = await toolTestRunner.runTests(mockTool)
      expect(TestUtils.validateTool).toHaveBeenCalledWith(mockTool)
      expect(results[0].name).toBe('Validation Test')
      expect(results[0].passed).toBe(true)
    })

    it('should run benchmark tests', async () => {
      const results = await toolTestRunner.runTests(mockTool)
      expect(TestUtils.benchmarkTool).toHaveBeenCalledWith(mockTool)
      expect(results[1].name).toBe('Benchmark Test')
      expect(results[1].passed).toBe(true)
    })

    it('should handle test failures', async () => {
      vi.spyOn(TestUtils, 'validateTool').mockResolvedValueOnce({
        valid: false,
        errors: ['Test error'],
        warnings: [],
        performance: { executionTime: 100 },
      })

      const results = await toolTestRunner.runTests(mockTool)
      expect(results[0].passed).toBe(false)
      expect(results[0].errors).toContain('Test error')
    })

    it('should record metrics', async () => {
      await toolTestRunner.runTests(mockTool)
      expect(monitoring.recordToolCreation).toHaveBeenCalled()
    })
  })

  describe('createTestReport', () => {
    it('should generate a report with correct format', async () => {
      const testResults: TestResult[] = [
        {
          name: 'Test 1',
          passed: true,
          errors: [],
          warnings: [],
          performance: { executionTime: 100 },
        },
        {
          name: 'Test 2',
          passed: false,
          errors: ['Error 1'],
          warnings: ['Warning 1'],
          performance: { executionTime: 200 },
        },
      ]

      const report = await toolTestRunner.createTestReport(testResults)
      expect(report).toContain('# Tool Test Report')
      expect(report).toContain('Success Rate: 50.00%')
      expect(report).toContain('Error 1')
      expect(report).toContain('Warning 1')
    })

    it('should handle empty test results', async () => {
      const report = await toolTestRunner.createTestReport([])
      expect(report).toContain('Total Tests: 0')
    })

    it('should include performance metrics', async () => {
      const testResults: TestResult[] = [
        {
          name: 'Performance Test',
          passed: true,
          errors: [],
          warnings: [],
          performance: {
            executionTime: 100,
            memoryUsage: 1000,
            successRate: 0.95,
          },
        },
      ]

      const report = await toolTestRunner.createTestReport(testResults)
      expect(report).toContain('Execution Time: 100.00ms')
      expect(report).toContain('Memory Usage: 1000.00MB')
      expect(report).toContain('Success Rate: 95.00%')
    })
  })
})
